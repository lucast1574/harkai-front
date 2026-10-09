"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import type { Area, Incident, Page } from "@/lib/contracts";
import { areaQuery } from "@/lib/contracts";
import { useAuth } from "@/lib/auth";
export function useReports(
  area: Area,
  endpoint = "incidents",
): {
  items: Incident[];
  cursor: string;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  more: () => Promise<void>;
} {
  const [items, setItems] = useState<Incident[]>([]);
  const [cursor, setCursor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const version = useRef(0);
  const { user } = useAuth();
  const query = areaQuery(area);
  const load = useCallback(
    async (next = ""): Promise<void> => {
      const current = ++version.current;
      setLoading(true);
      setError("");
      try {
        const page = await api<Page<Incident>>(
          `${endpoint}?${query}${next ? `&cursor=${next}` : ""}`,
        );
        if (current === version.current) {
          setItems((old) =>
            next
              ? [
                  ...new Map(
                    [...old, ...page.items].map((i) => [i.id, i]),
                  ).values(),
                ]
              : page.items,
          );
          setCursor(page.next_cursor || "");
        }
      } catch (e) {
        if (current === version.current) setError((e as Error).message);
      } finally {
        if (current === version.current) setLoading(false);
      }
    },
    [endpoint, query],
  );
  useEffect(() => {
    const requestVersion = version;
    setItems([]);
    setCursor("");
    void load();
    return () => {
      ++requestVersion.current;
    };
  }, [load, user?.id, user?.role]);
  return {
    items,
    cursor,
    loading,
    error,
    reload: () => load(),
    more: () => load(cursor),
  };
}
