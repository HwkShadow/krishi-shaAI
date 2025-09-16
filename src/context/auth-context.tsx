'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  location: string | null;
  isAdmin: boolean;
  memberSince: string;
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
    } else {
        // If allUsers isn't there, but a logged in user is, create it.
        if (storedUser) {
            const currentUser = JSON.parse(storedUser);
            const initialUsers = [{name: currentUser.name, email: currentUser.email, location: currentUser.location, memberSince: currentUser.memberSince }];
            setAllUsers(initialUsers);
            localStorage.setItem("allUsers", JSON.stringify(initialUsers));
        }
    }

    setIsLoading(false);
  }, []);

  const login = (email: string, location?: string, redirectUrl: string = "/dashboard") => {
    const isAdmin = email === ADMIN_EMAIL;
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const existingUsers: Omit<User, 'isAdmin'>[] = JSON.parse(localStorage.getItem("allUsers") || "[]");
    let userToLogin = existingUsers.find(u => u.email === email);
    let userPayload: User;
    let newAllUsers: Omit<User, 'isAdmin'>[] = [...existingUsers];

    if (userToLogin) {
        // Existing user
        userPayload = { ...userToLogin, isAdmin };
    } else {
        // New user
        const memberSince = new Date().toISOString();
        userPayload = { 
            name, 
            email, 
            location: location || 'Punjab, India', 
            isAdmin,
            memberSince
        };
        newAllUsers.push({ name: userPayload.name, email: userPayload.email, location: userPayload.location, memberSince: userPayload.memberSince });
    }
    
    localStorage.setItem("allUsers", JSON.stringify(newAllUsers));
    setAllUsers(newAllUsers);

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

        // Also update the user in the allUsers list
        const existingUsers: Omit<User, 'isAdmin'>[] = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const userIndex = existingUsers.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            const updatedAllUsers = [...existingUsers];
            updatedAllUsers[userIndex] = {
                ...updatedAllUsers[userIndex],
                name: updatedUser.name,
                location: updatedUser.location || updatedAllUsers[userIndex].location,
            };
            setAllUsers(updatedAllUsers);
            localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));
        }
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
