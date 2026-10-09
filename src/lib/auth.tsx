"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, session, ApiError } from "./api";
import type { User } from "./contracts";
type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  login: (input: {
    mode: string;
    email?: string;
    password?: string;
    name?: string;
    id_token?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async (): Promise<void> => {
    try {
      setUser(await api<User>("me"));
      setError("");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setUser(null);
        setError("");
      } else
        setError(
          e instanceof Error ? e.message : "No se pudo consultar la sesión.",
        );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
    const focus = () => {
      void reload();
    };
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, [reload]);
  useEffect(() => {
    const theme = user?.preferences.theme || "system";
    document.documentElement.dataset.theme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    return;
  }, [user?.preferences.theme]);
  const login: Auth["login"] = async (input) => {
    const next = await session("POST", input);
    setUser(next);
    setError("");
    return next;
  };
  const logout = async (): Promise<void> => {
    await session("DELETE");
    setUser(null);
    return;
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, error, reload, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth(): Auth {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider missing");
  return context;
}
