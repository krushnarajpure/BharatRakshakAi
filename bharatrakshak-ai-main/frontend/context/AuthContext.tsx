"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import { loginWithEmail, logout as authLogout, registerWithEmail } from "@/lib/auth";
import { setAuthSessionCookie, clearAuthSessionCookie } from "@/lib/session";
import type { RegisterUserData, UserProfile, UserRole } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: RegisterUserData) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (firebaseUser: User) => {
    const userProfile = await getUserProfile(firebaseUser.uid);
    setProfile(userProfile);
    return userProfile;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setAuthSessionCookie();
        try {
          await loadProfile(firebaseUser);
        } catch {
          setProfile(null);
        }
      } else {
        clearAuthSessionCookie();
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { profile: userProfile } = await loginWithEmail(email, password);
    setProfile(userProfile);
    return userProfile;
  }, []);

  const register = useCallback(async (data: RegisterUserData) => {
    const { profile: userProfile } = await registerWithEmail(data);
    setProfile(userProfile);
    return userProfile;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    clearAuthSessionCookie();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}

export type { UserRole };
