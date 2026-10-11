"use client";
import { Circle, Marker, Popup, Tooltip } from "react-leaflet";
import { userIcon } from "./map-icons";
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
      <Marker
        position={[point.latitude, point.longitude]}
        icon={userIcon}
        alt="Tu ubicación"
        title="Tu ubicación"
        zIndexOffset={5000}
      >
        <Tooltip
          permanent
          direction="top"
          offset={[0, -14]}
          className="user-location-label"
        >
          Tu ubicación
        </Tooltip>
        <Popup>
          <strong>Tu ubicación</strong>
          <p>
            Precisión aproximada: {Math.round(point.accuracy)} m. Detectada al
            entrar al panel.
          </p>
        </Popup>
      </Marker>
    </>
  );
}
