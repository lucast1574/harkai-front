"use client";
import { useMemo } from "react";
import { Polygon } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { GeographicDistrict } from "@/lib/contracts";
export function DistrictMask({
  geography,
}: {
  geography: GeographicDistrict;
}): React.JSX.Element {
  const rings = useMemo(() => {
    const polygons =
      geography.geometry.type === "Polygon"
        ? [geography.geometry.coordinates]
        : geography.geometry.coordinates;
    const world: LatLngExpression[] = [
      [85, -180],
      [85, 180],
      [-85, 180],
      [-85, -180],
    ];
    return [
      world,
      ...polygons.flatMap((p) =>
        p.map((r) => r.map(([lng, lat]) => [lat, lng] as LatLngExpression)),
      ),
    ];
  }, [geography]);
  return (
    <Polygon
      positions={rings}
      interactive={false}
      pathOptions={{
        stroke: false,
        fillColor: "#e6eceb",
        fillOpacity: 0.68,
        fillRule: "evenodd",
      }}
    />
  );
}
