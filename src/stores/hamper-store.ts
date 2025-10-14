
"use client";

import { create } from 'zustand';
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
  setFullHamperState: (state: Partial<HamperState>) => void;
  reset: () => void;
};

const initialState: HamperState = {
  step: 1,
  products: [],
  addRose: false,
};

const useHamperStore = create<HamperState & HamperActions>()(
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
      setFullHamperState: (state) => set(state),
      reset: () => set(initialState),
    })
);

export default useHamperStore;
