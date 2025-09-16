
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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
  forgotPassword: (email: string) => void;
  updateLocation: (newLocation: string) => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
  allUsers: User[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const initialUsers: User[] = [
  { uid: '1', name: 'Admin User', email: 'admin@example.com', location: 'Delhi, India', isAdmin: true, memberSince: '2023-01-15T10:00:00Z' },
  { uid: '2', name: 'Ramesh Kumar', email: 'ramesh@example.com', location: 'Punjab, India', isAdmin: false, memberSince: '2023-02-20T11:30:00Z' },
  { uid: '3', name: 'Sita Devi', email: 'sita@example.com', location: 'Kerala, India', isAdmin: false, memberSince: '2023-03-10T09:00:00Z' },
];

const ADMIN_EMAIL = 'admin@example.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading users from a persistent storage
    const storedUsers = localStorage.getItem('appUsers');
    const users = storedUsers ? JSON.parse(storedUsers) : initialUsers;
    setAllUsers(users);

    const loggedInUserEmail = localStorage.getItem('loggedInUser');
    if (loggedInUserEmail) {
      const foundUser = users.find((u: User) => u.email === loggedInUserEmail);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setIsLoading(false);
  }, []);

  const persistUsers = (users: User[]) => {
      setAllUsers(users);
      localStorage.setItem('appUsers', JSON.stringify(users));
  }

  const login = async (email: string, password: string) => {
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
      // In a real app, you'd verify the password here
      setUser(foundUser);
      localStorage.setItem('loggedInUser', email);
      router.push('/dashboard');
    } else {
      throw new Error("User not found. Please sign up.");
    }
  };

  const signup = async (name: string, email: string, password: string, location: string) => {
    if (allUsers.some(u => u.email === email)) {
      throw new Error("Email already in use. Please log in.");
    }
    const newUser: User = {
      uid: (allUsers.length + 1).toString(),
      name,
      email,
      location,
      isAdmin: email === ADMIN_EMAIL,
      memberSince: new Date().toISOString(),
    };
    persistUsers([...allUsers, newUser]);
    setUser(newUser);
    localStorage.setItem('loggedInUser', email);
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
    router.push("/");
  };
  
  const forgotPassword = (email: string) => {
    // In a real app, this would trigger a Firebase password reset email
    console.log(`Password reset requested for ${email}`);
    toast({
        title: "Password Reset",
        description: `If an account exists for ${email}, a password reset link has been sent.`,
    });
  }

  const updateLocation = (newLocation: string) => {
    if (user) {
      const updatedUser = { ...user, location: newLocation };
      setUser(updatedUser);
      const updatedUsers = allUsers.map(u => u.uid === user.uid ? updatedUser : u);
      persistUsers(updatedUsers);
    }
  };

  const updateUser = (data: Partial<User>) => {
      if(user) {
          const updatedUser = {...user, ...data };
          setUser(updatedUser);
          const updatedUsers = allUsers.map(u => u.uid === user.uid ? updatedUser : u);
          persistUsers(updatedUsers);
      }
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, forgotPassword, updateLocation, updateUser, isLoading, allUsers }}>
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
