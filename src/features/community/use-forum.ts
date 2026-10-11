"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Page } from "@/lib/contracts";
import type { ForumThread } from "./forum-contracts";

export function useForum(path: string | null) {
  const [items, setItems] = useState<ForumThread[]>([]);
  const [cursor, setCursor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const load = useCallback(
    async (next = ""): Promise<void> => {
      const version = ++generation.current;
      if (!path) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const page = await api<Page<ForumThread>>(
          `${path}${next ? `&cursor=${next}` : ""}`,
        );
        if (version !== generation.current) return;
        setItems((previous) =>
          next
            ? [
                ...new Map(
                  [...previous, ...page.items].map((item) => [item.id, item]),
                ).values(),
              ]
            : page.items,
        );
        setCursor(page.next_cursor || "");
      } catch (failure) {
        if (version === generation.current)
          setError((failure as Error).message);
      } finally {
        if (version === generation.current) setLoading(false);
      }
    },
    [path],
  );
  useEffect(() => {
    void load();
    const current = generation;
    return () => {
      ++current.current;
    };
  }, [load]);
  return { items, cursor, loading, error, reload: load };
}
