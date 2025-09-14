
"use client";

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  userId: string;
  roles: string[];
  name: string;
  exp: number;
  brand?: string; // Add brand to user type
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const brandName = params.brand as string || 'reeva';

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    const isAuthPage = /login|signup/.test(pathname);
    if (!isAuthPage) {
      router.push(`/${brandName}/login`);
    }
  }, [router, pathname, brandName]);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    } else {
        setUser(null);
    }
    setLoading(false);
  }, [logout, pathname]); // Rerun on path change
  
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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
