
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

export type User = {
  uid: string;
  name: string;
  email: string;
  location: string;
  isAdmin: boolean;
  memberSince: string;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, location: string) => Promise<void>;
  logout: () => void;
  updateLocation: (newLocation: string) => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
  allUsers: Omit<User, 'isAdmin'>[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const mockUsers: User[] = [
  { uid: '1', name: 'Admin User', email: 'admin@example.com', location: 'Delhi, India', isAdmin: true, memberSince: '2023-01-15T10:00:00Z' },
  { uid: '2', name: 'Ramesh Kumar', email: 'ramesh@example.com', location: 'Punjab, India', isAdmin: false, memberSince: '2023-02-20T11:30:00Z' },
  { uid: '3', name: 'Sita Devi', email: 'sita@example.com', location: 'Kerala, India', isAdmin: false, memberSince: '2023-03-10T09:00:00Z' },
];

const ADMIN_EMAIL = 'admin@example.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user
    const loggedInUserEmail = localStorage.getItem('loggedInUser');
    if (loggedInUserEmail) {
      const foundUser = allUsers.find(u => u.email === loggedInUserEmail);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setIsLoading(false);
  }, [allUsers]);

  const login = async (email: string, password: string) => {
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
      // In a real app, you'd verify the password here
      setUser(foundUser);
      localStorage.setItem('loggedInUser', email);
      router.push('/dashboard');
    } else {
      throw new Error("User not found");
    }
  };

  const signup = async (name: string, email: string, password: string, location: string) => {
    if (allUsers.some(u => u.email === email)) {
      throw new Error("Email already in use");
    }
    const newUser: User = {
      uid: (allUsers.length + 1).toString(),
      name,
      email,
      location,
      isAdmin: email === ADMIN_EMAIL,
      memberSince: new Date().toISOString(),
    };
    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem('loggedInUser', email);
    router.push('/dashboard');
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
    router.push("/");
  };
  
  const updateLocation = (newLocation: string) => {
    if (user) {
      const updatedUser = { ...user, location: newLocation };
      setUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.uid === user.uid ? updatedUser : u));
    }
  };

  const updateUser = (data: Partial<Omit<User, 'uid'>>) => {
      if(user) {
          const updatedUser = {...user, ...data };
          setUser(updatedUser);
          setAllUsers(prev => prev.map(u => u.uid === user.uid ? updatedUser : u));
      }
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, updateLocation, updateUser, isLoading, allUsers }}>
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
