import axios, { AxiosError, AxiosInstance } from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api';

// Storage keys
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';
export const TOKEN_EXPIRY_KEY = 'token_expiry';

// User and auth types
export interface User {
  company: boolean;
  company_name: boolean;
  last_name: any;
  first_name: boolean;
  isAdmin: boolean;
  type: string;
  id: string;
  email: string;
  userType: 'admin' | 'student' | 'employer' | 'university_admin';
  user_type?: 'admin' | 'student' | 'employer' | 'university_admin'; // Backward compatibility
  isEmailVerified?: boolean;
  profile?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    permissions?: string[];
    isActive?: boolean;
    universityId?: string;
    title?: string;
    companyName?: string;
    industry?: string;
    country?: string;
    city?: string;
  };
  redirectPath?: string;
}

export interface ProfileData {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  industry?: string;
  country?: string;
  city?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  tokenExpires?: number; // Add this property to fix the type error
}

export interface RegisterData {
  email: string;
  password: string;
  user_type: 'student' | 'employer';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  company_name?: string;
  industry?: string;
  country?: string;
  city?: string;
}

// Auth service
export const authService = {
  // Login function that stores both token and user data
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      // Fix the URL path issue - the error shows it's missing the /api prefix
      const loginUrl = `${API_BASE_URL.includes('/api') ? '' : '/api'}/auth/login`;
      console.log('🔗 Login URL:', `${API_BASE_URL}${loginUrl}`);
      
      const response = await fetch(`${API_BASE_URL}${loginUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful:', data);

      if (data.success && data.token && data.user) {
        // Standardize user object properties before storing
        const standardizedUser = {
          ...data.user,
          // Ensure userType is always set using one of the available properties
          userType: data.user.userType || data.user.type || data.user.user_type || null,
        };
        
        // Store BOTH token and standardized user data
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(standardizedUser));
        
        // Calculate and store token expiry (24 hours from now)
        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        
        console.log('💾 Stored token and user data to localStorage');
        console.log('👤 User data stored:', standardizedUser);
        
        return {
          success: true,
          token: data.token,
          user: standardizedUser,
          message: data.message,
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    try {
      if (typeof window === 'undefined') return null;
      
      const userData = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!userData || !token) {
        console.log('🔍 No user data or token found in localStorage');
        return null;
      }
      
      const user = JSON.parse(userData) as User;
      console.log('🔍 Retrieved user from localStorage:', user.email, user.userType || user.user_type);
      
      // Ensure userType is set for backward compatibility
      if (!user.userType && user.user_type) {
        user.userType = user.user_type;
      }
      
      return user;
    } catch (error) {
      console.error('❌ Error parsing stored user data:', error);
      return null;
    }
  },

  // Get token expiry
  getTokenExpiry: (): number => {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : 0;
    } catch (e) {
      return 0;
    }
  },

  // Check if token is expired or will expire soon (within 5 minutes)
  isTokenExpired: (): boolean => {
    const expiry = authService.getTokenExpiry();
    const currentTime = Math.floor(Date.now() / 1000);
    // Token is expired or will expire in less than 5 minutes
    return expiry <= currentTime + 300;
  },

  // Verify token and get dashboard URL based on user type
  verifyToken: async (): Promise<{isValid: boolean, dashboardUrl: string}> => {
    try {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (!token || !user) {
        console.log('❌ No token or user data found');
        return { isValid: false, dashboardUrl: '/login' };
      }
      
      // Determine dashboard URL based on user type
      let dashboardUrl = '/dashboard'; // default for most users
      
      // Use standardized userType property
      const userType = user.userType || user.type || user.user_type;
      
      if (userType === 'admin' || user.isAdmin === true) {
        dashboardUrl = '/admin/dashboard';
      } else {
        // Student, employer, and university all go to main dashboard
        dashboardUrl = '/dashboard';
      }
      
      console.log(`✅ Token verified, user type: ${userType}, redirecting to: ${dashboardUrl}`);
      return { isValid: true, dashboardUrl };
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return { isValid: false, dashboardUrl: '/login' };
    }
  },

  // Logout user
  logout: (): void => {
    try {
      // Clear localStorage items synchronously
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      
      // Clear session storage
      sessionStorage.removeItem('redirectAfterLogin');
      
      console.log('✅ AuthService: Storage cleared');
    } catch (error) {
      console.error('❌ AuthService: Error clearing storage:', error);
    }
  },

  // Check if current user is admin
  isCurrentUserAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    const isAdmin = user?.userType === 'admin' || user?.isAdmin === true;
    console.log('🔍 Admin check result:', isAdmin, 'for user:', user);
    return isAdmin;
  },

  // Get redirect path based on user type
  getRedirectPath: (user?: User): string => {
    if (!user) {
      console.log('❌ No user provided, defaulting to login');
      return '/login';
    }
    
    console.log('🔍 Determining redirect for user type:', user.userType, 'isAdmin:', user.isAdmin);
    
    if (user.userType === 'admin' || user.isAdmin) {
      console.log('👑 Redirecting admin to admin dashboard');
      return '/admin/dashboard';
    } else if (user.userType === 'student') {
      console.log('🎓 Redirecting student to dashboard');
      return '/dashboard';
    } else if (user.userType === 'employer') {
      console.log('🏢 Redirecting employer to dashboard');
      return '/dashboard';
    } else {
      console.log('❓ Unknown user type, defaulting to dashboard');
      return '/dashboard';
    }
  },

  // Reset password
  resetPassword: async (password: string, accessToken: string, refreshToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          access_token: accessToken,
          refresh_token: refreshToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return {
        success: true,
        message: data.message,
        user: data.user
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reset password'
      };
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send password reset email'
      };
    }
  },

  // Get token for API requests - fix the implementation
  getToken: (): string | null => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        console.log('❌ No token found in localStorage');
        return null;
      }

      // Simple token check without expiry for now to avoid errors
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  },

  // Check if user is authenticated - fix the implementation
  isAuthenticated: (): boolean => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userData = localStorage.getItem(USER_KEY);
      return !!(token && userData);
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  },
};

// Export functions for backward compatibility
export const login = authService.login;
export const getCurrentUser = authService.getCurrentUser;
export const getToken = authService.getToken;
export const isAuthenticated = authService.isAuthenticated;
export const logout = authService.logout;
export const verifyToken = authService.verifyToken;
export async function register(userData: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500'}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Registration failed' };
    }
    // Ensure exact structure: success, token, user fields
    return { success: true, token: data.token, user: data.user };
  } catch (error: any) {
    return { success: false, message: error.message || 'Registration error' };
  }
}

export default authService;

