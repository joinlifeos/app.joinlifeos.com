'use client';

import { EnhancedUploadArea } from '@/components/enhanced-upload-area';
import { EnhancedEventForm } from '@/components/enhanced-event-form';
import { EnhancedSettingsModal } from '@/components/enhanced-settings-modal';
import { ApiKeyModal } from '@/components/api-key-modal';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function Home() {
  const {
    currentImage,
    isLoading,
    setIsLoading,
    setShowSettings,
    setShowApiKeyModal,
    setEventData,
    eventData,
    settings,
  } = useAppStore();

  // Check API key on mount
  useEffect(() => {
    const hasApiKey =
      settings.provider === 'openai'
        ? !!settings.openaiKey
        : !!settings.openrouterKey;

    if (!hasApiKey) {
      setShowApiKeyModal(true);
    }
  }, [settings, setShowApiKeyModal]);

  const handleAnalyze = async () => {
    if (!currentImage) return;

    // Check API key
    const hasApiKey =
      settings.provider === 'openai'
        ? !!settings.openaiKey
        : !!settings.openrouterKey;

    if (!hasApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    try {
      // Import the API functions dynamically
      const {
        extractEventFromImage,
        extractTextWithOCR,
        extractHostFromText,
      } = await import('@/lib/api');

      // Extract OCR text first
      const ocrText = await extractTextWithOCR(currentImage);

      // Build prompt
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
      promptText += '- date: Start date in YYYY-MM-DD format\n';
      promptText += '- time: Start time in HH:MM format (24-hour format)\n';
      promptText +=
        '- endDate: End date in YYYY-MM-DD format (if different from start date)\n';
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

      // Extract event data
      const eventData = await extractEventFromImage(
        currentImage,
        promptText,
        settings
      );

      // Fallback: try OCR extraction for host if missing
      if (!eventData.host && ocrText) {
        const hostFromOCR = await import('@/lib/api').then((m) =>
          m.extractHostFromText(ocrText)
        );
        if (hostFromOCR) {
          eventData.host = hostFromOCR;
        }
      }

      setEventData(eventData);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-12 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-5xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight"
          >
            SmartCapture
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 font-medium"
          >
            Turn event screenshots into calendar entries instantly
          </motion.p>
        </header>

        {/* Main Content Card */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-10"
        >
          <EnhancedUploadArea />

          {currentImage && !eventData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 text-center"
            >
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Extract Event Details'
                )}
              </Button>
            </motion.div>
          )}

          {eventData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <EnhancedEventForm />
            </motion.div>
          )}
        </motion.main>

        {/* Modals */}
        <EnhancedSettingsModal />
        <ApiKeyModal />
      </div>
    </div>
  );
}
