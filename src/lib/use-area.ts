"use client";
import { useState, useSyncExternalStore } from "react";
import { LIMA, type Area } from "./contracts";
import { useDistrict } from "./use-district";
import { validPoint, type LocatedPoint, type Point } from "./location";
const KEY = "harkai:query-zone:v1";
const EVENT = "harkai:query-zone";
type QueryPoint = Point & { ubigeo?: string; scope?: "district" | "city" };
const initial: QueryPoint = {
  latitude: LIMA.latitude,
  longitude: LIMA.longitude,
  scope: "district",
};
let current = initial;
let restored = false;
function snapshot(): QueryPoint {
  if (typeof window === "undefined") return initial;
  if (!restored) {
    restored = true;
    try {
      const raw = sessionStorage.getItem(KEY);
      const point = raw ? JSON.parse(raw) : null;
      if (point && validPoint(point))
        current = {
          latitude: point.latitude,
          longitude: point.longitude,
          ubigeo: /^\d{6}$/.test(point.ubigeo || "") ? point.ubigeo : undefined,
          scope: point.scope === "city" ? "city" : "district",
        };
    } catch {
      /* Storage can be unavailable; in-memory selection remains usable. */
    }
  }
  return current;
}
function subscribe(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
function save(point: QueryPoint): void {
  if (!validPoint(point)) return;
  if (
    current.latitude === point.latitude &&
    current.longitude === point.longitude &&
    current.ubigeo === point.ubigeo &&
    current.scope === point.scope
  )
    return;
  current = {
    latitude: point.latitude,
    longitude: point.longitude,
    ubigeo: point.ubigeo,
    scope: point.scope || "district",
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* Private mode may block persistence. */
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useArea(defaults: Area = LIMA): [Area, (next: Area) => void] {
  const point = useSyncExternalStore(subscribe, snapshot, () => initial);
  const [filters, setFilters] = useState(defaults);
  const region = useDistrict(point, point.ubigeo, point.scope || "district");
  const area = {
    ...filters,
    ...point,
    ubigeo: region.district?.id,
    geography: region.area,
    districts: region.districts,
    geoPending: region.loading,
    geoError: region.error,
    geoRetry: region.retry,
  };
  return [
    area,
    (next) => {
      if (!validPoint(next)) return;
      setFilters(next);
      const moved =
        next.latitude !== point.latitude || next.longitude !== point.longitude;
      save({ ...next, ubigeo: moved ? undefined : next.ubigeo });
    },
  ];
}
export function useQueryPoint(): Point {
  return useSyncExternalStore(subscribe, snapshot, () => initial);
}

let userLocation: LocatedPoint | null = null;
const USER_EVENT = "harkai:user-location";
export function rememberUserLocation(point: LocatedPoint): void {
  userLocation = point;
  window.dispatchEvent(new Event(USER_EVENT));
}
export function useUserLocation(): LocatedPoint | null {
  return useSyncExternalStore(
    (listener) => {
      window.addEventListener(USER_EVENT, listener);
      return () => window.removeEventListener(USER_EVENT, listener);
    },
    () => userLocation,
    () => null,
  );
}
