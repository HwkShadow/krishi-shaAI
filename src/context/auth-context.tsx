"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  location: string | null;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, location?: string, redirectUrl?: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock check for authentication status e.g., from localStorage
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("user");
    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, location?: string, redirectUrl: string = "/dashboard") => {
    const name = email.split('@')[0];
    const userPayload: User = { name, email, location: location || null };

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userPayload));

    setIsAuthenticated(true);
    setUser(userPayload);
    
    router.push(redirectUrl);
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
