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

async function locateByNetwork(signal?: AbortSignal): Promise<LocatedPoint> {
  try {
    const res = await fetch("https://freeipapi.com/api/json", {
      cache: "no-store",
      signal: signal ?? AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        latitude?: number;
        longitude?: number;
      };
      if (
        typeof data.latitude === "number" &&
        typeof data.longitude === "number" &&
        (data.latitude !== 0 || data.longitude !== 0) &&
        validPoint({ latitude: data.latitude, longitude: data.longitude })
      ) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 800,
        };
      }
    }
  } catch {
    /* Try backend auto-district resolution next. */
  }
  if (signal?.aborted)
    throw new DOMException("Búsqueda cancelada", "AbortError");
  try {
    const fallback = await api<{
      center?: { latitude: number; longitude: number };
    }>("geo/district?auto=1", { signal });
    if (fallback.center && validPoint(fallback.center)) {
      return {
        latitude: fallback.center.latitude,
        longitude: fallback.center.longitude,
        accuracy: 1000,
      };
    }
  } catch {
    /* Try secondary IP provider. */
  }
  if (signal?.aborted)
    throw new DOMException("Búsqueda cancelada", "AbortError");
  const res = await fetch("https://ipwho.is/", {
    cache: "no-store",
    signal: signal ?? AbortSignal.timeout(3000),
  });
  if (res.ok) {
    const data = (await res.json()) as {
      success?: boolean;
      latitude?: number;
      longitude?: number;
    };
    if (
      data.success !== false &&
      typeof data.latitude === "number" &&
      typeof data.longitude === "number" &&
      validPoint({ latitude: data.latitude, longitude: data.longitude })
    ) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: 1500,
      };
    }
  }
  throw new Error("No se pudo obtener la ubicación.");
}

export async function locateWithFallback(options?: {
  signal?: AbortSignal;
}): Promise<LocatedPoint> {
  const signal = options?.signal;
  try {
    const point = await locate(undefined, {
      signal,
      timeoutMs: 1800,
      highAccuracy: true,
    });
    if (point.accuracy <= 2500) return point;
    try {
      return await locateByNetwork(signal);
    } catch {
      return point;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return await locateByNetwork(signal);
  }
}

export async function startAutoLocation(
  onFound: (point: LocatedPoint) => void,
): Promise<void> {
  if (started) return;
  started = true;
  publish({ ...state, busy: true, error: "" });
  let resolved = false;
  try {
    const networkPoint = await locateByNetwork();
    resolved = true;
    publish({ point: networkPoint, busy: false, error: "" });
    onFound(networkPoint);
  } catch {
    /* Continue with device geolocation if network lookup failed. */
  }
  try {
    const gpsPoint = await locate(undefined, {
      timeoutMs: 3500,
      highAccuracy: true,
    });
    if (gpsPoint.accuracy <= 1500 || !resolved) {
      publish({ point: gpsPoint, busy: false, error: "" });
      onFound(gpsPoint);
    }
  } catch {
    if (!resolved) {
      publish({ ...state, busy: false, error: "" });
    }
  }
}
