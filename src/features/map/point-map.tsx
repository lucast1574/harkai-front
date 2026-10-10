"use client";
import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Point } from "@/lib/location";
import "leaflet/dist/leaflet.css";
function PointEvents({
  point,
  onChange,
}: {
  point: Point;
  onChange: (point: Point) => void;
}): null {
  const map = useMap();
  useMapEvents({
    click: (event) => {
      const p = map.wrapLatLng(event.latlng);
      map.panTo([Math.max(-85, Math.min(85, p.lat)), p.lng]);
    },
    moveend: () => {
      const p = map.wrapLatLng(map.getCenter());
      const next = {
        latitude: Math.max(-85, Math.min(85, p.lat)),
        longitude: p.lng,
      };
      if (
        Math.abs(next.latitude - point.latitude) > 0.000001 ||
        Math.abs(next.longitude - point.longitude) > 0.000001
      )
        onChange(next);
    },
  });
  useEffect(() => {
    const center = map.wrapLatLng(map.getCenter());
    if (
      Math.abs(center.lat - point.latitude) > 0.000001 ||
      Math.abs(center.lng - point.longitude) > 0.000001
    )
      map.setView([point.latitude, point.longitude], map.getZoom(), {
        animate: false,
      });
  }, [point.latitude, point.longitude, map]);
  useEffect(() => {
    const update = (): void => {
      map.invalidateSize({ pan: false });
    };
    const frame = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(map.getContainer());
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map]);
  return null;
}
export default function PointMap({
  point,
  onChange,
  accuracy,
}: {
  point: Point;
  onChange: (point: Point) => void;
  accuracy?: number;
}): React.JSX.Element {
  return (
    <div className="point-map-frame">
      <MapContainer
        className="point-map"
        center={[point.latitude, point.longitude]}
        zoom={accuracy && accuracy > 10000 ? 10 : 13}
        scrollWheelZoom
        worldCopyJump
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <PointEvents point={point} onChange={onChange} />
        {accuracy !== undefined && (
          <Circle
            center={[point.latitude, point.longitude]}
            radius={accuracy}
            pathOptions={{ color: "#398363", fillOpacity: 0.08, weight: 1 }}
          />
        )}
      </MapContainer>
      <div className="point-pin" aria-hidden="true">
        <span />
      </div>
      <span className="point-map-hint">
        Mueve el mapa para ajustar el punto
      </span>
    </div>
  );
}
