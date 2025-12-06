import type { AppSettings, ScreenshotType } from './types';
import { extractTextWithOCR } from './api';

export interface ClassificationResult {
  type: ScreenshotType;
  confidence: number;
}

export async function classifyScreenshotType(
  imageDataUrl: string,
  ocrText: string,
  settings: AppSettings
): Promise<ClassificationResult> {
  const systemPrompt = `You are an expert at classifying screenshot images. Analyze the image and OCR text to determine what type of content it contains. 
  
Types to classify:
- event: Calendar events, event invitations, event posters, schedule screenshots; if it's a social media post and has a calendar icon, date, and/or time, it should be classified as event.
- song: Music app interfaces (Spotify, Apple Music, etc.), social media app song posts (TikTok, Instagram, etc.), song info with play buttons, track lists, artist and song name visible. If it's a song but not a music app interface, it should be classified as song. If there is a "Use Audio" or "Add to Spotify" button, it should be classified as song.
- video: YouTube interfaces, video thumbnails, video player screens, channel pages
- restaurant: Restaurant menus, reviews, location markers, food delivery apps, restaurant listings, restaurant posts (TikTok, Instagram, etc.), restaurant info with location and contact information visible
- link: Browser URLs, link previews, website screenshots with URLs visible
- social_post: Social media posts (Twitter/X, Instagram, Facebook, LinkedIn, etc.), platform-specific UI elements; if it's a social media post but not a song, restaurant, event, video, or link, it should be classified as social_post
- note: Informational content, articles, recipes, instructions, diagrams, text snippets, or anything that doesn't fit into event, song, video, restaurant, or social_post.

Return ONLY valid JSON: {"type": "event" | "song" | "video" | "restaurant" | "link" | "social_post" | "note", "confidence": 0.0-1.0}`;

  let promptText = 'Classify this screenshot image.\n\n';
  if (ocrText) {
    promptText += `OCR Text: "${ocrText.substring(0, 500)}"\n\n`;
  }
  promptText +=
    'Analyze the visual elements and text to determine the screenshot type. Consider:\n';
  promptText += '- UI elements (buttons, interfaces, app layouts)\n';
  promptText += '- Text content (dates for events, artist/track for songs, etc.)\n';
  promptText += '- Visual indicators (calendars, play buttons, maps, social media layouts)\n';
  promptText +=
    'Return JSON with type and confidence (0.0-1.0) based on how certain you are.';

  let response: Response;

  if (settings.provider === 'openrouter') {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openrouterKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'LifeCapture Classifier',
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
        max_tokens: 200,
        temperature: 0.2,
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
        max_tokens: 200,
        temperature: 0.2,
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

  const result = JSON.parse(content) as { type: ScreenshotType; confidence: number };

  // Validate type
  const validTypes: ScreenshotType[] = [
    'event',
    'song',
    'video',
    'restaurant',
    'link',
    'social_post',
    'note',
  ];
  if (!validTypes.includes(result.type)) {
    // Default to 'link' if classification fails
    return { type: 'link', confidence: 0.5 };
  }

  return {
    type: result.type,
    confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
  };
}

