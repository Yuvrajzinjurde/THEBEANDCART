
"use client";

import { create } from 'zustand';
import type { ICart } from '@/models/cart.model';
import type { IWishlist } from '@/models/wishlist.model';
import type { INotification } from '@/models/notification.model';

type UserDataState = {
  cart: ICart | null;
  wishlist: IWishlist | null;
  notifications: INotification[];
};

type UserDataActions = {
  setCart: (cart: ICart | null) => void;
  setWishlist: (wishlist: IWishlist | null) => void;
  setNotifications: (notifications: INotification[]) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
};

const useUserStore = create<UserDataState & UserDataActions>((set) => ({
  cart: null,
  wishlist: null,
  notifications: [],
  setCart: (cart) => set({ cart }),
  setWishlist: (wishlist) => set({ wishlist }),
  setNotifications: (notifications) => set({ notifications }),
  markNotificationAsRead: (notificationId) => set(state => ({
    notifications: state.notifications.map(n => 
      n._id === notificationId ? { ...n, isRead: true } : n
    ),
  })),
  markAllNotificationsAsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
  })),
}));

export default useUserStore;
