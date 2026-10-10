"use client";
import { useEffect, useState } from "react";
import { api } from "./api";
import type { GeographicDistrict } from "./contracts";
import type { Point } from "./location";
type Region = {
  district: GeographicDistrict;
  area: GeographicDistrict;
  districts: { id: string; name: string }[];
};
const cache = new Map<string, Region>();
export function useDistrict(
  point: Point,
  ubigeo?: string,
  scope: "district" | "city" = "district",
): {
  district?: GeographicDistrict;
  area?: GeographicDistrict;
  districts: { id: string; name: string }[];
  loading: boolean;
  error: string;
  retry: () => void;
} {
  const path =
    (ubigeo
      ? `geo/district?ubigeo=${encodeURIComponent(ubigeo)}`
      : `geo/district?lat=${point.latitude}&lng=${point.longitude}`) +
    `&scope=${scope}`;
  const [result, setResult] = useState<{
    path: string;
    district?: GeographicDistrict;
    area?: GeographicDistrict;
    districts: { id: string; name: string }[];
    error: string;
  }>({ path: "", districts: [], error: "" });
  const [attempt, setAttempt] = useState(0);
  const retry = (): void => {
    setResult({ path: "", districts: [], error: "" });
    setAttempt((n) => n + 1);
  };
  useEffect(() => {
    const controller = new AbortController();
    void (
      cache.has(path)
        ? Promise.resolve(cache.get(path)!)
        : api<Region>(path, { signal: controller.signal })
    )
      .then((data) => {
        cache.set(path, data);
        if (cache.size > 64) cache.delete(cache.keys().next().value!);
        if (!controller.signal.aborted) setResult({ path, ...data, error: "" });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            path,
            districts: [],
            error:
              "No pudimos identificar el distrito en la cartografía de referencia. Elige otra zona o vuelve a intentarlo.",
          });
      });
    return () => controller.abort();
  }, [path, attempt]);
  if (result.path !== path)
    return { districts: [], loading: true, error: "", retry };
  return { ...result, loading: false, retry };
}
