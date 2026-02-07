"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load token from localStorage on mount
    const storedToken = localStorage.getItem("openbao_token");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoaded(true);
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("openbao_token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("openbao_token");
  };

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  // Don't render children until we've loaded the token from localStorage
  if (!isLoaded) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
