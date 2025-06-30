'use client';

import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as authService from '../services/authService';
import { TOKEN_KEY, USER_KEY, TOKEN_EXPIRY_KEY } from '../services/authService';

// Define Auth Context types
interface AuthContextType {
  user: authService.User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<authService.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return !!user;
  }, [user]);

  // Check if current user is admin - updated to include university admin
  const isAdmin = useMemo(() => {
    if (!user) return false;
    
    // Check all possible type property variations
    const userType = user.userType || user.type || user.user_type;
    return userType === 'admin' || userType === 'university_admin' || user.isAdmin === true;
  }, [user]);

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Initialize auth state on app start
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          console.log('✅ Found existing user:', currentUser.email);
          setUser(currentUser);
        } else {
          console.log('❌ No existing user found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout(); // Clear any corrupted data
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Simple redirect logic - only redirect when necessary
  useEffect(() => {
    if (loading || hasRedirected) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isAdminPage = pathname?.startsWith('/admin');
    const isUniversityAdminPage = pathname?.startsWith('/university-admin');
    const isPublicPage = pathname === '/' || pathname?.startsWith('/verify') || pathname?.startsWith('/about');

    // Get user type with fallback
    const userType = user?.userType || user?.user_type || (user as any)?.type;

    // Only redirect authenticated users away from auth pages
    if (user && isAuthPage) {
      const redirectPath = userType === 'admin' ? '/admin/dashboard' 
        : userType === 'university_admin' ? '/university-admin/dashboard'
        : '/dashboard';
      console.log('👤 Redirecting authenticated user to:', redirectPath);
      setHasRedirected(true);
      router.replace(redirectPath);
    }
    // Only redirect non-admin users from admin pages
    else if (isAdminPage && userType !== 'admin') {
      console.log('❌ Non-admin accessing admin area, redirecting to dashboard');
      setHasRedirected(true);
      router.replace('/dashboard');
    }
    // Only redirect non-university-admin users from university admin pages
    else if (isUniversityAdminPage && userType !== 'university_admin') {
      console.log('❌ Non-university-admin accessing university admin area, redirecting to dashboard');
      setHasRedirected(true);
      router.replace('/dashboard');
    }
  }, [user, loading, pathname, isAdmin, router, hasRedirected]);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful:', data);

      if (data.success && data.token && data.user) {
        // Store token and user data properly using authService
        console.log('💾 Storing authentication data...');
        console.log('🎫 Token:', data.token.substring(0, 20) + '...');
        console.log('👤 User data:', data.user);
        
        // Store using authService methods for consistency
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        // Set user in context
        setUser(data.user);
        
        // Use the redirectPath from backend response
        const redirectPath = data.user.redirectPath;
        console.log(`🎯 Redirecting ${data.user.userType || data.user.user_type} to:`, redirectPath);
        
        // Use router.push instead of window.location.href for better Next.js navigation
        setHasRedirected(true);
        router.push(redirectPath);
        
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logout initiated');
    
    // Clear user state immediately
    setUser(null);
    setHasRedirected(false);
    
    // Clear storage immediately (no async operations)
    authService.logout();
    
    // Immediate redirect - no timeout needed
    router.replace('/login');
    
    console.log('✅ AuthContext: Logout completed');
  };

  // Value object for the context provider
  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAdmin,
    isAuthenticated,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Make sure your User interface includes university_admin
interface User {
  id: string;
  email: string;
  userType: 'admin' | 'student' | 'employer' | 'university_admin'; // Add university_admin here
  // ...other user properties...
}
