'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppSettings, ExtractedResult } from './types';

interface ServiceAuth {
  accessToken: string;
  expiresAt: number;
}

interface AppState {
  // Image state
  currentImage: string | null;
  setCurrentImage: (image: string | null) => void;

  // Settings state
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Extracted data state (replaces eventData)
  extractedData: ExtractedResult | null;
  setExtractedData: (data: ExtractedResult) => void;
  resetExtractedData: () => void;

  // Service authentication states
  spotifyAuth: ServiceAuth | null;
  setSpotifyAuth: (auth: ServiceAuth | null) => void;
  youtubeAuth: ServiceAuth | null;
  setYouTubeAuth: (auth: ServiceAuth | null) => void;
  raindropAuth: ServiceAuth | null;
  setRaindropAuth: (auth: ServiceAuth | null) => void;
  googleMapsAuth: ServiceAuth | null;
  setGoogleMapsAuth: (auth: ServiceAuth | null) => void;
  gmailAuth: ServiceAuth | null;
  setGmailAuth: (auth: ServiceAuth | null) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showApiKeyModal: boolean;
  setShowApiKeyModal: (show: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentImage: null,
      setCurrentImage: (image) => set({ currentImage: image }),

      settings: {
        provider: 'openai',
        openaiKey: '',
        openrouterKey: '',
        model: 'anthropic/claude-3.5-sonnet',
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      extractedData: null,
      setExtractedData: (data) => set({ extractedData: data }),
      resetExtractedData: () => set({ extractedData: null }),

      // Service auth states
      spotifyAuth: null,
      setSpotifyAuth: (auth) => set({ spotifyAuth: auth }),
      youtubeAuth: null,
      setYouTubeAuth: (auth) => set({ youtubeAuth: auth }),
      raindropAuth: null,
      setRaindropAuth: (auth) => set({ raindropAuth: auth }),
      googleMapsAuth: null,
      setGoogleMapsAuth: (auth) => set({ googleMapsAuth: auth }),
      gmailAuth: null,
      setGmailAuth: (auth) => set({ gmailAuth: auth }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      showApiKeyModal: false,
      setShowApiKeyModal: (show) => set({ showApiKeyModal: show }),
    }),
    {
      name: 'lifecapture-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        settings: state.settings,
        extractedData: state.extractedData,
        spotifyAuth: state.spotifyAuth,
        youtubeAuth: state.youtubeAuth,
        raindropAuth: state.raindropAuth,
        googleMapsAuth: state.googleMapsAuth,
        gmailAuth: state.gmailAuth,
      }),
    }
  )
);

