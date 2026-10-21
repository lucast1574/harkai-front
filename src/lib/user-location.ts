"use client";
import { useSyncExternalStore } from "react";
import { api } from "./api";
import { locate, validPoint, type LocatedPoint } from "./location";
type State = { point: LocatedPoint | null; busy: boolean; error: string };
const initial: State = { point: null, busy: false, error: "" };
let state = initial;
let started = false;
const listeners = new Set<() => void>();
function publish(next: State): void {
  state = next;
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useLocationState(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}
export function useUserLocation(): LocatedPoint | null {
  return useLocationState().point;
}
export function rememberUserLocation(point: LocatedPoint): void {
  publish({ point, busy: false, error: "" });
}
export async function startAutoLocation(
  onFound: (point: LocatedPoint) => void,
): Promise<void> {
  if (started) return;
  started = true;
  publish({ ...state, busy: true, error: "" });
  try {
    let point = await locate(undefined, { timeoutMs: 6000 });
    publish({ point, busy: false, error: "" });
    onFound(point);
    if (point.accuracy > 1500) {
      try {
        const refined = await locate(undefined, {
          timeoutMs: 4000,
          highAccuracy: true,
        });
        if (refined.accuracy < point.accuracy) {
          point = refined;
          publish({ point, busy: false, error: "" });
          onFound(point);
        }
      } catch {
        /* Keep initial browser location without nagging the user. */
      }
    }
  } catch {
    try {
      const fallback = await api<{
        center?: { latitude: number; longitude: number };
      }>("geo/district?auto=1");
      if (fallback.center && validPoint(fallback.center)) {
        onFound({
          latitude: fallback.center.latitude,
          longitude: fallback.center.longitude,
          accuracy: 3000,
        });
      }
    } catch {
      /* Default city remains active silently. */
    }
    publish({ ...state, busy: false, error: "" });
  }
}
