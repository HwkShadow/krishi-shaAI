'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, addUserToFirestore, getUserFromFirestore, getAllUsersFromFirestore } from "@/lib/firebase";

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

const ADMIN_EMAIL = 'admin@example.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<Omit<User, 'isAdmin'>[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await getUserFromFirestore(firebaseUser.uid);
        if (userData) {
          setUser({ ...userData, isAdmin: userData.email === ADMIN_EMAIL } as User);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    const unsubscribeUsers = getAllUsersFromFirestore((users) => {
        setAllUsers(users as Omit<User, 'isAdmin'>[]);
    });

    return () => {
      unsubscribe();
      unsubscribeUsers();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    router.push('/dashboard');
  };

  const signup = async (name: string, email: string, password: string, location: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    const memberSince = new Date().toISOString();
    
    const newUser = {
      name,
      email,
      location,
      memberSince,
    };

    await addUserToFirestore(uid, newUser);
    setUser({ ...newUser, uid, isAdmin: email === ADMIN_EMAIL });
    router.push('/dashboard');
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };
  
  const updateLocation = (newLocation: string) => {
    if (user) {
      const updatedUser = { ...user, location: newLocation };
      setUser(updatedUser);
      addUserToFirestore(user.uid, { location: newLocation }); // This will merge
    }
  };
  
  const updateUser = (data: Partial<User>) => {
    if(user) {
        const updatedUser = {...user, ...data};
        setUser(updatedUser);
        addUserToFirestore(user.uid, data);
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
