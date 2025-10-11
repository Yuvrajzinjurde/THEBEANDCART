"use client";

import React, { useEffect, createContext, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/stores/user-store';
import { create } from 'zustand';
import { Loader } from '@/components/ui/loader';

export interface User {
  userId: string;
  roles: string[];
  name: string;
  brand?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  login: (user, token) => set({ user, token, loading: false }),
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      set({ user: null, token: null, loading: false });
      useUserStore.getState().setCart(null);
      useUserStore.getState().setWishlist(null);
      useUserStore.getState().setNotifications([]);
    }
  },
  checkUser: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const { user: userData } = await res.json();
        const token = 'authenticated'; // Since we are using httpOnly cookies, we just need a truthy value
        
        // Fetch user-specific data after confirming authentication
        const [cartRes, wishlistRes, notificationsRes] = await Promise.all([
            fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (cartRes.ok) useUserStore.getState().setCart(await cartRes.json().then(d => d.cart));
        if (wishlistRes.ok) useUserStore.getState().setWishlist(await wishlistRes.json().then(d => d.wishlist));
        if (notificationsRes.ok) useUserStore.getState().setNotifications(await notificationsRes.json().then(d => d.notifications));

        set({ user: userData, token, loading: false });
      } else {
        set({ user: null, token: null, loading: false });
      }
    } catch (error) {
      console.error('Failed to check user status', error);
      set({ user: null, token: null, loading: false });
    }
  },
}));

export const AuthContext = createContext<Omit<AuthState, 'checkUser'>>(useAuthStore.getState());

export const useAuth = () => {
  return useAuthStore(state => ({
    user: state.user,
    token: state.token,
    loading: state.loading,
    login: state.login,
    logout: state.logout,
  }));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkUser, loading } = useAuthStore();

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

  return (
    <AuthContext.Provider value={useAuthStore.getState()}>
      {children}
    </AuthContext.Provider>
  );
};