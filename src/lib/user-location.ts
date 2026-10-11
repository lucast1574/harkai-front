"use client";
import { useSyncExternalStore } from "react";
import { locate, type LocatedPoint } from "./location";
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
    let point = await locate(undefined, { timeoutMs: 7000 });
    publish({ point, busy: point.accuracy > 2000, error: "" });
    if (point.accuracy > 2000) {
      try {
        const refined = await locate(undefined, {
          timeoutMs: 4000,
          highAccuracy: true,
        });
        if (refined.accuracy < point.accuracy) point = refined;
      } catch {
        /* Keep the first estimate and expose manual correction. */
      }
    }
    if (point.accuracy > 2000) {
      publish({
        point,
        busy: false,
        error:
          "La ubicación es demasiado aproximada para identificar tu distrito. Ajusta el punto en el mapa.",
      });
      return;
    }
    publish({ point, busy: false, error: "" });
    onFound(point);
  } catch (error) {
    publish({
      ...state,
      busy: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo detectar tu ubicación.",
    });
  }
}
