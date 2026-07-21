'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const PORTAL_SESSION_KEY = 'ctsda_portal_session';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  sessionId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (sessionId: string, user: AuthUser) => void;
  logout: () => void;
  /** Returns stored session ID for use in fetch headers */
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Re-hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(PORTAL_SESSION_KEY);
      const storedUser = localStorage.getItem(`${PORTAL_SESSION_KEY}_user`);
      if (storedSession && storedUser) {
        setSessionId(storedSession);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem(PORTAL_SESSION_KEY);
      localStorage.removeItem(`${PORTAL_SESSION_KEY}_user`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newSessionId: string, newUser: AuthUser) => {
    localStorage.setItem(PORTAL_SESSION_KEY, newSessionId);
    localStorage.setItem(`${PORTAL_SESSION_KEY}_user`, JSON.stringify(newUser));
    setSessionId(newSessionId);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(PORTAL_SESSION_KEY);
    localStorage.removeItem(`${PORTAL_SESSION_KEY}_user`);
    setSessionId(null);
    setUser(null);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const sid = localStorage.getItem(PORTAL_SESSION_KEY);
    if (!sid) return {};
    return { 'X-Session-Id': sid };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionId,
        isLoading,
        isAuthenticated: !!user && !!sessionId,
        login,
        logout,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth context — must be used inside <AuthProvider /> */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
