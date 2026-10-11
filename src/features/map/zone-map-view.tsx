"use client";
import { useEffect } from "react";
import { geoJSON, latLng } from "leaflet";
import { useMap } from "react-leaflet";
import { useUserLocation } from "@/lib/use-area";
import type { Area } from "@/lib/contracts";
import type { Point } from "@/lib/location";

export function ZoneMapView({
  area,
  selected,
}: {
  area: Area;
  selected?: Point;
}): null {
  const map = useMap();
  const point = useUserLocation();
  const latitude = point?.latitude,
    longitude = point?.longitude;
  useEffect(() => {
    map.stop();
    const bounds = area.geography
      ? geoJSON(area.geography.geometry).getBounds()
      : latLng(area.latitude, area.longitude).toBounds(area.radius * 2);
    map.setMinZoom(2);
    map.setMaxBounds(bounds.pad(1));
    const personal =
      area.scope !== "city" &&
      latitude !== undefined &&
      longitude !== undefined &&
      bounds.contains([latitude, longitude]) &&
      Math.abs(latitude - area.latitude) < 0.001 &&
      Math.abs(longitude - area.longitude) < 0.001;
    if (personal) map.setView([latitude, longitude], 15, { animate: false });
    else
      map.fitBounds(bounds, { padding: [28, 80], maxZoom: 15, animate: false });
    map.setMinZoom(Math.max(2, map.getBoundsZoom(bounds) - 1));
  }, [
    area.latitude,
    area.longitude,
    area.radius,
    area.scope,
    area.geography,
    latitude,
    longitude,
    map,
  ]);
  const selectedLatitude = selected?.latitude,
    selectedLongitude = selected?.longitude;
  useEffect(() => {
    if (selectedLatitude !== undefined && selectedLongitude !== undefined)
      map.flyTo(
        [selectedLatitude, selectedLongitude],
        Math.max(14, map.getZoom()),
        { duration: 0.5 },
      );
  }, [selectedLatitude, selectedLongitude, map]);
  useEffect(() => {
    const observer = new ResizeObserver(() =>
      map.invalidateSize({ pan: false }),
    );
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
