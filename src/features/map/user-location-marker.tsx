"use client";
import { Circle, CircleMarker, Popup } from "react-leaflet";
import { useUserLocation } from "@/lib/use-area";
export function UserLocationMarker(): React.JSX.Element | null {
  const point = useUserLocation();
  if (!point) return null;
  return (
    <>
      <Circle
        center={[point.latitude, point.longitude]}
        radius={point.accuracy}
        interactive={false}
        pathOptions={{
          color: "#287ee6",
          fillColor: "#287ee6",
          fillOpacity: 0.07,
          weight: 1,
        }}
      />
      <CircleMarker
        center={[point.latitude, point.longitude]}
        radius={9}
        pathOptions={{
          color: "#fff",
          fillColor: "#287ee6",
          fillOpacity: 1,
          weight: 3,
        }}
      >
        <Popup>
          <strong>Tu ubicación</strong>
          <p>
            Precisión aproximada: {Math.round(point.accuracy)} m. Solo se
            actualiza cuando lo solicitas.
          </p>
        </Popup>
      </CircleMarker>
    </>
  );
}
