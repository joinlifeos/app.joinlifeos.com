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
import { Settings, CheckCircle2, Calendar, LogOut, Music, Video, MapPin, Link as LinkIcon } from 'lucide-react';
import {
  initiateGoogleAuth,
  isGoogleCalendarAuthenticated,
  storeAuth,
  clearAuth,
} from '@/lib/google-calendar';
import {
  initiateSpotifyAuth,
  isSpotifyAuthenticated,
  storeSpotifyAuth,
  clearSpotifyAuth,
} from '@/lib/spotify';
import {
  initiateYouTubeAuth,
  isYouTubeAuthenticated,
  storeYouTubeAuth,
  clearYouTubeAuth,
} from '@/lib/youtube';
import {
  initiateRaindropAuth,
  isRaindropAuthenticated,
  storeRaindropAuth,
  clearRaindropAuth,
} from '@/lib/raindrop';
import {
  isGoogleMapsAuthenticated,
  clearGoogleMapsAuth,
  enableGoogleMaps,
} from '@/lib/google-maps';

export function EnhancedSettingsModal() {
  const { showSettings, setShowSettings, settings, updateSettings, setSpotifyAuth, setYouTubeAuth, setRaindropAuth } =
    useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [isRaindropConnected, setIsRaindropConnected] = useState(false);
  const [isGoogleMapsConnected, setIsGoogleMapsConnected] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setIsGoogleConnected(isGoogleCalendarAuthenticated());
    setIsSpotifyConnected(isSpotifyAuthenticated());
    setIsYouTubeConnected(isYouTubeAuthenticated());
    setIsRaindropConnected(isRaindropAuthenticated());
    setIsGoogleMapsConnected(isGoogleMapsAuthenticated());
  }, [settings, showSettings]);

  // Check for all service auth callbacks in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    // Handle Google Calendar
    const googleAuth = urlParams.get('google_auth');
    if (error && error.includes('google')) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (googleAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(googleAuth));
        storeAuth(authData);
        setIsGoogleConnected(true);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse Google auth data:', err);
      }
    }

    // Handle Spotify
    const spotifyAuth = urlParams.get('spotify_auth');
    if (error && error.includes('spotify')) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (spotifyAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(spotifyAuth));
        storeSpotifyAuth(authData);
        setSpotifyAuth(authData);
        setIsSpotifyConnected(true);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse Spotify auth data:', err);
      }
    }

    // Handle YouTube
    const youtubeAuth = urlParams.get('youtube_auth');
    if (error && error.includes('youtube')) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (youtubeAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(youtubeAuth));
        storeYouTubeAuth(authData);
        setYouTubeAuth(authData);
        setIsYouTubeConnected(true);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse YouTube auth data:', err);
      }
    }

    // Handle Raindrop
    const raindropAuth = urlParams.get('raindrop_auth');
    if (error && error.includes('raindrop')) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (raindropAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(raindropAuth));
        storeRaindropAuth(authData);
        setRaindropAuth(authData);
        setIsRaindropConnected(true);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse Raindrop auth data:', err);
      }
    }
  }, [setSpotifyAuth, setYouTubeAuth, setRaindropAuth]);

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

                 {/* Service Integrations */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="space-y-4"
                 >
                   <h3 className="text-lg font-semibold text-slate-900 mb-2">Service Integrations</h3>

                   {/* Google Calendar */}
                   <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.25 }}
                     className="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-green-50/30 shadow-sm hover:shadow-md transition-shadow duration-300"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Calendar className="h-5 w-5 text-yellow-600" />
                         <Label className="text-sm font-semibold text-slate-900">
                           Google Calendar
                         </Label>
                         {isGoogleConnected && (
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                         )}
                       </div>
                       {isGoogleConnected ? (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             clearAuth();
                             setIsGoogleConnected(false);
                             // Also disconnect Google Maps if it depends on Calendar
                             setIsGoogleMapsConnected(isGoogleMapsAuthenticated());
                           }}
                           className="text-slate-600 hover:text-slate-900 text-xs"
                         >
                           <LogOut className="mr-1 h-3 w-3" />
                           Disconnect
                         </Button>
                       ) : (
                         <Button
                           type="button"
                           size="sm"
                           onClick={initiateGoogleAuth}
                           className="bg-green-600 hover:bg-green-700 text-white text-xs"
                         >
                           Connect
                         </Button>
                       )}
                     </div>
                     <p className="text-xs text-slate-600 mt-2">
                       {isGoogleConnected
                         ? 'Connected - Events can be added directly to your Google Calendar'
                         : 'Add events directly to Google Calendar without downloading ICS files'}
                     </p>
                   </motion.div>

                   {/* Google Maps */}
                   <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 }}
                     className="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 shadow-sm hover:shadow-md transition-shadow duration-300"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <MapPin className="h-5 w-5 text-blue-600" />
                         <Label className="text-sm font-semibold text-slate-900">
                           Google Maps
                         </Label>
                         {isGoogleMapsConnected && (
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                         )}
                       </div>
                      {isGoogleMapsConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            clearGoogleMapsAuth();
                            setIsGoogleMapsConnected(isGoogleMapsAuthenticated());
                          }}
                          className="text-slate-600 hover:text-slate-900 text-xs"
                        >
                          <LogOut className="mr-1 h-3 w-3" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            enableGoogleMaps();
                            setIsGoogleMapsConnected(isGoogleMapsAuthenticated());
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          Connect
                        </Button>
                      )}
                     </div>
                     <p className="text-xs text-slate-600 mt-2">
                    {isGoogleMapsConnected
                      ? 'Connected - Restaurants can be saved to Google Maps'
                      : 'Configure Google Places API key to enable place search; fallback opens Maps search'}
                     </p>
                   </motion.div>

                   {/* YouTube */}
                   <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.35 }}
                     className="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-red-50/30 shadow-sm hover:shadow-md transition-shadow duration-300"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Video className="h-5 w-5 text-red-600" />
                         <Label className="text-sm font-semibold text-slate-900">
                           YouTube
                         </Label>
                         {isYouTubeConnected && (
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                         )}
                       </div>
                       {isYouTubeConnected ? (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             clearYouTubeAuth();
                             setIsYouTubeConnected(false);
                           }}
                           className="text-slate-600 hover:text-slate-900 text-xs"
                         >
                           <LogOut className="mr-1 h-3 w-3" />
                           Disconnect
                         </Button>
                       ) : (
                         <Button
                           type="button"
                           size="sm"
                           onClick={initiateYouTubeAuth}
                           className="bg-red-600 hover:bg-red-700 text-white text-xs"
                         >
                           Connect
                         </Button>
                       )}
                     </div>
                     <p className="text-xs text-slate-600 mt-2">
                       {isYouTubeConnected
                         ? 'Connected - Videos can be added directly to your YouTube playlists'
                         : 'Add videos directly to your YouTube playlists'}
                     </p>
                   </motion.div>

                   {/* Spotify */}
                   <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4 }}
                     className="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-green-50/30 shadow-sm hover:shadow-md transition-shadow duration-300"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Music className="h-5 w-5 text-green-500" />
                         <Label className="text-sm font-semibold text-slate-900">
                           Spotify
                         </Label>
                         {isSpotifyConnected && (
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                         )}
                       </div>
                       {isSpotifyConnected ? (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             clearSpotifyAuth();
                             setIsSpotifyConnected(false);
                           }}
                           className="text-slate-600 hover:text-slate-900 text-xs"
                         >
                           <LogOut className="mr-1 h-3 w-3" />
                           Disconnect
                         </Button>
                       ) : (
                         <Button
                           type="button"
                           size="sm"
                           onClick={initiateSpotifyAuth}
                           className="bg-green-500 hover:bg-green-600 text-white text-xs"
                         >
                           Connect
                         </Button>
                       )}
                     </div>
                     <p className="text-xs text-slate-600 mt-2">
                       {isSpotifyConnected
                         ? 'Connected - Songs can be added directly to your Spotify playlists'
                         : 'Add songs directly to your Spotify playlists'}
                     </p>
                   </motion.div>

                   {/* Raindrop */}
                   <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.45 }}
                     className="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50/30 shadow-sm hover:shadow-md transition-shadow duration-300"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <LinkIcon className="h-5 w-5 text-purple-600" />
                         <Label className="text-sm font-semibold text-slate-900">
                           Raindrop
                         </Label>
                         {isRaindropConnected && (
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                         )}
                       </div>
                       {isRaindropConnected ? (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             clearRaindropAuth();
                             setIsRaindropConnected(false);
                           }}
                           className="text-slate-600 hover:text-slate-900 text-xs"
                         >
                           <LogOut className="mr-1 h-3 w-3" />
                           Disconnect
                         </Button>
                       ) : (
                         <Button
                           type="button"
                           size="sm"
                           onClick={initiateRaindropAuth}
                           className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                         >
                           Connect
                         </Button>
                       )}
                     </div>
                     <p className="text-xs text-slate-600 mt-2">
                       {isRaindropConnected
                         ? 'Connected - Links and posts can be saved directly to your Raindrop collections'
                         : 'Save links and posts directly to your Raindrop collections'}
                     </p>
                   </motion.div>
                 </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex justify-end gap-3 pt-4 border-t border-slate-200"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
