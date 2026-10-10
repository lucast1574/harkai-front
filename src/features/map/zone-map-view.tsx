"use client";
import { useEffect, useRef } from "react";
import { geoJSON, latLng } from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import type { Area } from "@/lib/contracts";
import type { Point } from "@/lib/location";
export function ZoneMapView({
  area,
  selected,
  onMove,
}: {
  area: Area;
  selected?: Point;
  onMove?: (latitude: number, longitude: number) => void;
}): null {
  const map = useMap();
  const userMovement = useRef(false);
  useMapEvents({
    moveend: () => {
      if (!userMovement.current) return;
      userMovement.current = false;
      const p = map.wrapLatLng(map.getCenter());
      onMove?.(Math.max(-85, Math.min(85, p.lat)), p.lng);
    },
  });
  useEffect(() => {
    userMovement.current = false;
    map.stop();
    const bounds = area.geography
      ? geoJSON(area.geography.geometry).getBounds()
      : latLng(area.latitude, area.longitude).toBounds(area.radius * 2);
    map.setMinZoom(2);
    map.setMaxBounds(bounds.pad(area.scope === "city" ? 0.2 : 0.08));
    map.fitBounds(bounds, { padding: [28, 80], maxZoom: 15, animate: false });
    map.setMinZoom(Math.max(2, map.getBoundsZoom(bounds) - 1));
  }, [
    area.latitude,
    area.longitude,
    area.radius,
    area.scope,
    area.geography,
    map,
  ]);
  const selectedLatitude = selected?.latitude,
    selectedLongitude = selected?.longitude;
  useEffect(() => {
    if (selectedLatitude !== undefined && selectedLongitude !== undefined) {
      userMovement.current = false;
      map.flyTo(
        [selectedLatitude, selectedLongitude],
        Math.max(14, map.getZoom()),
        { duration: 0.5 },
      );
    }
  }, [selectedLatitude, selectedLongitude, map]);
  useEffect(() => {
    const node = map.getContainer();
    const interact = (event: Event): void => {
      if (
        event instanceof KeyboardEvent &&
        ![
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "+",
          "-",
          "=",
        ].includes(event.key)
      )
        return;
      userMovement.current = true;
    };
    node.addEventListener("pointerdown", interact);
    node.addEventListener("wheel", interact, { passive: true });
    node.addEventListener("keydown", interact);
    const resize = (): void => {
      map.invalidateSize({ pan: false });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => {
      observer.disconnect();
      node.removeEventListener("pointerdown", interact);
      node.removeEventListener("wheel", interact);
      node.removeEventListener("keydown", interact);
    };
  }, [map]);
  return null;
}
