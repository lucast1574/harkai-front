"use client";
import { Circle, Marker, Popup, Tooltip } from "react-leaflet";
import { userIcon } from "./map-icons";
import { useUserLocation } from "@/lib/use-area";
export function UserLocationMarker({
  compact = false,
}: {
  compact?: boolean;
}): React.JSX.Element | null {
  const point = useUserLocation();
  if (!point) return null;
  return (
    <>
      <Circle
        center={[point.latitude, point.longitude]}
        radius={compact ? Math.min(point.accuracy, 60) : point.accuracy}
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
          permanent={!compact}
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
