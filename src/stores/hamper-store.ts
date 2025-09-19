
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IBox, IBoxVariant } from '@/models/box.model';
import type { IProduct } from '@/models/product.model';

export type HamperState = {
  step: number;
  occasion?: string;
  box?: IBox;
  boxVariant?: IBoxVariant;
  bag?: IBox;
  bagVariant?: IBoxVariant;
  products: IProduct[];
  notesToCreator?: string;
  notesToReceiver?: string;
  addRose: boolean;
};

type HamperActions = {
  setStep: (step: number) => void;
  setOccasion: (occasion: string) => void;
  setBox: (box: IBox, variant: IBoxVariant) => void;
  setBag: (bag: IBox, variant: IBoxVariant) => void;
  addProduct: (product: IProduct) => void;
  removeProduct: (productId: string) => void;
  setNotes: (notes: { creator?: string; receiver?: string }) => void;
  setAddRose: (add: boolean) => void;
  reset: () => void;
};

const initialState: HamperState = {
  step: 1,
  products: [],
  addRose: false,
};

const useHamperStore = create<HamperState & HamperActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setOccasion: (occasion) => set({ occasion }),
      setBox: (box, boxVariant) => set({ box, boxVariant }),
      setBag: (bag, bagVariant) => set({ bag, bagVariant }),
      addProduct: (product) => {
        set(state => ({
            products: [...state.products, product]
        }));
      },
      removeProduct: (productId) => {
        set(state => ({
            products: state.products.filter(p => p._id !== productId)
        }));
      },
      setNotes: (notes) => set(state => ({
        notesToCreator: notes.creator ?? state.notesToCreator,
        notesToReceiver: notes.receiver ?? state.notesToReceiver,
      })),
      setAddRose: (add) => set({ addRose: add }),
      reset: () => set(initialState),
    }),
    {
      name: 'hamper-creation-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useHamperStore;
