
"use client";

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    router.replace('/login');
  }, [router, setCart, setWishlist]);

  const fetchUserData = useCallback(async (currentToken: string) => {
    try {
        const [cartRes, wishlistRes] = await Promise.all([
          fetch('/api/cart', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
          fetch('/api/wishlist', { headers: { 'Authorization': `Bearer ${currentToken}` } })
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
    } catch (error) {
        console.error("Failed to fetch user data:", error);
        setCart(null);
        setWishlist(null);
    }
  }, [setCart, setWishlist]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  
  return (
    <AuthContext.Provider value={{ user, loading, logout, token }}>
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
