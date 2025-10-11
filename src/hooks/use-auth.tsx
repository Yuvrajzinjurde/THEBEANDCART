
"use client";

import React, { useEffect, createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/stores/user-store';
import { create } from 'zustand';
import { Loader } from '@/components/ui/loader';
import Cookies from 'js-cookie';

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

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,
  login: (user, token) => {
    Cookies.set('accessToken', token, { expires: 1/96 }); // 15 minutes
    set({ user, token, loading: false });
    
    // Fetch user-specific data
    Promise.all([
      fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } }),
    ]).then(async ([cartRes, wishlistRes, notificationsRes]) => {
      if (cartRes.ok) useUserStore.getState().setCart(await cartRes.json().then(d => d.cart));
      if (wishlistRes.ok) useUserStore.getState().setWishlist(await wishlistRes.json().then(d => d.wishlist));
      if (notificationsRes.ok) useUserStore.getState().setNotifications(await notificationsRes.json().then(d => d.notifications));
    });
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
    const token = Cookies.get('accessToken');
    if (token) {
        // Assume token is valid for initial render, fetch to verify
        // This makes the UI feel faster
        set({ token, loading: true }); 
    }

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const { user: userData, token: newToken } = await res.json();
        
        // This is the login function from this store
        get().login(userData, newToken);

      } else {
        get().logout();
      }
    } catch (error) {
      console.error('Failed to check user status', error);
      get().logout();
    } finally {
        set({ loading: false });
    }
  },
}));

export const useAuth = () => {
  return useAuthStore(state => ({
    user: state.user,
    loading: state.loading,
    login: state.login,
    logout: state.logout,
    token: state.token
  }));
};

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
