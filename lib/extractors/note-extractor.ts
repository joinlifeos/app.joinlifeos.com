import type { NoteData, AppSettings } from '../types';

export async function extractNoteData(
    imageDataUrl: string,
    ocrText: string,
    settings: AppSettings
): Promise<NoteData> {
    const systemPrompt =
        'You are an expert at extracting structured notes and knowledge from images. Output must be raw JSON only, no markdown, no code fences.';

    let promptText =
        'Analyze this image and extract note/knowledge information.\n\n';
    if (ocrText) {
        promptText += `Here is the extracted text from the image:\n"${ocrText.substring(0, 2000)}"\n\n`;
    }
    promptText += 'Extract the following fields:\n';
    promptText += '- title: A concise summary or title of the content (required)\n';
    promptText += '- content: A detailed transcription or summary of the content in markdown format. Preserve structure, lists, and key information. (required)\n';
    promptText += '- tags: An array of relevant tags or keywords (optional)\n';
    promptText += '- source: The source of the information if visible (e.g., "Book Excerpt", "Recipe", "Article") (optional)\n\n';
    promptText +=
        'Return ONLY valid JSON with no markdown, no code blocks, no explanation.\n';
    promptText +=
        'Format: {"title": "...", "content": "...", "tags": ["..."], "source": "..."}\n';

    let response: Response;

    if (settings.provider === 'openrouter') {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${settings.openrouterKey}`,
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
                'X-Title': 'LifeCapture Note Extractor',
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

    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) content = jsonMatch[1];

    return JSON.parse(content) as NoteData;
}
