/**
 * Gmail API Integration
 * 
 * This module handles Gmail OAuth and email parsing for task extraction.
 * 
 * Setup required:
 * 1. Enable Gmail API in Google Cloud Console
 * 2. Add Gmail scope to OAuth consent screen: https://www.googleapis.com/auth/gmail.readonly
 * 3. Use the same Google OAuth credentials as Google Calendar
 * 4. Add redirect URI: http://localhost:3000/api/auth/gmail/callback
 */

import type { AppSettings, TaskPriority } from './types';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth/gmail/callback`
    : '';

const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export interface GmailAuth {
  accessToken: string;
  expiresAt: number;
}

/**
 * Get stored Gmail access token (checks both localStorage and store)
 */
export function getStoredAuth(): GmailAuth | null {
  if (typeof window === 'undefined') return null;

  // Check localStorage first (for backward compatibility)
  const stored = localStorage.getItem('gmail_auth');
  if (!stored) return null;

  try {
    const auth: GmailAuth = JSON.parse(stored);
    // Check if token is expired (with 5 minute buffer)
    if (Date.now() >= auth.expiresAt - 5 * 60 * 1000) {
      localStorage.removeItem('gmail_auth');
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

/**
 * Store Gmail access token (both localStorage and store)
 */
export function storeAuth(auth: GmailAuth): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gmail_auth', JSON.stringify(auth));
  
  // Also sync with store if available
  if (typeof window !== 'undefined') {
    // Dynamic import to avoid circular dependency
    import('./store').then(({ useAppStore }) => {
      useAppStore.getState().setGmailAuth(auth);
    });
  }
}

/**
 * Clear stored Gmail auth
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('gmail_auth');
  
  // Also clear from store
  if (typeof window !== 'undefined') {
    import('./store').then(({ useAppStore }) => {
      useAppStore.getState().setGmailAuth(null);
    });
  }
}

/**
 * Check if Gmail is authenticated
 */
export function isGmailAuthenticated(): boolean {
  return getStoredAuth() !== null;
}

/**
 * Initiate Gmail OAuth flow
 */
export function initiateGmailAuth(): void {
  if (!GOOGLE_CLIENT_ID) {
    alert('Gmail integration is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.');
    return;
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Search Gmail for emails that might contain tasks
 */
export async function searchGmailForTasks(
  query: string = 'is:unread subject:(todo OR task OR reminder OR action OR follow-up OR followup)',
  maxResults: number = 10
): Promise<Array<{
  id: string;
  subject: string;
  snippet: string;
  from: string;
  date: string;
  body?: string;
}>> {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error('Gmail not authenticated');
  }

  // First, search for message IDs
  const searchResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  );

  if (!searchResponse.ok) {
    if (searchResponse.status === 401) {
      clearAuth();
      throw new Error('Authentication expired. Please reconnect to Gmail.');
    }
    const error = await searchResponse.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to search Gmail');
  }

  const searchData = await searchResponse.json();
  if (!searchData.messages || searchData.messages.length === 0) {
    return [];
  }

  // Fetch full message details
  const messages = await Promise.all(
    searchData.messages.map(async (msg: { id: string }) => {
      try {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          }
        );

        if (!msgResponse.ok) {
          return null;
        }

        const msgData = await msgResponse.json();
        const headers = msgData.payload?.headers || [];
        
        const getHeader = (name: string) => 
          headers.find((h: { name: string; value: string }) => h.name === name)?.value || '';

        return {
          id: msg.id,
          subject: getHeader('Subject'),
          snippet: msgData.snippet || '',
          from: getHeader('From'),
          date: getHeader('Date'),
        };
      } catch {
        return null;
      }
    })
  );

  return messages.filter((msg): msg is NonNullable<typeof msg> => msg !== null);
}

/**
 * Pull tasks from Gmail and extract them using AI
 */
export async function pullTasksFromGmail(
  settings: AppSettings,
  query: string = 'is:unread subject:(todo OR task OR reminder OR action OR follow-up OR followup)',
  maxResults: number = 10,
  useAI: boolean = true
): Promise<Array<{
  title: string;
  description?: string;
  dueDate: string | null;
  priority: TaskPriority;
}>> {
  const emails = await searchGmailForTasks(query, maxResults);
  
  if (emails.length === 0) {
    return [];
  }

  const tasks = await Promise.all(
    emails.map(async (email) => {
      try {
        if (useAI) {
          // Get full email body for AI parsing
          const body = await getEmailBody(email.id);
          return await parseEmailAsTaskWithAI(
            email.subject,
            email.snippet,
            body,
            email.from,
            email.date,
            settings
          );
        } else {
          // Use simple parsing
          return parseEmailAsTask(email.subject, email.snippet, email.from, email.date);
        }
      } catch (error) {
        console.error(`Failed to parse email ${email.id}:`, error);
        // Fallback to simple parsing
        return parseEmailAsTask(email.subject, email.snippet, email.from, email.date);
      }
    })
  );

  return tasks;
}

/**
 * Get full email body text
 */
export async function getEmailBody(messageId: string): Promise<string> {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error('Gmail not authenticated');
  }

  const msgResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  );

  if (!msgResponse.ok) {
    throw new Error('Failed to fetch email body');
  }

  const msgData = await msgResponse.json();
  
  // Extract plain text from email body
  let bodyText = '';
  const parts = msgData.payload?.parts || [];
  
  // Browser-compatible base64 decoding
  function base64Decode(base64: string): string {
    try {
      // Replace URL-safe base64 characters
      const base64Url = base64.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      const padded = base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4);
      // Decode using atob (browser API)
      const binary = atob(padded);
      // Convert to UTF-8
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      return '';
    }
  }

  function extractTextFromPart(part: any): string {
    if (part.mimeType === 'text/plain') {
      if (part.body?.data) {
        return base64Decode(part.body.data);
      }
    } else if (part.mimeType === 'text/html') {
      // Extract text from HTML (basic)
      if (part.body?.data) {
        const html = base64Decode(part.body.data);
        // Simple HTML tag removal
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    } else if (part.parts) {
      return part.parts.map(extractTextFromPart).join(' ');
    }
    return '';
  }

  if (msgData.payload?.body?.data) {
    // Single part message
    bodyText = base64Decode(msgData.payload.body.data);
  } else if (parts.length > 0) {
    // Multi-part message
    bodyText = parts.map(extractTextFromPart).join(' ');
  }

  return bodyText;
}

/**
 * Parse email content using AI to extract task information
 */
export async function parseEmailAsTaskWithAI(
  subject: string,
  snippet: string,
  body: string,
  from: string,
  date: string,
  settings: AppSettings
): Promise<{
  title: string;
  description?: string;
  dueDate: string | null;
  priority: TaskPriority;
}> {
  const systemPrompt = `You are an expert at extracting task information from emails. Analyze the email content and extract actionable tasks with due dates and priorities. Output must be raw JSON only, no markdown, no code fences.`;

  const emailContent = `Subject: ${subject}\nFrom: ${from}\nDate: ${date}\n\n${body || snippet}`.substring(0, 4000);

  let promptText = `Analyze this email and extract task information:\n\n${emailContent}\n\n`;
  promptText += `Extract the following fields:\n`;
  promptText += `- title: A clear, concise task title (required). If the email contains multiple tasks, extract the most important one.\n`;
  promptText += `- description: A brief description of the task, including relevant context from the email (optional)\n`;
  promptText += `- dueDate: Due date in YYYY-MM-DD format if mentioned (e.g., "due by Friday", "deadline: 2025-01-15", "by next week"). Use null if no date is mentioned.\n`;
  promptText += `- priority: Priority level as "p1" (urgent/critical), "p2" (high), "p3" (medium), or "p4" (low/default). Consider keywords like "urgent", "asap", "important", "high priority", "reminder", "follow up".\n\n`;
  promptText += `Return ONLY valid JSON with no markdown, no code blocks, no explanation.\n`;
  promptText += `Format: {"title": "...", "description": "...", "dueDate": "YYYY-MM-DD" or null, "priority": "p1"|"p2"|"p3"|"p4"}`;

  let response: Response;

  if (settings.provider === 'openrouter') {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openrouterKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'LifeCapture Gmail Task Extractor',
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: promptText,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });
  } else {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: promptText,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        errorData.error ||
        errorData.message ||
        `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();
  let content: string;

  if (settings.provider === 'openrouter') {
    content = data.choices?.[0]?.message?.content || data.content || '';
  } else {
    content = data.choices[0].message.content;
  }

  // Extract JSON from markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch) content = jsonMatch[1];

  const taskData = JSON.parse(content) as {
    title: string;
    description?: string;
    dueDate: string | null;
    priority: TaskPriority;
  };

  // Validate and normalize
  if (!taskData.title) {
    taskData.title = subject.replace(/^(Re:|Fwd?:|Fw:)\s*/i, '').trim() || 'Untitled Task';
  }

  if (taskData.dueDate) {
    // Ensure date is in YYYY-MM-DD format
    try {
      const parsed = new Date(taskData.dueDate);
      if (!isNaN(parsed.getTime())) {
        taskData.dueDate = parsed.toISOString().split('T')[0];
      } else {
        taskData.dueDate = null;
      }
    } catch {
      taskData.dueDate = null;
    }
  }

  // Ensure priority is valid
  if (!['p1', 'p2', 'p3', 'p4'].includes(taskData.priority)) {
    taskData.priority = 'p4';
  }

  // Add email metadata to description
  if (taskData.description) {
    taskData.description = `${taskData.description}\n\nFrom: ${from}`;
  } else {
    taskData.description = `From: ${from}`;
  }

  return taskData;
}

/**
 * Parse email content to extract task information (fallback, non-AI version)
 */
export function parseEmailAsTask(
  subject: string,
  snippet: string,
  from: string,
  date: string
): {
  title: string;
  description?: string;
  dueDate: string | null;
  priority: 'p1' | 'p2' | 'p3' | 'p4';
} {
  // Extract title from subject (remove common prefixes)
  let title = subject
    .replace(/^(Re:|Fwd?:|Fw:)\s*/i, '')
    .replace(/^\[.*?\]\s*/, '')
    .trim();

  if (!title) {
    title = snippet.substring(0, 50) || 'Untitled Task';
  }

  // Try to extract due date from subject or snippet
  let dueDate: string | null = null;
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(today|tomorrow|next week|next month)/i,
    /(due|by)\s+(\d{1,2}\/\d{1,2})/i,
  ];

  const fullText = `${subject} ${snippet}`;
  for (const pattern of datePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const matchedDate = match[1] || match[2];
      if (matchedDate.toLowerCase() === 'today') {
        dueDate = new Date().toISOString().split('T')[0];
      } else if (matchedDate.toLowerCase() === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDate = tomorrow.toISOString().split('T')[0];
      } else {
        try {
          const parsed = new Date(matchedDate);
          if (!isNaN(parsed.getTime())) {
            dueDate = parsed.toISOString().split('T')[0];
          }
        } catch {
          // Ignore parse errors
        }
      }
      if (dueDate) break;
    }
  }

  // Determine priority based on keywords
  let priority: 'p1' | 'p2' | 'p3' | 'p4' = 'p4';
  const lowerText = fullText.toLowerCase();
  if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('important')) {
    priority = 'p1';
  } else if (lowerText.includes('high priority') || lowerText.includes('soon')) {
    priority = 'p2';
  } else if (lowerText.includes('reminder') || lowerText.includes('follow up')) {
    priority = 'p3';
  }

  // Build description from snippet and sender
  const description = snippet
    ? `${snippet.substring(0, 200)}${snippet.length > 200 ? '...' : ''}\n\nFrom: ${from}`
    : `From: ${from}`;

  return {
    title,
    description,
    dueDate,
    priority,
  };
}

