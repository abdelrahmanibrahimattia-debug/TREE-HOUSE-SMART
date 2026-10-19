import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('th_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('th_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth expired events from api client
    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('th_auth_expired', handleExpired);
    return () => window.removeEventListener('th_auth_expired', handleExpired);
  }, []);

  useEffect(() => {
    // Verify session on mount if token exists
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('th_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('th_user', JSON.stringify(userData));
    localStorage.setItem('th_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('th_user');
    localStorage.removeItem('th_token');
  };

  /**
   * Granular permission checker (Strict Deny-By-Default)
   * Returns true only if user is OWNER or explicitly has permission.
   */
  const hasPermission = (permissionCode) => {
    if (!user) return false;
    if (user.role === 'OWNER') return true;
    const permissions = user.permissions || {};
    return Boolean(permissions[permissionCode]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        hasPermission,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
