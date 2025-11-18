import type { VideoData, AppSettings } from '../types';

export async function extractVideoData(
  imageDataUrl: string,
  ocrText: string,
  settings: AppSettings
): Promise<VideoData> {
  const systemPrompt =
    'You are an expert at extracting video information from YouTube and video platform screenshots. Output must be raw JSON only, no markdown, no code fences.';

  let promptText =
    'Analyze this video platform screenshot and extract video information.\n\n';
  if (ocrText) {
    promptText += `Here is the extracted text from the image:\n"${ocrText.substring(0, 1000)}"\n\n`;
  }
  promptText += 'Extract the following fields:\n';
  promptText += '- title: The video title (required)\n';
  promptText += '- channel: The channel/creator name (required)\n';
  promptText +=
    '- url: The full video URL if visible (e.g., https://youtube.com/watch?v=xxxxx)\n';
  promptText += '- description: Video description if visible\n';
  promptText += '- thumbnail: Thumbnail URL if visible\n';
  promptText +=
    '- videoId: YouTube video ID if visible in URL (extract from ?v=xxxxx or /watch?v=xxxxx)\n\n';
  promptText +=
    'Return ONLY valid JSON with no markdown, no code blocks, no explanation.\n';
  promptText +=
    'Format: {"title": "...", "channel": "...", "url": "...", "description": "...", "thumbnail": "...", "videoId": "..."}\n';
  promptText += 'Only include fields that are present in the screenshot.';

  let response: Response;

  if (settings.provider === 'openrouter') {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openrouterKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'LifeCapture Video Extractor',
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
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
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

  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch) content = jsonMatch[1];

  return JSON.parse(content) as VideoData;
}

