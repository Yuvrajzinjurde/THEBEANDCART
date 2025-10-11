
"use client";

import React, { useEffect, createContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/stores/user-store';
import { create } from 'zustand';

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
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

export const AuthContext = createContext<AuthState>(useAuthStore.getState());

export const useAuth = () => {
    return useAuthStore(state => state);
};

const AuthHandler = () => {
    const router = useRouter();
    const { user, setUser, setLoading } = useAuthStore();
    const { setCart, setWishlist, setNotifications } = useUserStore();

    const fetchUserData = useCallback(async () => {
        try {
            const token = useAuthStore.getState().token;
            if (!token) return;

            const [cartRes, wishlistRes, notificationsRes] = await Promise.all([
                fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (cartRes.ok) setCart(await cartRes.json().then(d => d.cart));
            if (wishlistRes.ok) setWishlist(await wishlistRes.json().then(d => d.wishlist));
            if (notificationsRes.ok) setNotifications(await notificationsRes.json().then(d => d.notifications));
        } catch (error) {
            console.error("Failed to fetch user data in background:", error);
        }
    }, [setCart, setWishlist, setNotifications]);

    const checkUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const { user: userData } = await res.json();
                setUser(userData);
                 // The token is managed by httpOnly cookie, but we can set a dummy one for client-side checks
                useAuthStore.setState({ token: 'authenticated' });
            } else {
                setUser(null);
                useAuthStore.setState({ token: null });
            }
        } catch (error) {
            console.error('Failed to check user status', error);
            setUser(null);
            useAuthStore.setState({ token: null });
        } finally {
            setLoading(false);
        }
    }, [setUser, setLoading]);

    const handleLogout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            useAuthStore.setState({ token: null });
            setCart(null);
            setWishlist(null);
            setNotifications([]);
            router.push('/login');
        }
    }, [router, setUser, setCart, setWishlist, setNotifications]);
    
    useEffect(() => {
        useAuthStore.setState({ logout: handleLogout });
        checkUser();
    }, [checkUser, handleLogout]);
    
    useEffect(() => {
        if(user) {
            fetchUserData();
        }
    }, [user, fetchUserData])

    return null; // This component does not render anything
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <AuthHandler />
      {children}
    </>
  );
};
