/**
 * AWS COGNITO AUTHENTICATION PROVIDER
 * Production-ready authentication with AWS Cognito
 * Replaces the mock authentication system
 */

'use client';

import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { authService, AuthUser, AuthSession, LoginCredentials, RegisterData, PasswordResetData } from '../services/auth/AWSCognitoAuthService';

interface AuthContextValue {
  // State
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string; requiresMFA?: boolean }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  confirmPasswordReset: (data: PasswordResetData) => Promise<{ success: boolean; message: string }>;
  refreshSession: () => Promise<void>;
}

const CognitoAuthContext = createContext<AuthContextValue | undefined>(undefined);

interface CognitoAuthProviderProps {
  children: ReactNode;
}

/**
 * AWS Cognito Authentication Provider Component
 * Wraps the application to provide authentication context
 */
export function CognitoAuthProvider({ children }: CognitoAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!session && authService.isAuthenticated();

  /**
   * Initialize authentication state
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Try to refresh session to get latest tokens
          const refreshedSession = await authService.refreshSession();
          setSession(refreshedSession);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
      if (!authUser) {
        setSession(null);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.session) {
        setUser(result.session.user);
        setSession(result.session);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify email address
   */
  const verifyEmail = useCallback(async (email: string, code: string) => {
    setIsLoading(true);
    
    try {
      const result = await authService.verifyEmail(email, code);
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    
    try {
      const result = await authService.requestPasswordReset(email);
      return result;
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: 'Password reset request failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Confirm password reset
   */
  const confirmPasswordReset = useCallback(async (data: PasswordResetData) => {
    setIsLoading(true);
    
    try {
      const result = await authService.confirmPasswordReset(data);
      return result;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh current session
   */
  const refreshSession = useCallback(async () => {
    if (!user) return;
    
    try {
      const refreshedSession = await authService.refreshSession();
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      // If refresh fails, logout user
      await logout();
    }
  }, [user, logout]);

  /**
   * Auto-refresh session before expiry
   */
  useEffect(() => {
    if (!session || !isAuthenticated) return;

    const timeUntilExpiry = session.expiresAt.getTime() - Date.now();
    const refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiry

    if (timeUntilExpiry <= refreshBuffer) {
      // Session is about to expire, refresh immediately
      refreshSession();
      return;
    }

    // Set timer to refresh session before expiry
    const refreshTimer = setTimeout(() => {
      refreshSession();
    }, timeUntilExpiry - refreshBuffer);

    return () => clearTimeout(refreshTimer);
  }, [session, isAuthenticated, refreshSession]);

  const contextValue: AuthContextValue = {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    verifyEmail,
    requestPasswordReset,
    confirmPasswordReset,
    refreshSession
  };

  return (
    <CognitoAuthContext.Provider value={contextValue}>
      {children}
    </CognitoAuthContext.Provider>
  );
}

/**
 * Hook to use AWS Cognito authentication context
 */
export function useCognitoAuth(): AuthContextValue {
  const context = useContext(CognitoAuthContext);
  
  if (context === undefined) {
    throw new Error('useCognitoAuth must be used within a CognitoAuthProvider');
  }
  
  return context;
}

/**
 * Hook for checking if user has specific role/permission
 */
export function useCognitoAuthPermissions() {
  const { user } = useCognitoAuth();
  
  const hasRole = useCallback((requiredRole: string): boolean => {
    if (!user || !user.role) return false;
    return user.role === requiredRole;
  }, [user]);
  
  const hasAnyRole = useCallback((requiredRoles: string[]): boolean => {
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  }, [user]);
  
  const isOrganizationMember = useCallback((organizationId: string): boolean => {
    if (!user || !user.organization) return false;
    return user.organization === organizationId;
  }, [user]);
  
  const isEmailVerified = useCallback((): boolean => {
    return user?.isEmailVerified === true;
  }, [user]);
  
  const hasMFA = useCallback((): boolean => {
    return user?.mfaEnabled === true;
  }, [user]);
  
  return {
    hasRole,
    hasAnyRole,
    isOrganizationMember,
    isEmailVerified,
    hasMFA,
    user
  };
}

/**
 * Hook for authentication guards
 */
export function useCognitoAuthGuard() {
  const { isAuthenticated, isLoading, user } = useCognitoAuth();
  
  const requireAuth = useCallback((redirectTo?: string) => {
    if (isLoading) return { allowed: false, reason: 'loading' };
    if (!isAuthenticated) {
      if (redirectTo && typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return { allowed: false, reason: 'unauthenticated' };
    }
    return { allowed: true, reason: 'authenticated' };
  }, [isAuthenticated, isLoading]);
  
  const requireRole = useCallback((requiredRole: string, redirectTo?: string) => {
    const authCheck = requireAuth(redirectTo);
    if (!authCheck.allowed) return authCheck;
    
    if (!user?.role || user.role !== requiredRole) {
      if (redirectTo && typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return { allowed: false, reason: 'insufficient_role' };
    }
    
    return { allowed: true, reason: 'authorized' };
  }, [requireAuth, user]);
  
  const requireEmailVerification = useCallback((redirectTo?: string) => {
    const authCheck = requireAuth(redirectTo);
    if (!authCheck.allowed) return authCheck;
    
    if (!user?.isEmailVerified) {
      if (redirectTo && typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return { allowed: false, reason: 'email_not_verified' };
    }
    
    return { allowed: true, reason: 'verified' };
  }, [requireAuth, user]);
  
  return {
    requireAuth,
    requireRole,
    requireEmailVerification,
    isAuthenticated,
    isLoading,
    user
  };
}
