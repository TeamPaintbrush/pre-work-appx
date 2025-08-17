// Custom hook for authentication management

'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { User, UserProfile, UserSession } from '../types/user';
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  useEffect(() => {
    // Initialize auth state from localStorage or session
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        if (new Date(parsedSession.expiresAt) > new Date()) {
          // Session is still valid
          await loadUserData(parsedSession.userId);
          setSession(parsedSession);
        } else {
          // Session expired, try to refresh
          await refreshToken();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // In a real app, this would make API calls
      const userData = await fetchUser(userId);
      const profileData = await fetchProfile(userId);
      
      setUser(userData);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call
      const response = await authenticateUser(credentials);
      
      setUser(response.user);
      setProfile(response.profile);
      setSession({
        userId: response.user.id,
        role: response.user.role,
        organizationId: response.user.organizationId,
        permissions: [], // Would be populated from API
        expiresAt: response.expiresAt
      });

      // Store session
      localStorage.setItem('auth_session', JSON.stringify({
        userId: response.user.id,
        role: response.user.role,
        organizationId: response.user.organizationId,
        expiresAt: response.expiresAt
      }));

      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      }));

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call
      const response = await registerUser(data);
      
      setUser(response.user);
      setProfile(response.profile);
      setSession({
        userId: response.user.id,
        role: response.user.role,
        organizationId: response.user.organizationId,
        permissions: [],
        expiresAt: response.expiresAt
      });

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Clear server session if needed
      await revokeTokens();
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem('auth_session');
      localStorage.removeItem('auth_tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const tokens = localStorage.getItem('auth_tokens');
      if (!tokens) throw new Error('No refresh token available');

      const { refreshToken: token } = JSON.parse(tokens);
      const response = await refreshAuthToken(token);
      
      setSession(prev => prev ? {
        ...prev,
        expiresAt: response.expiresAt
      } : null);

      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!profile) throw new Error('No profile to update');

    try {
      const updatedProfile = await updateUserProfile(profile.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateProfile
  };
};

// Mock API functions - replace with actual API calls
async function authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response
  return {
    user: {
      id: '1',
      email: credentials.email,
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    profile: {
      id: '1',
      userId: '1',
      firstName: 'John',
      lastName: 'Doe',
      timezone: 'UTC',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        inApp: true,
        taskUpdates: true,
        approvalRequests: true,
        systemAlerts: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  };
}

async function registerUser(data: RegisterData): Promise<AuthResponse> {
  // Mock implementation
  return authenticateUser({ email: data.email, password: data.password });
}

async function fetchUser(userId: string): Promise<User> {
  // Mock implementation
  return {
    id: userId,
    email: 'user@example.com',
    role: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function fetchProfile(userId: string): Promise<UserProfile> {
  // Mock implementation
  return {
    id: userId,
    userId,
    firstName: 'John',
    lastName: 'Doe',
    timezone: 'UTC',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      inApp: true,
      taskUpdates: true,
      approvalRequests: true,
      systemAlerts: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function refreshAuthToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  // Mock implementation
  return {
    accessToken: 'new_access_token',
    refreshToken: 'new_refresh_token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  };
}

async function revokeTokens(): Promise<void> {
  // Mock implementation
}

async function updateUserProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  // Mock implementation
  return {
    id: profileId,
    userId: profileId,
    firstName: 'John',
    lastName: 'Doe',
    timezone: 'UTC',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      inApp: true,
      taskUpdates: true,
      approvalRequests: true,
      systemAlerts: false
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...updates
  };
}

export { AuthContext };
