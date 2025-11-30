
"use client";

import { create } from 'zustand';

type BrandState = {
  selectedBrand: string;
  availableBrands: string[];
};

type BrandActions = {
  setSelectedBrand: (brand: string) => void;
  setAvailableBrands: (brands: string[]) => void;
};

const useBrandStore = create<BrandState & BrandActions>((set) => ({
  selectedBrand: 'All Brands',
  availableBrands: ['All Brands'],
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  setAvailableBrands: (brands) => set({ availableBrands: brands }),
}));

export default useBrandStore;
