import type { EventData, AppSettings } from '../types';
import { normalizeEventDates } from '../date-utils';

export async function extractEventData(
  imageDataUrl: string,
  ocrText: string,
  settings: AppSettings
): Promise<EventData> {
  const systemPrompt =
    'You are an expert at extracting structured event data from images. You MUST identify the host/organizer. Output must be raw JSON only, no markdown, no code fences. Always extract host information if it is visible in any form.';

  let promptText =
    'Analyze this event screenshot image and extract all event information.\n\n';
  if (ocrText) {
    promptText += `Here is the extracted text from the image:\n"${ocrText.substring(0, 1000)}"\n\n`;
  }
  promptText +=
    'CRITICAL: Extract the HOST information. The host is the person, organization, or group that is hosting/organizing/presenting the event. Look for:\n';
  promptText +=
    '- Labels like: "Hosted by", "Organized by", "Organised by", "Presented by", "Host:", "Organizer:", "Organiser:", "By:", "From:"\n';
  promptText +=
    '- Social media handles (e.g., @username, @organization)\n';
  promptText +=
    '- Profile names or group names visible on the event post\n';
  promptText +=
    '- Organization/club/department names that appear to be the event creator\n\n';
  promptText += 'Extract ALL fields:\n';
  promptText += '- title: The event name/title (required)\n';
  promptText +=
    '- host: The host/organizer name (CRITICAL - must extract if visible, even from profile name or handle)\n';
  promptText +=
    '- date: Start date in YYYY-MM-DD format (or MM-DD if year is not visible - we will default to current year)\n';
  promptText +=
    '- time: Start time in HH:MM format (24-hour format)\n';
  promptText +=
    '- endDate: End date in YYYY-MM-DD format (or MM-DD if year is not visible - we will default to current year). If not different from start date, omit this field.\n';
  promptText +=
    '- endTime: End time in HH:MM format (24-hour format)\n';
  promptText += '- location: Venue or location of the event\n';
  promptText +=
    '- description: Any additional event details or description\n\n';
  promptText +=
    'Return ONLY valid JSON with no markdown, no code blocks, no explanation.\n';
  promptText +=
    'Format: {"title": "...", "host": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "endDate": "...", "endTime": "...", "location": "...", "description": "..."}\n\n';
  promptText +=
    'IMPORTANT: Do NOT leave host as empty string if you can see any host information in the image or text. Extract names, handles, or organization names that appear to be hosting the event.';

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

  let eventData = JSON.parse(content) as EventData;

  // Normalize dates
  eventData = normalizeEventDates(eventData);

  return eventData;
}

