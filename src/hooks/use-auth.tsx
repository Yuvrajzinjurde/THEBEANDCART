
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
    router.push('/');
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
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<User>(storedToken);

        if (decoded.exp * 1000 < Date.now()) {
          console.log("Session expired, logging out.");
          logout();
          setLoading(false);
          return;
        }

        setUser(decoded);
        setToken(storedToken);

        // Sequentially fetch user data
        const cartRes = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${storedToken}` } });
        if (cartRes.ok) {
            const cartData = await cartRes.json();
            setCart(cartData.cart);
        } else {
            console.error("Failed to fetch cart data during init.");
        }

        const wishlistRes = await fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${storedToken}` } });
        if (wishlistRes.ok) {
            const wishlistData = await wishlistRes.json();
            setWishlist(wishlistData.wishlist);
        } else {
            console.error("Failed to fetch wishlist data during init.");
        }

      } catch (error) {
        console.error("Invalid token during initialization, logging out.", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [login, logout, setCart, setWishlist]);
  
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
