"use client";
import { useEffect } from "react";
import {
  CircleMarker,
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
      const selected = map.wrapLatLng(event.latlng);
      onChange({
        latitude: Math.max(-85, Math.min(85, selected.lat)),
        longitude: selected.lng,
      });
    },
  });
  useEffect(() => {
    if (!map.getBounds().contains([point.latitude, point.longitude]))
      map.panTo([point.latitude, point.longitude]);
  }, [point.latitude, point.longitude, map]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
function SelectCenter({
  onChange,
}: {
  onChange: (point: Point) => void;
}): React.JSX.Element {
  const map = useMap();
  return (
    <button
      className="button secondary point-center"
      type="button"
      onClick={() => {
        const center = map.wrapLatLng(map.getCenter());
        onChange({
          latitude: Math.max(-85, Math.min(85, center.lat)),
          longitude: center.lng,
        });
      }}
    >
      Elegir centro del mapa
    </button>
  );
}
export default function PointMap({
  point,
  onChange,
}: {
  point: Point;
  onChange: (point: Point) => void;
}): React.JSX.Element {
  return (
    <MapContainer
      className="point-map"
      center={[point.latitude, point.longitude]}
      zoom={13}
      scrollWheelZoom
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <PointEvents point={point} onChange={onChange} />
      <SelectCenter onChange={onChange} />
      <CircleMarker
        center={[point.latitude, point.longitude]}
        radius={10}
        pathOptions={{
          color: "#fff",
          fillColor: "#247751",
          fillOpacity: 1,
          weight: 3,
        }}
      />
    </MapContainer>
  );
}
