"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LIMA, type Area } from "./contracts";
import { useDistrict } from "./use-district";
import { validPoint, type Point } from "./location";
import { startAutoLocation } from "./user-location";
export { rememberUserLocation, useUserLocation } from "./user-location";

let manualRevision = 0;
const KEY = "harkai:query-zone:v3";
const EVENT = "harkai:query-zone";
type QueryPoint = Point & {
  ubigeo?: string;
  scope?: "district" | "city" | "province" | "department";
  auto?: boolean;
  manual?: boolean;
};
const initial: QueryPoint = {
  latitude: LIMA.latitude,
  longitude: LIMA.longitude,
  scope: "district",
  auto: true,
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
          scope: ["city", "province", "department"].includes(point.scope)
            ? point.scope
            : "district",
          manual: true,
          auto: false,
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

function save(point: QueryPoint, persist = false): void {
  if (!validPoint(point)) return;
  if (
    current.latitude === point.latitude &&
    current.longitude === point.longitude &&
    current.ubigeo === point.ubigeo &&
    current.scope === point.scope &&
    current.auto === point.auto &&
    current.manual === point.manual
  )
    return;
  current = {
    latitude: point.latitude,
    longitude: point.longitude,
    ubigeo: point.ubigeo,
    scope: point.scope || "district",
    auto: Boolean(point.auto),
    manual: Boolean(point.manual),
  };
  try {
    if (persist) {
      sessionStorage.setItem(KEY, JSON.stringify(current));
    } else {
      sessionStorage.removeItem(KEY);
    }
  } catch {
    /* Private mode may block persistence. */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useArea(defaults: Area = LIMA): [Area, (next: Area) => void] {
  const point = useSyncExternalStore(subscribe, snapshot, () => initial);
  useEffect(() => {
    if (snapshot().manual) return;
    const revision = manualRevision;
    void startAutoLocation((next) => {
      if (manualRevision === revision)
        save(
          {
            latitude: next.latitude,
            longitude: next.longitude,
            ubigeo: undefined,
            scope: snapshot().scope || "district",
            auto: false,
          },
          false,
        );
    });
  }, []);
  const [filters, setFilters] = useState(defaults);
  const region = useDistrict(point, point.ubigeo, point.scope || "district");
  const resolvedPoint =
    (point.ubigeo || point.auto) && region.center && validPoint(region.center)
      ? region.center
      : point;
  const area: Area = {
    ...filters,
    ...point,
    latitude: resolvedPoint.latitude,
    longitude: resolvedPoint.longitude,
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
      const ubigeoChanged = Boolean(next.ubigeo) && next.ubigeo !== area.ubigeo;
      const moved =
        next.latitude !== area.latitude || next.longitude !== area.longitude;
      const territoryChanged =
        moved || ubigeoChanged || next.scope !== area.scope;
      if (territoryChanged) manualRevision++;
      save(
        {
          latitude: next.latitude,
          longitude: next.longitude,
          ubigeo: ubigeoChanged ? next.ubigeo : moved ? undefined : next.ubigeo,
          scope: next.scope || "district",
          manual: snapshot().manual || territoryChanged,
          auto: false,
        },
        true,
      );
    },
  ];
}

export function useQueryPoint(): Point {
  return useSyncExternalStore(subscribe, snapshot, () => initial);
}

export function queryUserLocation(point: Point): void {
  manualRevision++;
  save(
    {
      latitude: point.latitude,
      longitude: point.longitude,
      ubigeo: undefined,
      scope: "district",
      auto: false,
    },
    false,
  );
}
