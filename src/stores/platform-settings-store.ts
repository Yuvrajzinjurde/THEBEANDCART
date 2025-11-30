
"use client";

import { create } from 'zustand';
import type { IPlatformSettings } from '@/models/platform.model';
import { useCallback } from 'react';

type PlatformSettingsState = {
  settings: Partial<IPlatformSettings>;
  fetchSettings: () => Promise<void>;
};

const usePlatformSettingsStore = create<PlatformSettingsState>((set, get) => ({
  settings: {
    aiEnabled: true,
    hamperFeatureEnabled: true,
  },
  fetchSettings: async () => {
    try {
      const response = await fetch('/api/platform');
      if (response.ok) {
        const settings = await response.json();
        // Prevent unnecessary re-renders if settings are the same
        if (settings && JSON.stringify(settings) !== JSON.stringify(get().settings)) {
          set({ settings });
        }
      }
    } catch (error) {
      console.error("Failed to fetch platform settings:", error);
    }
  },
}));

export default usePlatformSettingsStore;

    