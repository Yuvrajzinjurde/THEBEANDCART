
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import useUserStore from '@/stores/user-store';

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
    
    // Refresh to ensure all states are cleared and user is redirected if needed.
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
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const decoded = jwtDecode<User>(storedToken);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
            setLoading(false);
            return;
          }
          
          setUser(decoded);
          setToken(storedToken);
          
          // Fetch cart/wishlist
          const [cartRes, wishlistRes] = await Promise.all([
            fetch('/api/cart', { headers: { 'Authorization': `Bearer ${storedToken}` } }),
            fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${storedToken}` } })
          ]);
          
          if (!cartRes.ok || !wishlistRes.ok) {
            // If any fetch fails due to auth (e.g., 401), it signifies a bad token. Logout.
            console.error("Failed to fetch user data, session may be invalid. Logging out.");
            logout();
            setLoading(false);
            return;
          }

          const { cart } = await cartRes.json();
          setCart(cart);

          const { wishlist } = await wishlistRes.json();
          setWishlist(wishlist);

        } catch (error) {
          console.error("Invalid token or failed to fetch user data:", error);
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
