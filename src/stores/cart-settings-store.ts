
"use client";

import { create } from 'zustand';
import type { ISettings } from '@/models/settings.model';

type CartSettingsState = {
  settings: Partial<ISettings>;
  fetchSettings: () => Promise<void>;
};

const useCartSettingsStore = create<CartSettingsState>((set, get) => ({
  settings: {
    freeShippingThreshold: 399,
    extraDiscountThreshold: 799,
    freeGiftThreshold: 999,
  },
  fetchSettings: async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        if (settings) {
          set({ settings });
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart settings:", error);
    }
  },
}));

export default useCartSettingsStore;
