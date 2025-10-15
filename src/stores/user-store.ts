
"use client";

import { create } from 'zustand';
import type { ICart } from '@/models/cart.model';
import type { IWishlist } from '@/models/wishlist.model';
import type { INotification } from '@/models/notification.model';
import { type User, useAuth } from '@/hooks/use-auth';

// Key for localStorage to signal cart updates
const CART_UPDATE_EVENT_KEY = 'cart-last-updated';

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

const useUserStore = create<UserDataState & UserDataActions>((set, get) => ({
  cart: null,
  wishlist: null,
  notifications: [],
  setCart: (cart) => {
    set({ cart });
    // When the cart is updated, broadcast the change to other tabs using localStorage.
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(CART_UPDATE_EVENT_KEY, Date.now().toString());
    }
  },
  setWishlist: (wishlist) => set({ wishlist }),
  setNotifications: (notifications) => set({ 
      notifications: Array.isArray(notifications) ? notifications : [],
  }),
  markNotificationAsRead: (notificationId) => {
    const { user } = useAuth.getState();
    if (!user) return;

    set(state => ({
      notifications: state.notifications.map(n => 
        n._id === notificationId ? { ...n, readBy: [...n.readBy, user._id as any] } : n
      ),
    }));
  },
  markAllNotificationsAsRead: () => {
    const { user } = useAuth.getState();
    if (!user) return;

    set(state => ({ 
        notifications: state.notifications.map(n => {
            if (n.readBy.includes(user._id as any)) {
                return n;
            }
            return { ...n, readBy: [...n.readBy, user._id as any] };
        }),
    }));
  },
}));

// Add a selector for unread count that depends on the auth state
export const useUnreadNotificationsCount = () => {
    const { user } = useAuth();
    const notifications = useUserStore(state => state.notifications);
    return Array.isArray(notifications) 
        ? notifications.filter(n => !n.readBy.includes(user?._id as any)).length 
        : 0;
}


export default useUserStore;
