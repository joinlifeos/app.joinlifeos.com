'use client';

import { EnhancedUploadArea } from '@/components/enhanced-upload-area';
import { EnhancedDataForm } from '@/components/enhanced-data-form';
import { Button } from '@/components/ui/button';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Starfield } from '@/components/ui/starfield';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const {
    currentImages,
    isLoading,
    setIsLoading,
    setShowApiKeyModal,
    setExtractedData,
    extractedData,
    settings,
    setShowSettings,
    resetExtractedData,
    addExtractedData,
  } = useAppStore();

  // Close settings modal when navigating to this page
  useEffect(() => {
    setShowSettings(false);
  }, [setShowSettings]);

  // Close API key modal on first load
  useEffect(() => {
    setShowApiKeyModal(false);
  }, [setShowApiKeyModal]);

  const handleAnalyze = async () => {
    if (currentImages.length === 0) return;

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
    resetExtractedData();
    
    try {
      // Import the extraction API
      const { extractFromImage, extractTextWithOCR, extractHostFromText } = await import('@/lib/api');

      // Process all images in parallel
      const results = await Promise.all(
        currentImages.map(async (image) => {
          // Extract OCR text first (for fallback host extraction on events)
          const ocrText = await extractTextWithOCR(image);

          // Extract data using generic extraction API (classifies and extracts)
          const result = await extractFromImage(image, settings);

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

          return result;
        })
      );

      // Add all results to extracted data
      results.forEach(result => addExtractedData(result));
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, oklch(0.08 0.06 270), oklch(0.09 0.07 265), oklch(0.07 0.06 275))' }}>
      {/* Starfield background */}
      <Starfield starCount={250} speed={0.2} className="opacity-40" />
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
          >
            LifeCapture
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
            className="text-lg md:text-xl text-muted-foreground font-medium"
          >
            Turn screenshots and images into actionable items instantly
          </motion.p>
        </header>

        {/* Main Content Card */}
        <motion.main
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
          className="bg-card rounded-2xl shadow-2xl border-0 p-6 md:p-10 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-shadow duration-300 backdrop-blur-sm relative"
            >
          <GlowingEffect
            disabled={false}
            blur={25}
            spread={140}
            proximity={200}
            variant="space"
            glow={true}
            borderWidth={3}
            movementDuration={3}
            inactiveZone={0}
            autoAnimate={true}
            animationDuration={3}
          />
          <EnhancedUploadArea />

          <AnimatePresence mode="wait" initial={false}>
            {currentImages.length > 0 && extractedData.length === 0 && (
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
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
                          Analyzing {currentImages.length} image{currentImages.length !== 1 ? 's' : ''}...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="analyze"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Analyze {currentImages.length} Screenshot{currentImages.length !== 1 ? 's' : ''}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {extractedData.length > 0 && (
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
        </div>
    </div>
  );
}
