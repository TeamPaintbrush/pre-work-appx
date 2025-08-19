import { useState, useEffect, useCallback } from 'react';
import { ssoService, SSOProvider, SSOSession, SSOLoginRequest, SSOLoginResponse } from '../services/auth/SSOService';

export interface UseSSO {
  providers: SSOProvider[];
  activeProviders: SSOProvider[];
  loading: boolean;
  error: string | null;
  currentSession: SSOSession | null;
  configureProvider: (providerId: string, config: any) => Promise<boolean>;
  initiateLogin: (request: SSOLoginRequest) => Promise<SSOLoginResponse>;
  logout: (sessionId: string) => Promise<boolean>;
  testProvider: (providerId: string) => Promise<boolean>;
  refreshProviders: () => void;
  clearError: () => void;
}

export const useSSO = (): UseSSO => {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<SSOSession | null>(null);

  const refreshProviders = useCallback(() => {
    try {
      const allProviders = ssoService.getProviders();
      setProviders(allProviders);
      setError(null);
      
      // Check for existing session
      const sessionId = localStorage.getItem('sso_session_id');
      if (sessionId) {
        const session = ssoService.getSession(sessionId);
        setCurrentSession(session?.isActive ? session : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SSO providers');
    } finally {
      setLoading(false);
    }
  }, []);

  const configureProvider = useCallback(async (providerId: string, config: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await ssoService.configureProvider(providerId, config);
      refreshProviders();
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to configure provider';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshProviders]);

  const initiateLogin = useCallback(async (request: SSOLoginRequest): Promise<SSOLoginResponse> => {
    try {
      setError(null);
      const response = await ssoService.initiateLogin(request);
      
      if (response.success && response.redirectUrl) {
        // Redirect to SSO provider
        window.location.href = response.redirectUrl;
      } else if (!response.success) {
        setError(response.error || 'Login initiation failed');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  const logout = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await ssoService.logout(sessionId);
      
      if (success) {
        setCurrentSession(null);
        localStorage.removeItem('sso_session_id');
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      return false;
    }
  }, []);

  const testProvider = useCallback(async (providerId: string): Promise<boolean> => {
    try {
      setError(null);
      return await ssoService.testProvider(providerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Provider test failed');
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    refreshProviders();
  }, [refreshProviders]);

  const activeProviders = providers.filter(provider => provider.status === 'active');

  return {
    providers,
    activeProviders,
    loading,
    error,
    currentSession,
    configureProvider,
    initiateLogin,
    logout,
    testProvider,
    refreshProviders,
    clearError
  };
};

export interface UseSSOMeta {
  provider: SSOProvider | null;
  loading: boolean;
  error: string | null;
  isActive: boolean;
  configure: (config: any) => Promise<boolean>;
  test: () => Promise<boolean>;
  getMetadata: () => string | null;
  clearError: () => void;
}

export const useSSOProvider = (providerId: string): UseSSOMeta => {
  const [provider, setProvider] = useState<SSOProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProvider = useCallback(() => {
    try {
      const currentProvider = ssoService.getProvider(providerId);
      setProvider(currentProvider || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  const configure = useCallback(async (config: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await ssoService.configureProvider(providerId, config);
      refreshProvider();
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Configuration failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [providerId, refreshProvider]);

  const test = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      return await ssoService.testProvider(providerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Provider test failed');
      return false;
    }
  }, [providerId]);

  const getMetadata = useCallback((): string | null => {
    return provider?.metadata || null;
  }, [provider]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    refreshProvider();
  }, [refreshProvider]);

  const isActive = provider?.status === 'active';

  return {
    provider,
    loading,
    error,
    isActive,
    configure,
    test,
    getMetadata,
    clearError
  };
};

export interface UseSSOSession {
  session: SSOSession | null;
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  error: string | null;
  logout: () => Promise<boolean>;
  refreshSession: () => void;
  clearError: () => void;
}

export const useSSOSession = (): UseSSOSession => {
  const [session, setSession] = useState<SSOSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(() => {
    try {
      const sessionId = localStorage.getItem('sso_session_id');
      if (sessionId) {
        const currentSession = ssoService.getSession(sessionId);
        setSession(currentSession?.isActive ? currentSession : null);
      } else {
        setSession(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      
      if (session) {
        const success = await ssoService.logout(session.id);
        if (success) {
          setSession(null);
          localStorage.removeItem('sso_session_id');
        }
        return success;
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      return false;
    }
  }, [session]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const isAuthenticated = !!session?.isActive;
  const user = session?.attributes || null;

  return {
    session,
    isAuthenticated,
    user,
    loading,
    error,
    logout,
    refreshSession,
    clearError
  };
};

// Hook for handling SSO callback
export interface UseSSOCallback {
  handleCallback: (providerId: string, callbackData: any, state: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useSSOCallback = (): UseSSOCallback => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCallback = useCallback(async (
    providerId: string,
    callbackData: any,
    state: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await ssoService.handleCallback(providerId, callbackData, state);
      
      if (session) {
        localStorage.setItem('sso_session_id', session.id);
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Callback handling failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleCallback,
    loading,
    error,
    clearError
  };
};
