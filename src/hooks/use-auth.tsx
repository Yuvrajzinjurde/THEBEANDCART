
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import useUserStore from '@/stores/user-store';

interface User {
  userId: string;
  roles: string[];
  name: string;
  exp: number;
  brand?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    
    // Redirect to the global login page and refresh
    router.push(`/login`);
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
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            setUser(decoded);
            setToken(storedToken);
            
            // Fetch cart/wishlist
            const [cartRes, wishlistRes] = await Promise.all([
              fetch('/api/cart', { headers: { 'Authorization': `Bearer ${storedToken}` } }),
              fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${storedToken}` } })
            ]);
            
            if (cartRes.ok) {
              const { cart } = await cartRes.json();
              setCart(cart);
            } else {
                setCart(null);
            }
            if (wishlistRes.ok) {
              const { wishlist } = await wishlistRes.json();
              setWishlist(wishlist);
            } else {
                setWishlist(null);
            }
          }
        } catch (error) {
          console.error("Invalid token:", error);
          logout();
        }
      } else {
          setUser(null);
          setToken(null);
          setCart(null);
          setWishlist(null);
      }
      setLoading(false);
    }
    initializeAuth();
  }, [logout, setCart, setWishlist]); 
  
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
