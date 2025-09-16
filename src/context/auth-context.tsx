'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  location: string | null;
  isAdmin: boolean;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, location?: string, redirectUrl?: string) => void;
  logout: () => void;
  updateLocation: (newLocation: string) => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
  allUsers: Omit<User, 'isAdmin'>[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@example.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<Omit<User, 'isAdmin'>[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Mock check for authentication status e.g., from localStorage
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("user");
    const storedAllUsers = localStorage.getItem("allUsers");

    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    if (storedAllUsers) {
      setAllUsers(JSON.parse(storedAllUsers));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, location?: string, redirectUrl: string = "/dashboard") => {
    const isAdmin = email === ADMIN_EMAIL;
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const userPayload: User = { name, email, location: location || 'Punjab, India', isAdmin };

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userPayload));

    // Update allUsers list
    const existingUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const userExists = existingUsers.some((u: User) => u.email === email);
    if (!userExists) {
        const newAllUsers = [...existingUsers, { name: userPayload.name, email: userPayload.email, location: userPayload.location }];
        localStorage.setItem("allUsers", JSON.stringify(newAllUsers));
        setAllUsers(newAllUsers);
    }

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
  
  const updateLocation = (newLocation: string) => {
    if (user) {
      const updatedUser = { ...user, location: newLocation };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };
  
  const updateUser = (data: Partial<User>) => {
    if(user) {
        const updatedUser = {...user, ...data};
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateLocation, updateUser, isLoading, allUsers }}>
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
