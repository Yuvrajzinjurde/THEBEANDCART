
"use client";

import React, { useEffect, createContext, useContext, useCallback } from 'react';
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
  loading: boolean;
  checkUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  checkUser: async () => {}, // Placeholder
  logout: async () => {}, // Placeholder
}));

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { setCart, setWishlist, setNotifications } = useUserStore();

    const fetchUserData = useCallback(async () => {
        try {
            const [cartRes, wishlistRes, notificationsRes] = await Promise.all([
                fetch('/api/cart'),
                fetch('/api/wishlist'),
                fetch('/api/notifications'),
            ]);

            if (cartRes.ok) setCart(await cartRes.json().then(d => d.cart));
            if (wishlistRes.ok) setWishlist(await wishlistRes.json().then(d => d.wishlist));
            if (notificationsRes.ok) setNotifications(await notificationsRes.json().then(d => d.notifications));
        } catch (error) {
            console.error("Failed to fetch user data in background:", error);
        }
    }, [setCart, setWishlist, setNotifications]);

    const checkUser = useCallback(async () => {
        useAuthStore.setState({ loading: true });
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const { user } = await res.json();
                useAuthStore.setState({ user });
                await fetchUserData();
            } else {
                useAuthStore.setState({ user: null });
            }
        } catch (error) {
            console.error('Failed to check user status', error);
            useAuthStore.setState({ user: null });
        } finally {
            useAuthStore.setState({ loading: false });
        }
    }, [fetchUserData]);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            useAuthStore.setState({ user: null });
            setCart(null);
            setWishlist(null);
            setNotifications([]);
            router.push('/login');
        }
    }, [router, setCart, setWishlist, setNotifications]);

    useEffect(() => {
        useAuthStore.setState({ checkUser, logout });
        checkUser();
    }, [checkUser, logout]);

    return <>{children}</>;
};

export const AuthContext = createContext<AuthState>(useAuthStore.getState());

export const useAuth = () => {
    return useAuthStore(state => state);
};

export { AuthProvider };
