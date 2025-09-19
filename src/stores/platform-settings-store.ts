
"use client";

import { create } from 'zustand';

type PlatformSettingsState = {
  aiEnabled: boolean;
  fetchSettings: () => Promise<void>;
};

const usePlatformSettingsStore = create<PlatformSettingsState>((set) => ({
  aiEnabled: true, // Default to true
  fetchSettings: async () => {
    try {
      const response = await fetch('/api/platform');
      if (response.ok) {
        const settings = await response.json();
        if (settings) {
          set({ aiEnabled: settings.aiEnabled });
        }
      }
    } catch (error) {
      console.error("Failed to fetch platform settings:", error);
    }
  },
}));

export default usePlatformSettingsStore;
