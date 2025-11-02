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
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, CheckCircle2 } from 'lucide-react';

export function EnhancedSettingsModal() {
  const { showSettings, setShowSettings, settings, updateSettings } =
    useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, showSettings]);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowSettings(false);
    }, 1500);
  };

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900">
            Settings
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Configure your AI provider and API keys
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider" className="text-sm font-medium text-slate-700">
              AI Provider
            </Label>
            <select
              id="provider"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
              value={localSettings.provider}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  provider: e.target.value as 'openai' | 'openrouter',
                })
              }
            >
              <option value="openai">OpenAI</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>

          <AnimatePresence mode="wait">
            {localSettings.provider === 'openai' ? (
              <motion.div
                key="openai"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium text-slate-700">
                  OpenAI Configuration
                </Label>
                <p className="text-sm text-slate-600">
                  Using OpenAI GPT-4o Vision model
                </p>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={localSettings.openaiKey}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      openaiKey: e.target.value,
                    })
                  }
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="openrouter"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="openrouterKey" className="text-sm font-medium text-slate-700">
                    OpenRouter API Key
                  </Label>
                  <Input
                    id="openrouterKey"
                    type="password"
                    placeholder="sk-or-..."
                    value={localSettings.openrouterKey}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        openrouterKey: e.target.value,
                      })
                    }
                    className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-slate-500">
                    Get your key from{' '}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      openrouter.ai/keys
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium text-slate-700">
                    Vision Model
                  </Label>
                  <select
                    id="model"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                    value={localSettings.model}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        model: e.target.value,
                      })
                    }
                  >
                    <optgroup label="Claude (Anthropic)">
                      <option value="anthropic/claude-3.5-sonnet">
                        Claude 3.5 Sonnet
                      </option>
                      <option value="anthropic/claude-3-opus">
                        Claude 3 Opus
                      </option>
                      <option value="anthropic/claude-3-sonnet">
                        Claude 3 Sonnet
                      </option>
                      <option value="anthropic/claude-3-haiku">
                        Claude 3 Haiku (Fast)
                      </option>
                    </optgroup>
                    <optgroup label="Gemini (Google)">
                      <option value="google/gemini-pro-vision">
                        Gemini Pro Vision
                      </option>
                      <option value="google/gemini-1.5-flash">
                        Gemini 1.5 Flash (Fast & Cheap)
                      </option>
                      <option value="google/gemini-1.5-pro">
                        Gemini 1.5 Pro
                      </option>
                    </optgroup>
                    <optgroup label="GPT (OpenAI)">
                      <option value="openai/gpt-4o">GPT-4o</option>
                      <option value="openai/gpt-4o-mini">
                        GPT-4o Mini (Cheaper)
                      </option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-slate-500">
                    Select a vision model. Claude and Gemini are often faster
                    and cheaper than GPT-4o.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
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
                    Save Settings
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
