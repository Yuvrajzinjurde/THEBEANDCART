
"use client";

import React, { useEffect, createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/stores/user-store';
import { create } from 'zustand';
import { Loader } from '@/components/ui/loader';
import Cookies from 'js-cookie';
import usePlatformSettingsStore from '@/stores/platform-settings-store';

const CART_UPDATE_EVENT_KEY = 'cart-last-updated';

export interface User {
  _id: string;
  sub: string; // Ensure sub is part of the User interface for consistency
  roles: string[];
  name: string;
  brand?: string;
  profilePicUrl?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  displayName?: string;
  phone?: string;
  isPhoneVerified: boolean;
  whatsapp?: string;
  socials?: {
    website?: string;
    telegram?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

const fetchUserData = (token: string) => {
    if (!token) return;
    Promise.all([
        fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } }),
    ]).then(async ([cartRes, wishlistRes, notificationsRes]) => {
        try {
            if (cartRes.ok) {
                const { cart } = await cartRes.json();
                useUserStore.getState().setCart(cart);
            }
            if (wishlistRes.ok) {
                const { wishlist } = await wishlistRes.json();
                useUserStore.getState().setWishlist(wishlist);
            }
            if (notificationsRes.ok) {
                const { notifications } = await notificationsRes.json();
                useUserStore.getState().setNotifications(notifications);
            }
        } catch (error) {
            console.error("Error fetching user data in background:", error);
        }
    }).catch(error => {
        console.error("Failed to fetch user-specific data:", error);
    });
};

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,
  login: (user, token) => {
    const enrichedUser = { ...user, sub: user._id };
    Cookies.set('accessToken', token, { expires: 1 / 96, path: '/' }); 
    set({ user: enrichedUser, token, loading: false });
    if(token) fetchUserData(token);
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      set({ user: null, token: null, loading: false });
      useUserStore.getState().setCart(null);
      useUserStore.getState().setWishlist(null);
      useUserStore.getState().setNotifications([]);
    }
  },
  checkUser: async () => {
    if (typeof window === 'undefined') {
        set({ loading: false });
        return;
    }
    
    set({ loading: true });
    
    const token = Cookies.get('accessToken');
    if (!token) {
        await get().logout();
        set({ loading: false });
        return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const { user: userData, token: newToken } = await res.json();
        get().login(userData, newToken);
      } else {
        await get().logout();
      }
    } catch (error) {
      console.error('Failed to check user status', error);
      await get().logout();
    } finally {
        set({ loading: false });
    }
  },
}));

export const useAuth = () => {
    const state = useAuthStore();
    return state;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkUser, loading } = useAuthStore();
  const { fetchSettings } = usePlatformSettingsStore();

  useEffect(() => {
    const initializeApp = async () => {
      await fetchSettings();
      await checkUser();
    }
    initializeApp();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-12 w-12" />
      </div>
    );
  }

  return <>{children}</>;
};
