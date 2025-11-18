let currentImage = null;
let apiKey = localStorage.getItem('openai_api_key') || '';
let settings = {
    provider: localStorage.getItem('provider') || 'openai',
    openrouterKey: localStorage.getItem('openrouter_key') || '',
    model: localStorage.getItem('model') || 'anthropic/claude-3.5-sonnet'
};

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
    // Check API key based on provider
    const apiKeySection = $('apiKeySection');
    const hasApiKey = settings.provider === 'openai' 
        ? apiKey 
        : settings.openrouterKey;
    
    if (!hasApiKey && apiKeySection) {
        showApiKeyModal(settings.provider);
    }
    
    const browseBtn = $('browseBtn');
    const fileInput = $('fileInput');
    const uploadArea = $('uploadArea');
    const pasteBtn = $('pasteBtn');
    const removeBtn = $('removeBtn');
    const analyzeBtn = $('analyzeBtn');
    const eventForm = $('eventForm');
    const resetBtn = $('resetBtn');
    const saveApiKeyBtn = $('saveApiKeyBtn');
    
    if (browseBtn && fileInput) {
        browseBtn.onclick = () => fileInput.click();
    }
    if (fileInput) {
        fileInput.onchange = handleFileSelect;
    }
    if (uploadArea) {
        uploadArea.ondragover = e => { 
            e.preventDefault(); 
            if (e.target.classList) e.target.classList.add('dragover'); 
        };
        uploadArea.ondragleave = e => { 
            if (e.target.classList) e.target.classList.remove('dragover'); 
        };
        uploadArea.ondrop = handleDrop;
    }
    if (pasteBtn) {
        pasteBtn.onclick = handlePaste;
    }
    if (removeBtn) {
        removeBtn.onclick = resetUpload;
    }
    if (analyzeBtn) {
        analyzeBtn.onclick = analyzeImage;
    }
    if (eventForm) {
        eventForm.onsubmit = handleFormSubmit;
    }
    if (resetBtn) {
        resetBtn.onclick = resetAll;
    }
    if (saveApiKeyBtn) {
        saveApiKeyBtn.onclick = saveApiKey;
    }
    
    // Settings handlers
    const settingsBtn = $('settingsBtn');
    const settingsSection = $('settingsSection');
    const closeSettingsBtn = $('closeSettingsBtn');
    const cancelSettingsBtn = $('cancelSettingsBtn');
    const saveSettingsBtn = $('saveSettingsBtn');
    const providerSelect = $('providerSelect');
    const manageOpenAIKeyBtn = $('manageOpenAIKeyBtn');
    const cancelApiKeyBtn = $('cancelApiKeyBtn');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Settings button clicked');
            console.log('Settings section element:', settingsSection);
            
            // Load settings into UI first
            loadSettingsIntoUI();
            
            // Show the modal
            if (settingsSection) {
                settingsSection.classList.remove('hidden');
                console.log('Settings modal should be visible now');
                console.log('Modal classes:', settingsSection.className);
            } else {
                console.error('Settings section element not found!');
                alert('Settings section not found. Please refresh the page.');
            }
        });
        
        console.log('Settings button handler attached');
    } else {
        console.error('Settings button not found!');
    }
    if (closeSettingsBtn) {
        closeSettingsBtn.onclick = closeSettings;
    }
    if (cancelSettingsBtn) {
        cancelSettingsBtn.onclick = closeSettings;
    }
    if (saveSettingsBtn) {
        saveSettingsBtn.onclick = saveSettings;
    }
    if (providerSelect) {
        providerSelect.onchange = updateProviderUI;
    }
    if (manageOpenAIKeyBtn) {
        manageOpenAIKeyBtn.onclick = () => {
            if (settingsSection) settingsSection.classList.add('hidden');
            showApiKeyModal('openai');
        };
    }
    if (cancelApiKeyBtn) {
        cancelApiKeyBtn.onclick = () => {
            const apiKeySection = $('apiKeySection');
            if (apiKeySection) apiKeySection.classList.add('hidden');
        };
    }
    
    // Initialize UI
    updateProviderUI();
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    file && file.type.startsWith('image/') 
        ? loadImage(file) 
        : toast('Please select a valid image file', 'error');
}

function handleDrop(e) {
    e.preventDefault();
    if (e.target.classList) e.target.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    file && file.type.startsWith('image/')
        ? loadImage(file)
        : toast('Please drop a valid image file', 'error');
}

async function handlePaste() {
    try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
            const imgType = item.types.find(t => t.startsWith('image/'));
            if (imgType) {
                loadImage(await item.getType(imgType));
                return;
            }
        }
        toast('No image in clipboard', 'error');
    } catch {
        toast('Clipboard access failed - try uploading instead', 'error');
    }
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
        currentImage = e.target.result;
        const previewImage = $('previewImage');
        const uploadArea = $('uploadArea');
        const previewArea = $('previewArea');
        const actionSection = $('actionSection');
        
        if (previewImage) previewImage.src = currentImage;
        if (uploadArea) uploadArea.classList.add('hidden');
        if (previewArea) previewArea.classList.remove('hidden');
        if (actionSection) actionSection.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function resetUpload() {
    currentImage = null;
    const previewImage = $('previewImage');
    const fileInput = $('fileInput');
    const uploadArea = $('uploadArea');
    const previewArea = $('previewArea');
    const actionSection = $('actionSection');
    
    if (previewImage) previewImage.src = '';
    if (fileInput) fileInput.value = '';
    if (uploadArea) uploadArea.classList.remove('hidden');
    if (previewArea) previewArea.classList.add('hidden');
    if (actionSection) actionSection.classList.add('hidden');
}

function resetAll() {
    resetUpload();
    const resultSection = $('resultSection');
    const loadingSection = $('loadingSection');
    const eventForm = $('eventForm');
    
    if (resultSection) resultSection.classList.add('hidden');
    if (loadingSection) loadingSection.classList.add('hidden');
    if (eventForm) eventForm.reset();
}

// Settings management functions
function loadSettingsIntoUI() {
    const providerSelect = $('providerSelect');
    const openrouterKeyInput = $('openrouterKeyInput');
    const modelSelect = $('modelSelect');
    
    if (providerSelect) providerSelect.value = settings.provider;
    if (openrouterKeyInput) openrouterKeyInput.value = settings.openrouterKey;
    if (modelSelect) modelSelect.value = settings.model;
    
    updateProviderUI();
}

function updateProviderUI() {
    const providerSelect = $('providerSelect');
    const openaiSettings = $('openaiSettings');
    const openrouterSettings = $('openrouterSettings');
    
    if (!providerSelect) return;
    
    const provider = providerSelect.value;
    if (provider === 'openai') {
        if (openaiSettings) openaiSettings.classList.remove('hidden');
        if (openrouterSettings) openrouterSettings.classList.add('hidden');
    } else {
        if (openaiSettings) openaiSettings.classList.add('hidden');
        if (openrouterSettings) openrouterSettings.classList.remove('hidden');
    }
}

function saveSettings() {
    const providerSelect = $('providerSelect');
    const openrouterKeyInput = $('openrouterKeyInput');
    const modelSelect = $('modelSelect');
    
    if (providerSelect) {
        const newProvider = providerSelect.value;
        settings.provider = newProvider;
        localStorage.setItem('provider', newProvider);
    }
    
    if (openrouterKeyInput) {
        const key = openrouterKeyInput.value.trim();
        if (key) {
            settings.openrouterKey = key;
            localStorage.setItem('openrouter_key', key);
            console.log('Saved OpenRouter key from settings (length:', key.length, ')');
        } else if (settings.provider === 'openrouter' && !settings.openrouterKey) {
            // If OpenRouter is selected but no key, warn user
            toast('OpenRouter API key is required', 'error');
            return;
        }
    }
    
    if (modelSelect) {
        settings.model = modelSelect.value;
        localStorage.setItem('model', settings.model);
    }
    
    // Validate that if OpenRouter is selected, key is provided
    if (settings.provider === 'openrouter' && !settings.openrouterKey) {
        toast('OpenRouter API key is required', 'error');
        return;
    }
    
    closeSettings();
    toast('Settings saved', 'success');
    
    // Refresh UI if needed
    updateProviderUI();
}

function closeSettings() {
    const settingsSection = $('settingsSection');
    if (settingsSection) settingsSection.classList.add('hidden');
}

function showApiKeyModal(providerType) {
    const apiKeySection = $('apiKeySection');
    const apiKeyInput = $('apiKeyInput');
    const apiKeyPromptText = $('apiKeyPromptText');
    const apiKeyNote = $('apiKeyNote');
    const apiKeyLink = $('apiKeyLink');
    
    if (!apiKeySection || !apiKeyInput) return;
    
    if (providerType === 'openai') {
        if (apiKeyPromptText) apiKeyPromptText.textContent = 'To extract event details from images, please enter your OpenAI API key. Your key will be stored locally in your browser.';
        if (apiKeyInput) apiKeyInput.placeholder = 'sk-...';
        if (apiKeyLink) {
            apiKeyLink.textContent = 'OpenAI Platform';
            apiKeyLink.href = 'https://platform.openai.com/api-keys';
        }
    } else {
        if (apiKeyPromptText) apiKeyPromptText.textContent = 'Please enter your OpenRouter API key. Your key will be stored locally in your browser.';
        if (apiKeyInput) apiKeyInput.placeholder = 'sk-or-...';
        if (apiKeyLink) {
            apiKeyLink.textContent = 'OpenRouter';
            apiKeyLink.href = 'https://openrouter.ai/keys';
        }
    }
    
    apiKeySection.classList.remove('hidden');
}

async function analyzeImage() {
    if (!currentImage) return toast('Upload an image first', 'error');
    
    // Check API key based on provider
    if (settings.provider === 'openai') {
    if (!apiKey) {
            showApiKeyModal('openai');
            return toast('Need OpenAI API key', 'error');
        }
    } else {
        if (!settings.openrouterKey || settings.openrouterKey.trim() === '') {
            showApiKeyModal('openrouter');
            return toast('Need OpenRouter API key. Go to Settings (⚙️) to configure.', 'error');
    }

        // Debug: Log provider and key status (key length only for security)
        console.log('Using OpenRouter provider');
        console.log('Model:', settings.model);
        console.log('Key length:', settings.openrouterKey.length);
    }

    const analyzeBtn = $('analyzeBtn');
    const actionSection = $('actionSection');
    const loadingSection = $('loadingSection');
    
    if (analyzeBtn) analyzeBtn.disabled = true;
    if (actionSection) actionSection.classList.add('hidden');
    if (loadingSection) loadingSection.classList.remove('hidden');

    try {
        // First extract OCR text to help identify host
        let ocrText = '';
        try {
            if (window.Tesseract && Tesseract.recognize) {
                const ocrResult = await Tesseract.recognize(currentImage, 'eng');
                ocrText = (ocrResult?.data?.text || '').trim();
            }
        } catch (e) {
            console.warn('OCR extraction failed:', e);
        }

        // Build prompt with OCR context if available
        let promptText = 'Analyze this event screenshot image and extract all event information.\n\n';
        
        if (ocrText) {
            promptText += `Here is the extracted text from the image:\n"${ocrText.substring(0, 1000)}"\n\n`;
        }
        
        promptText += `CRITICAL: Extract the HOST information. The host is the person, organization, or group that is hosting/organizing/presenting the event. Look for:\n`;
        promptText += `- Labels like: "Hosted by", "Organized by", "Organised by", "Presented by", "Host:", "Organizer:", "Organiser:", "By:", "From:"\n`;
        promptText += `- Social media handles (e.g., @username, @organization)\n`;
        promptText += `- Profile names or group names visible on the event post\n`;
        promptText += `- Organization/club/department names that appear to be the event creator\n\n`;
        promptText += `Extract ALL fields:\n`;
        promptText += `- title: The event name/title (required)\n`;
        promptText += `- host: The host/organizer name (CRITICAL - must extract if visible, even from profile name or handle)\n`;
        promptText += `- date: Start date in YYYY-MM-DD format\n`;
        promptText += `- time: Start time in HH:MM format (24-hour format)\n`;
        promptText += `- endDate: End date in YYYY-MM-DD format (if different from start date)\n`;
        promptText += `- endTime: End time in HH:MM format (24-hour format)\n`;
        promptText += `- location: Venue or location of the event\n`;
        promptText += `- description: Any additional event details or description\n\n`;
        promptText += `Return ONLY valid JSON with no markdown, no code blocks, no explanation.\n`;
        promptText += `Format: {"title": "...", "host": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "endDate": "...", "endTime": "...", "location": "...", "description": "..."}\n\n`;
        promptText += `IMPORTANT: Do NOT leave host as empty string if you can see any host information in the image or text. Extract names, handles, or organization names that appear to be hosting the event.`;

        // Make API call based on provider
        const res = await callVisionAPI(promptText, currentImage);

        if (!res.ok) {
            let errorMsg = 'API error';
            try {
                const errorData = await res.json();
                errorMsg = errorData.error?.message || errorData.error || errorData.message || JSON.stringify(errorData) || 'API error';
                console.error('API Error Response:', errorData);
            } catch (e) {
                console.error('Failed to parse error response:', e);
                errorMsg = `HTTP ${res.status}: ${res.statusText}`;
            }
            throw new Error(errorMsg);
        }

        const data = await res.json();
        
        // Parse response - handle both OpenAI and OpenRouter formats
        let content;
        if (settings.provider === 'openrouter') {
            // OpenRouter format
            content = data.choices?.[0]?.message?.content || data.content || '';
        } else {
            // OpenAI format
            content = data.choices[0].message.content;
        }
        
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) content = jsonMatch[1];
        
        const event = JSON.parse(content);
        
        const eventTitle = $('eventTitle');
        const eventDate = $('eventDate');
        const eventTime = $('eventTime');
        const eventHost = $('eventHost');
        const eventEndDate = $('eventEndDate');
        const eventEndTime = $('eventEndTime');
        const eventLocation = $('eventLocation');
        const eventDescription = $('eventDescription');
        const loadingSection = $('loadingSection');
        const resultSection = $('resultSection');
        
        if (eventTitle) eventTitle.value = event.title || '';
        if (eventDate) eventDate.value = event.date || '';
        if (eventTime) eventTime.value = event.time || '';
        if (eventEndDate) eventEndDate.value = event.endDate || event.date || '';
        if (eventEndTime) eventEndTime.value = event.endTime || '';
        if (eventLocation) eventLocation.value = event.location || '';
        if (eventDescription) eventDescription.value = event.description || '';
        
        // Extract and set host, with fallback to OCR if needed
        let hostValue = (event.host || '').trim();
        if (eventHost) {
            if (!hostValue && ocrText) {
                // Fallback: try OCR extraction using already extracted text
                try {
                    const ocrHost = extractHostFromText(ocrText);
                    if (ocrHost) {
                        hostValue = ocrHost;
                        console.log('Host extracted via OCR fallback:', hostValue);
                    }
                } catch (err) {
                    console.warn('OCR fallback failed:', err);
                }
            }
            // If still no host and we didn't have OCR text, try full OCR extraction
            if (!hostValue && !ocrText) {
                try {
                    if (window.Tesseract && Tesseract.recognize) {
                        const ocrHost = await fallbackExtractHostWithOCR(currentImage);
                        if (ocrHost) {
                            hostValue = ocrHost;
                            console.log('Host extracted via OCR fallback (full):', hostValue);
                        }
                    }
                } catch (err) {
                    console.warn('Full OCR fallback failed:', err);
                }
            }
            eventHost.value = hostValue;
        }

        if (loadingSection) loadingSection.classList.add('hidden');
        if (resultSection) resultSection.classList.remove('hidden');
        toast('Extracted event details', 'success');
    } catch (err) {
        console.error(err);
        const loadingSection = $('loadingSection');
        const actionSection = $('actionSection');
        const analyzeBtn = $('analyzeBtn');
        
        if (loadingSection) loadingSection.classList.add('hidden');
        if (actionSection) actionSection.classList.remove('hidden');
        if (analyzeBtn) analyzeBtn.disabled = false;
        toast(`Error: ${err.message}`, 'error');
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const eventTitle = $('eventTitle');
    const eventDate = $('eventDate');
    const eventTime = $('eventTime');
    const eventHost = $('eventHost');
    const eventEndDate = $('eventEndDate');
    const eventEndTime = $('eventEndTime');
    const eventLocation = $('eventLocation');
    const eventDescription = $('eventDescription');
    
    if (!eventTitle || !eventDate || !eventTime) {
        toast('Required fields missing', 'error');
        return;
    }
    
    generateICS({
        title: eventTitle.value,
        host: eventHost ? eventHost.value : '',
        date: eventDate.value,
        time: eventTime.value,
        endDate: (eventEndDate && eventEndDate.value) || eventDate.value,
        endTime: eventEndTime ? eventEndTime.value : '',
        location: eventLocation ? eventLocation.value : '',
        description: eventDescription ? eventDescription.value : ''
    });
}

function generateICS(event) {
    const start = new Date(`${event.date}T${event.time}`);
    const end = event.endTime 
        ? new Date(`${event.endDate}T${event.endTime}`)
        : new Date(start.getTime() + 3600000);
    
    const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const esc = s => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
    
    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//LifeCapture//Event Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@lifecapture.app`,
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
        'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast('Downloaded! Import it to your calendar', 'success');
}

// Heuristic OCR fallback to extract host when the model misses it
async function fallbackExtractHostWithOCR(imageDataUrl) {
    if (!(window.Tesseract && Tesseract.recognize)) return '';
    try {
        const result = await Tesseract.recognize(imageDataUrl, 'eng');
        const text = (result && result.data && result.data.text) ? result.data.text : '';
        return extractHostFromText(text);
    } catch {
        return '';
    }
}

function extractHostFromText(text) {
    if (!text) return '';
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // Enhanced patterns to catch more variations
    const labelPatterns = [
        /hosted\s+by[:\-]?\s*([^\n]+)/i,
        /organized\s+by[:\-]?\s*([^\n]+)/i,
        /organised\s+by[:\-]?\s*([^\n]+)/i,
        /presented\s+by[:\-]?\s*([^\n]+)/i,
        /^host[:\-]?\s*(.+)$/im,
        /^organizer[:\-]?\s*(.+)$/im,
        /^organiser[:\-]?\s*(.+)$/im,
        /\bby[:\-]?\s*([^\n]+)/i,
        /from[:\-]?\s*([^\n]+)/i
    ];

    for (const line of lines) {
        for (const pattern of labelPatterns) {
            const m = line.match(pattern);
            if (m && m[1]) {
                const host = sanitizeHost(m[1]);
                if (host && host.length > 1) {
                    return host;
                }
            }
        }
    }

    // Look for @handles anywhere in text
    const handleMatches = text.match(/@[A-Za-z0-9_\.\-]+/g);
    if (handleMatches && handleMatches.length > 0) {
        // Prefer the first handle that's not part of a URL
        for (const handle of handleMatches) {
            if (!handle.includes('http') && handle.length > 1) {
                return sanitizeHost(handle);
            }
        }
    }

    // Look for profile/username patterns (e.g., "Posted by X", "Event by X")
    const postedByMatch = text.match(/(?:posted|created|event)\s+(?:by|from)[:\-]?\s*([^\n,]+)/i);
    if (postedByMatch && postedByMatch[1]) {
        return sanitizeHost(postedByMatch[1]);
    }

    // Fallback: choose a candidate line that looks like a group/org name (near top)
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const l = lines[i];
        // Check if line looks like an organization/club name
        if (/club|society|association|department|lab|center|centre|team|group|chapter|union|university|college|school/i.test(l)) {
            // Make sure it's not too long (likely not a description)
            if (l.length < 80 && l.length > 2) {
                return sanitizeHost(l);
            }
        }
        // Also check for capitalized names/orgs (often hosts)
        if (l.length > 2 && l.length < 60 && /^[A-Z][A-Za-z\s&]+$/.test(l) && l.split(/\s+/).length <= 5) {
            return sanitizeHost(l);
        }
    }
    return '';
}

function sanitizeHost(s) {
    return (s || '')
        .replace(/^[\-:\s]+/, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 120);
}

function saveApiKey() {
    const apiKeyInput = $('apiKeyInput');
    if (!apiKeyInput) return toast('API key input not found', 'error');
    
    const key = apiKeyInput.value.trim();
    if (!key) return toast('Enter a valid API key', 'error');
    
    // Determine which provider based on key format or current settings
    // OpenRouter keys typically start with 'sk-or-' but can have various formats
    // Check if the modal was shown for OpenRouter context
    const apiKeyPromptText = $('apiKeyPromptText');
    const isOpenRouterModal = apiKeyPromptText && apiKeyPromptText.textContent.includes('OpenRouter');
    const isOpenRouterKey = key.startsWith('sk-or-') || key.startsWith('sk_live_') || key.includes('openrouter');
    
    // Check if we're in OpenRouter context (settings, modal, or key format)
    const isOpenRouterContext = settings.provider === 'openrouter' || isOpenRouterModal || isOpenRouterKey;
    
    if (isOpenRouterContext) {
        settings.openrouterKey = key;
        localStorage.setItem('openrouter_key', key);
        
        console.log('Saved OpenRouter key (length:', key.length, ')');
        
        // If using OpenRouter key, also update provider if not set
        if (settings.provider !== 'openrouter') {
            settings.provider = 'openrouter';
            localStorage.setItem('provider', 'openrouter');
            console.log('Updated provider to OpenRouter');
            // Update settings UI if it exists
            const providerSelect = $('providerSelect');
            if (providerSelect) providerSelect.value = 'openrouter';
            updateProviderUI();
        }
        
        toast('OpenRouter API key saved', 'success');
    } else {
    apiKey = key;
    localStorage.setItem('openai_api_key', key);
        toast('OpenAI API key saved', 'success');
    }
    
    // Clear the input
    apiKeyInput.value = '';
    
    const apiKeySection = $('apiKeySection');
    if (apiKeySection) apiKeySection.classList.add('hidden');
}

// API call function that handles both OpenAI and OpenRouter
async function callVisionAPI(promptText, imageDataUrl) {
    const systemPrompt = 'You are an expert at extracting structured event data from images. You MUST identify the host/organizer. Output must be raw JSON only, no markdown, no code fences. Always extract host information if it is visible in any form.';
    
    if (settings.provider === 'openrouter') {
        // OpenRouter API call
        const base64Data = imageDataUrl.split(',')[1];
        const mimeType = imageDataUrl.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
        
        return fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.openrouterKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'LifeCapture Event Extractor'
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: promptText },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageDataUrl
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            })
        });
    } else {
        // OpenAI API call
        return fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: promptText },
                            { type: 'image_url', image_url: { url: imageDataUrl } }
                        ]
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            })
        });
    }
}

function toast(msg, type = 'success') {
    const el = $('toast');
    if (!el) {
        console.warn('Toast element not found');
        return;
    }
    el.textContent = msg;
    el.className = `toast ${type}`;
    el.classList.remove('hidden');
    setTimeout(() => {
        if (el) el.classList.add('hidden');
    }, 4000);
}
