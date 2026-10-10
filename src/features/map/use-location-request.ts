"use client";
import { useEffect, useRef, useState } from "react";
import { locate, type LocatedPoint } from "@/lib/location";
export function useLocationRequest(onFound: (point: LocatedPoint) => void): {
  busy: boolean;
  error: string;
  find: () => Promise<void>;
  cancel: () => void;
  clearError: () => void;
} {
  const controller = useRef<AbortController | null>(null);
  const latest = useRef(onFound);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    latest.current = onFound;
  }, [onFound]);
  useEffect(() => () => controller.current?.abort(), []);
  function cancel(): void {
    controller.current?.abort();
    controller.current = null;
    setBusy(false);
  }
  async function find(): Promise<void> {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setError("");
    try {
      const point = await locate(undefined, { signal: request.signal });
      if (!request.signal.aborted) latest.current(point);
    } catch (e) {
      if (!request.signal.aborted)
        setError(
          e instanceof Error ? e.message : "No se pudo obtener la ubicación.",
        );
    } finally {
      if (controller.current === request) {
        controller.current = null;
        setBusy(false);
      }
    }
  }
  return { busy, error, find, cancel, clearError: () => setError("") };
}
