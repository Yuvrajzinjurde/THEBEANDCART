
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import useUserStore from '@/stores/user-store';
import { Loader } from '@/components/ui/loader';

export interface User {
  userId: string;
  roles: string[];
  name: string;
  exp: number;
  brand?: string;
  profilePicUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  token: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setCart, setWishlist } = useUserStore();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setCart(null);
    setWishlist(null);
    router.refresh();
  }, [router, setCart, setWishlist]);
  
  const login = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken);
    try {
        const decoded = jwtDecode<User>(newToken);
        setUser(decoded);
        setToken(newToken);
    } catch (error) {
        console.error("Failed to decode token on login:", error);
        logout();
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const decoded = jwtDecode<User>(storedToken);
          
          // **THE FIX**: Only call logout if the token is definitively expired.
          if (decoded.exp * 1000 < Date.now()) {
            console.log("Session expired, logging out.");
            logout();
            setLoading(false);
            return;
          }

          // If token is valid, set user state and then fetch data.
          setUser(decoded);
          setToken(storedToken);

          const [cartRes, wishlistRes] = await Promise.all([
            fetch('/api/cart', { headers: { 'Authorization': `Bearer ${storedToken}` } }),
            fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${storedToken}` } })
          ]);

          // Gracefully handle API errors without logging out.
          if (cartRes.ok) {
            const { cart } = await cartRes.json();
            setCart(cart);
          } else {
            console.error("Failed to fetch cart data during init.");
          }

          if (wishlistRes.ok) {
            const { wishlist } = await wishlistRes.json();
            setWishlist(wishlist);
          } else {
            console.error("Failed to fetch wishlist data during init.");
          }

        } catch (error) {
          console.error("Invalid token during initialization, logging out.", error);
          logout();
        }
      }
      
      setLoading(false);
    }
    
    initializeAuth();
  }, [logout, setCart, setWishlist]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-12 w-12" />
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
