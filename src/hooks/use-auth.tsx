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
          if (decoded.exp * 1000 < Date.now()) {
            // Token is expired, clear it but don't cause a full error state.
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          } else {
            // Token is valid, set user and token state first
            setUser(decoded);
            setToken(storedToken);
            
            // Now, fetch user-specific data
            const [cartRes, wishlistRes] = await Promise.all([
              fetch('/api/cart', { headers: { 'Authorization': `Bearer ${storedToken}` } }),
              fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${storedToken}` } })
            ]);
            
            // Only proceed if API calls are successful. If not, it means the server session is invalid.
            if (cartRes.ok && wishlistRes.ok) {
                const { cart } = await cartRes.json();
                setCart(cart);
                const { wishlist } = await wishlistRes.json();
                setWishlist(wishlist);
            } else {
                // If API calls fail, it means the server session is invalid. Log out cleanly.
                console.error("Failed to fetch user data, session may be invalid. Logging out.");
                logout();
            }
          }
        } catch (error) {
          console.error("Invalid token during initialization:", error);
          logout(); 
        }
      }
      // Finished loading, regardless of outcome.
      setLoading(false); 
    }
    initializeAuth();
  }, [logout, setCart, setWishlist]); 

  // While checking for the token, show a full-page loader.
  // This prevents the rest of the app from rendering and making premature API calls.
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
