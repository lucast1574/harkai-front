"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth";
export function useResource<T>(path: string | null): {
  data: T | null;
  error: string;
  loading: boolean;
  reload: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!path);
  const generation = useRef(0);
  const { user } = useAuth();
  const reload = useCallback(async (): Promise<void> => {
    const version = ++generation.current;
    setError("");
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const value = await api<T>(path);
      if (version === generation.current) setData(value);
    } catch (e) {
      if (version === generation.current) setError((e as Error).message);
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    const requestGeneration = generation;
    setData(null);
    void reload();
    return () => {
      ++requestGeneration.current;
    };
  }, [reload, user?.id, user?.role]);
  return { data, error, loading, reload };
}
