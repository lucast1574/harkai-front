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
  const pending = useRef(false);
  const load = useCallback(
    async (next = "", silent = false): Promise<void> => {
      if (silent && pending.current) return;
      const version = ++generation.current;
      if (!path) {
        setItems([]);
        setLoading(false);
        return;
      }
      pending.current = true;
      if (!silent) setLoading(true);
      setError("");
      try {
        const page = await api<Page<ForumThread>>(
          `${path}${next ? `&cursor=${next}` : ""}`,
        );
        if (version !== generation.current) return;
        setItems((previous) =>
          next || silent
            ? [
                ...new Map(
                  [
                    ...(silent
                      ? previous.filter(
                          (item) =>
                            page.next_cursor &&
                            item.created_at <
                              (page.items.at(-1)?.created_at || ""),
                        )
                      : previous),
                    ...page.items,
                  ].map((item) => [item.id, item]),
                ).values(),
              ]
            : page.items,
        );
        if (!silent) setCursor(page.next_cursor || "");
      } catch (failure) {
        if (version === generation.current)
          setError((failure as Error).message);
      } finally {
        if (version === generation.current) {
          setLoading(false);
          pending.current = false;
        }
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
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load("", true);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [load]);
  return { items, cursor, loading, error, reload: load };
}
