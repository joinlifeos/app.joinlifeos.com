'use client';

import { EnhancedUploadArea } from '@/components/enhanced-upload-area';
import { EnhancedDataForm } from '@/components/enhanced-data-form';
import { EnhancedSettingsModal } from '@/components/enhanced-settings-modal';
import { ApiKeyModal } from '@/components/api-key-modal';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const {
    currentImage,
    isLoading,
    setIsLoading,
    setShowSettings,
    setShowApiKeyModal,
    setExtractedData,
    extractedData,
    settings,
  } = useAppStore();

  // Check API key on mount - show modal if no keys are configured
  useEffect(() => {
    const hasAnyKey = !!settings.openaiKey.trim() || !!settings.openrouterKey.trim();
    
    if (!hasAnyKey) {
      setShowApiKeyModal(true);
    }
  }, [settings.openaiKey, settings.openrouterKey, setShowApiKeyModal]);

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
      // Import the extraction API
      const { extractFromImage, extractTextWithOCR, extractHostFromText } = await import('@/lib/api');

      // Extract OCR text first (for fallback host extraction on events)
      const ocrText = await extractTextWithOCR(currentImage);

      // Extract data using generic extraction API (classifies and extracts)
      const result = await extractFromImage(currentImage, settings);

      // Fallback: try OCR extraction for host if missing on events
      if (result.type === 'event') {
        const eventData = result.data as any;
        if (!eventData.host && ocrText) {
          const hostFromOCR = extractHostFromText(ocrText);
          if (hostFromOCR) {
            eventData.host = hostFromOCR;
            result.data = eventData;
          }
        }
      }

      setExtractedData(result);
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="absolute top-0 right-0"
          >
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 backdrop-blur-sm border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-blue-400 hover:shadow-md rounded-lg transition-all shadow-sm"
              onClick={() => setShowSettings(true)}
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Settings className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="text-5xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight"
          >
            SmartCapture
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
            className="text-lg md:text-xl text-slate-600 font-medium"
          >
            Turn screenshots into actionable items instantly
          </motion.p>
        </header>

        {/* Main Content Card */}
        <motion.main
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-10 hover:shadow-xl transition-shadow duration-300"
            >
          <EnhancedUploadArea />

          <AnimatePresence mode="wait" initial={false}>
            {currentImage && !extractedData && (
              <motion.div
                key="analyze-button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="mt-8 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
          >
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="analyze"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Analyze Screenshot
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {extractedData && (
              <motion.div
                key="data-form"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <EnhancedDataForm />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>

        {/* Modals */}
        <EnhancedSettingsModal />
        <ApiKeyModal />
        </div>
    </div>
  );
}
