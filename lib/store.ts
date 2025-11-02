'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppSettings, EventData } from './types';

interface AppState {
  // Image state
  currentImage: string | null;
  setCurrentImage: (image: string | null) => void;

  // Settings state
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Event data state
  eventData: Partial<EventData> | null;
  setEventData: (data: Partial<EventData>) => void;
  resetEventData: () => void;

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

      eventData: null,
      setEventData: (data) => set({ eventData: data }),
      resetEventData: () => set({ eventData: null }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      showApiKeyModal: false,
      setShowApiKeyModal: (show) => set({ showApiKeyModal: show }),
    }),
    {
      name: 'smartcapture-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        settings: state.settings,
        eventData: state.eventData,
      }),
    }
  )
);

