'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export function ApiKeyModal() {
  const { showApiKeyModal, setShowApiKeyModal, settings, updateSettings } =
    useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!apiKey.trim()) return;

    if (settings.provider === 'openrouter') {
      updateSettings({ openrouterKey: apiKey.trim() });
    } else {
      updateSettings({ openaiKey: apiKey.trim() });
    }

    setSaved(true);
    setTimeout(() => {
      setApiKey('');
      setSaved(false);
      setShowApiKeyModal(false);
    }, 1500);
  };

  const providerName =
    settings.provider === 'openrouter' ? 'OpenRouter' : 'OpenAI';
  const apiKeyUrl =
    settings.provider === 'openrouter'
      ? 'https://openrouter.ai/keys'
      : 'https://platform.openai.com/api-keys';

  return (
    <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900">
            API Key Required
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            To extract event details from images, please enter your{' '}
            {providerName} API key. Your key will be stored locally in your
            browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium text-slate-700">
              {providerName} API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={
                settings.provider === 'openrouter' ? 'sk-or-...' : 'sk-...'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <p className="text-sm text-slate-600">
            Get your API key from{' '}
            <a
              href={apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              {providerName} Platform
            </a>
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowApiKeyModal(false)}
              className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || saved}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Saved!
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Save
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
