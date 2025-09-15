"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  isAuthenticated: boolean;
  location: string | null;
  login: (location?: string, redirectUrl?: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock check for authentication status e.g., from localStorage
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedLocation = localStorage.getItem("userLocation");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
      setLocation(storedLocation);
    }
    setIsLoading(false);
  }, []);

  const login = (location?: string, redirectUrl: string = "/dashboard") => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
    if (location) {
        localStorage.setItem("userLocation", location);
        setLocation(location);
    }
    router.push(redirectUrl);
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userLocation");
    setIsAuthenticated(false);
    setLocation(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, location, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
