
"use client";

import React, { useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import useUserStore from '@/stores/user-store';
import { create } from 'zustand';

interface User {
  userId: string;
  roles: string[];
  name: string;
  exp: number;
  brand?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
}));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { setUser, setToken, setLoading, user } = useAuthStore();
  const { setCart, setWishlist, setNotifications } = useUserStore();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setCart(null);
    setWishlist(null);
    setNotifications([]);
    router.replace('/login');
  }, [router, setUser, setToken, setCart, setWishlist, setNotifications]);

  const fetchUserData = useCallback(async (currentToken: string) => {
    try {
        const [cartRes, wishlistRes, notificationsRes] = await Promise.all([
          fetch('/api/cart', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
          fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
          fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
        ]);

        if (cartRes.ok) {
            const { cart } = await cartRes.json();
            setCart(cart);
        }
        if (wishlistRes.ok) {
            const { wishlist } = await wishlistRes.json();
            setWishlist(wishlist);
        }
        if (notificationsRes.ok) {
            const { notifications } = await notificationsRes.json();
            setNotifications(notifications);
        }
    } catch (error) {
        console.error("Failed to fetch user data in background:", error);
    }
  }, [setCart, setWishlist, setNotifications]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      try {
        const decoded = jwtDecode<User>(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
          setToken(storedToken);
          fetchUserData(storedToken); 
        }
      } catch (error) {
        console.error("Invalid token on load:", error);
        logout();
      }
    }
    setLoading(false);
  }, [logout, setUser, setToken, fetchUserData]); 

  // Create a value object that includes the logout function
  const authContextValue = {
    ...useAuthStore(),
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue as any}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth store and context
export const useAuth = () => {
    const store = useAuthStore();
    const context = useContext(AuthContext);

    if (context === undefined) {
        // This might happen on the very first render before the provider is mounted.
        // We can return the store's state and a placeholder logout.
        return { ...store, logout: () => {} };
    }
    
    // The context holds the logout function
    return { ...store, logout: context.logout };
};

// Create the context
const AuthContext = createContext<{ logout: () => void; } | undefined>(undefined);
