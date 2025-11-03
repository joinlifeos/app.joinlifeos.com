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

export function SettingsModal() {
  const { showSettings, setShowSettings, settings, updateSettings } =
    useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, showSettings]);

  const handleSave = () => {
    updateSettings(localSettings);
    setShowSettings(false);
  };

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider and API keys
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <select
              id="provider"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

          {localSettings.provider === 'openai' ? (
            <div className="space-y-2">
              <Label>OpenAI Configuration</Label>
              <p className="text-sm text-muted-foreground">
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
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openrouterKey">OpenRouter API Key</Label>
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
                />
                <p className="text-xs text-muted-foreground">
                  Get your key from{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Vision Model</Label>
                <select
                  id="model"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    <option value="anthropic/claude-3-haiku">
                      Claude 3 Haiku (Fast)
                    </option>
                  </optgroup>
                  <optgroup label="Gemini (Google)">
                    <option value="google/gemini-2.5-flash">
                      Gemini 2.5 Flash
                    </option>
                  </optgroup>
                  <optgroup label="GPT (OpenAI)">
                    <option value="openai/gpt-4o">GPT-4o</option>
                    <option value="openai/gpt-4o-mini">GPT-4o Mini (Cheaper)</option>
                  </optgroup>
                </select>
                <p className="text-xs text-muted-foreground">
                  Select a vision model. Claude and Gemini are often faster and
                  cheaper than GPT-4o.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

