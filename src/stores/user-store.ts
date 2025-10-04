
"use client";

import { create } from 'zustand';
import type { ICart } from '@/models/cart.model';
import type { IWishlist } from '@/models/wishlist.model';
import type { INotification } from '@/models/notification.model';

type UserDataState = {
  cart: ICart | null;
  wishlist: IWishlist | null;
  notifications: INotification[];
  unreadNotificationsCount: number;
};

type UserDataActions = {
  setCart: (cart: ICart | null) => void;
  setWishlist: (wishlist: IWishlist | null) => void;
  setNotifications: (notifications: INotification[]) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
};

const useUserStore = create<UserDataState & UserDataActions>((set, get) => ({
  cart: null,
  wishlist: null,
  notifications: [],
  unreadNotificationsCount: 0,
  setCart: (cart) => set({ cart }),
  setWishlist: (wishlist) => set({ wishlist }),
  setNotifications: (notifications) => set({ 
      notifications: Array.isArray(notifications) ? notifications : [],
      unreadNotificationsCount: Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0
  }),
  markNotificationAsRead: (notificationId) => {
    const notifications = get().notifications.map(n => 
      n._id === notificationId ? { ...n, isRead: true } : n
    );
    set({
      notifications,
      unreadNotificationsCount: notifications.filter(n => !n.isRead).length
    });
  },
  markAllNotificationsAsRead: () => {
    const notifications = get().notifications.map(n => ({ ...n, isRead: true }));
    set({ 
        notifications,
        unreadNotificationsCount: 0 
    });
  },
}));

export default useUserStore;
