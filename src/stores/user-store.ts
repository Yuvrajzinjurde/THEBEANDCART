
"use client";

import { create } from 'zustand';
import type { ICart } from '@/models/cart.model';
import type { IWishlist } from '@/models/wishlist.model';

type UserDataState = {
  cart: ICart | null;
  wishlist: IWishlist | null;
};

type UserDataActions = {
  setCart: (cart: ICart | null) => void;
  setWishlist: (wishlist: IWishlist | null) => void;
};

const useUserStore = create<UserDataState & UserDataActions>((set) => ({
  cart: null,
  wishlist: null,
  setCart: (cart) => set({ cart }),
  setWishlist: (wishlist) => set({ wishlist }),
}));

export default useUserStore;
