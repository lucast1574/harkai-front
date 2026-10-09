"use client";
import { useEffect } from "react";
import Link from "next/link";
import {
  Circle,
  CircleMarker,
  MapContainer,
  TileLayer,
  Popup,
  useMap,
} from "react-leaflet";
import type { Area, Incident, Category } from "@/lib/contracts";
import "leaflet/dist/leaflet.css";
function View({ area }: { area: Area }): null {
  const map = useMap();
  useEffect(() => {
    map.setView([area.latitude, area.longitude], area.radius > 20000 ? 10 : 13);
  }, [area, map]);
  return null;
}
export default function ZoneMap({
  area,
  incidents,
  categories,
  heat = false,
}: {
  area: Area;
  incidents: Incident[];
  categories: Category[];
  heat?: boolean;
}): React.JSX.Element {
  return (
    <MapContainer
      className="zone-map"
      center={[area.latitude, area.longitude]}
      zoom={13}
      scrollWheelZoom={false}
    >
      <View area={area} />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Circle
        center={[area.latitude, area.longitude]}
        radius={area.radius}
        pathOptions={{ color: "#57d463", weight: 1, fillOpacity: 0.025 }}
      />
      {incidents.map((i) => (
        <CircleMarker
          key={i.id}
          center={[i.latitude, i.longitude]}
          radius={heat ? 26 : 8}
          pathOptions={{
            color: i.verified ? "#57d463" : "#f4bb57",
            weight: heat ? 0 : 2,
            fillOpacity: heat ? 0.16 : 0.65,
          }}
        >
          <Popup>
            <strong>
              {categories.find((c) => c.id === i.type)?.label || i.type}
            </strong>
            <p>
              {i.verified ? "Confirmado por la comunidad" : "No verificado"}
            </p>
            <p>{i.description.slice(0, 160)}</p>
            <Link href={`/incidents/${i.id}`}>Ver reporte completo</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
