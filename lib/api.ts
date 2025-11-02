import type { EventData, AppSettings } from './types';

export async function extractEventFromImage(
  imageDataUrl: string,
  promptText: string,
  settings: AppSettings
): Promise<EventData> {
  const systemPrompt =
    'You are an expert at extracting structured event data from images. You MUST identify the host/organizer. Output must be raw JSON only, no markdown, no code fences. Always extract host information if it is visible in any form.';

  let response: Response;

  if (settings.provider === 'openrouter') {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openrouterKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'SmartCapture Event Extractor',
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
            content: [
              { type: 'text', text: promptText },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
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
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 1000,
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

  return JSON.parse(content) as EventData;
}

export async function extractTextWithOCR(imageDataUrl: string): Promise<string> {
  if (typeof window === 'undefined') return '';

  const Tesseract = await import('tesseract.js');
  try {
    const result = await Tesseract.recognize(imageDataUrl, 'eng');
    return (result.data?.text || '').trim();
  } catch (error) {
    console.warn('OCR extraction failed:', error);
    return '';
  }
}

export function extractHostFromText(text: string): string {
  if (!text) return '';

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const labelPatterns = [
    /hosted\s+by[:\-]?\s*([^\n]+)/i,
    /organized\s+by[:\-]?\s*([^\n]+)/i,
    /organised\s+by[:\-]?\s*([^\n]+)/i,
    /presented\s+by[:\-]?\s*([^\n]+)/i,
    /^host[:\-]?\s*(.+)$/im,
    /^organizer[:\-]?\s*(.+)$/im,
    /^organiser[:\-]?\s*(.+)$/im,
    /\bby[:\-]?\s*([^\n]+)/i,
    /from[:\-]?\s*([^\n]+)/i,
  ];

  for (const line of lines) {
    for (const pattern of labelPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const host = sanitizeHost(match[1]);
        if (host && host.length > 1) {
          return host;
        }
      }
    }
  }

  // Look for @handles
  const handleMatches = text.match(/@[A-Za-z0-9_.-]+/g);
  if (handleMatches && handleMatches.length > 0) {
    for (const handle of handleMatches) {
      if (!handle.includes('http') && handle.length > 1) {
        return sanitizeHost(handle);
      }
    }
  }

  // Look for profile/username patterns
  const postedByMatch = text.match(/(?:posted|created|event)\s+(?:by|from)[:\-]?\s*([^\n,]+)/i);
  if (postedByMatch && postedByMatch[1]) {
    return sanitizeHost(postedByMatch[1]);
  }

  // Fallback: organization names
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    if (
      /club|society|association|department|lab|center|centre|team|group|chapter|union|university|college|school/i.test(
        line
      )
    ) {
      if (line.length < 80 && line.length > 2) {
        return sanitizeHost(line);
      }
    }
    if (
      line.length > 2 &&
      line.length < 60 &&
      /^[A-Z][A-Za-z\s&]+$/.test(line) &&
      line.split(/\s+/).length <= 5
    ) {
      return sanitizeHost(line);
    }
  }

  return '';
}

function sanitizeHost(s: string): string {
  return (s || '')
    .replace(/^[-:\s]+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 120);
}

export function generateICS(event: EventData): string {
  const start = new Date(`${event.date}T${event.time}`);
  const end = event.endTime
    ? new Date(`${event.endDate || event.date}T${event.endTime}`)
    : new Date(start.getTime() + 3600000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const esc = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartCapture//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@smartcapture.app`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(event.title)}`,
    event.host && `X-HOST:${esc(event.host)}`,
    event.location && `LOCATION:${esc(event.location)}`,
    event.description && `DESCRIPTION:${esc(event.description)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  return ics;
}

export function downloadICS(ics: string, filename: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

