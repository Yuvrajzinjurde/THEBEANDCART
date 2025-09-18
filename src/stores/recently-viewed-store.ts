
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IProduct } from '@/models/product.model';

const MAX_RECENTLY_VIEWED = 10;

type RecentlyViewedState = {
  recentlyViewed: IProduct[];
};

type RecentlyViewedActions = {
  addProduct: (product: IProduct) => void;
};

const useRecentlyViewedStore = create<RecentlyViewedState & RecentlyViewedActions>()(
  persist(
    (set, get) => ({
      recentlyViewed: [],
      addProduct: (product) => {
        const currentItems = get().recentlyViewed;
        
        // Remove the product if it already exists to move it to the front
        const filteredItems = currentItems.filter(p => p._id !== product._id);
        
        // Add the new product to the beginning of the array
        const newItems = [product, ...filteredItems];
        
        // Limit the number of items
        if (newItems.length > MAX_RECENTLY_VIEWED) {
          newItems.length = MAX_RECENTLY_VIEWED;
        }
        
        set({ recentlyViewed: newItems });
      },
    }),
    {
      name: 'recently-viewed-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useRecentlyViewedStore;
