import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/api/backendClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);

      if (error.status === 401 || error.status === 403) {
        api.auth.setToken(null);
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required',
        });
      }
    }
  }, []);

  const checkAppState = useCallback(async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      if (api.auth.getToken()) {
        await checkUserAuth();
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred',
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  }, [checkUserAuth]);

  useEffect(() => {
    checkAppState();
  }, [checkAppState]);

  const logout = useCallback(async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    await api.auth.logout();

    if (shouldRedirect) {
      window.location.href = '/login';
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
    }),
    [
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
