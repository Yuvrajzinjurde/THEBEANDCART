
"use client";

import React, { useEffect, createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/stores/user-store';
import { create } from 'zustand';
import { Loader } from '@/components/ui/loader';
import Cookies from 'js-cookie';

export interface User {
  _id: string;
  roles: string[];
  name: string;
  brand?: string;
  profilePicUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkUser: () => Promise<void>;
}

const fetchUserData = (token: string) => {
    if (!token) return;
    // Fire-and-forget data fetching.
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
    Cookies.set('accessToken', token, { expires: 1 / 96, path: '/' }); // 15 minutes
    set({ user, token, loading: false });
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
    // Only run on the client
    if (typeof window === 'undefined') {
        set({ loading: false });
        return;
    }
    
    set({ loading: true });
    
    try {
      const res = await fetch('/api/auth/me');
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

// Export the hook
export const useAuth = () => useAuthStore(state => ({
    user: state.user,
    loading: state.loading,
    login: state.login,
    logout: state.logout,
    token: state.token,
    checkUser: state.checkUser, // Expose checkUser
}));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkUser = useAuthStore(state => state.checkUser);
  const loading = useAuthStore(state => state.loading);

  useEffect(() => {
    checkUser();
  }, [checkUser]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-12 w-12" />
      </div>
    );
  }

  return <>{children}</>;
};
