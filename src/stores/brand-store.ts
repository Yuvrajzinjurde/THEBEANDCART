
"use client";

import { create } from 'zustand';

type BrandState = {
  selectedBrand: string;
  availableBrands: string[];
};

type BrandActions = {
  setSelectedBrand: (brand: string) => void;
};

const useBrandStore = create<BrandState & BrandActions>((set) => ({
  selectedBrand: 'All Brands',
  availableBrands: ['All Brands', 'Reeva', 'BrandCo', 'Shopify'],
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
}));

export default useBrandStore;
