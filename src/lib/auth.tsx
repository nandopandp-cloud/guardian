"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface AuthUser {
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** True until we've read the persisted session (avoids a login flash). */
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const STORAGE_KEY = "guardian.session";
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mock auth. Any well-formed email + non-empty password is accepted and the
 * session is persisted to localStorage. When the Neon backend is ready, only
 * `signIn` needs to change — swap the resolve below for a fetch to the API.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) throw new Error("Informe um email válido.");
    if (!password.trim()) throw new Error("Informe sua senha.");

    // Simulate network latency so the loading state is real.
    await new Promise((r) => setTimeout(r, 650));

    const name = trimmed
      .split("@")[0]
      .split(/[.\-_]/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

    const next: AuthUser = { email: trimmed, name: name || "Analista" };
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, signOut }),
    [user, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
