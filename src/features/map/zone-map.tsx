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
  useMapEvents,
} from "react-leaflet";
import type { Area, Incident, Category } from "@/lib/contracts";
import "leaflet/dist/leaflet.css";
type Props = {
  area: Area;
  incidents: Incident[];
  categories: Category[];
  heat?: boolean;
  scrollWheelZoom?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  onMove?: (latitude: number, longitude: number) => void;
};
function View({
  area,
  selected,
  onMove,
}: {
  area: Area;
  selected?: Incident;
  onMove?: Props["onMove"];
}): null {
  const map = useMap();
  useMapEvents({
    dragend: () => {
      const p = map.getCenter();
      onMove?.(p.lat, p.lng);
    },
  });
  useEffect(() => {
    map.fitBounds(
      [
        [
          area.latitude - area.radius / 111320,
          area.longitude -
            area.radius /
              (111320 *
                Math.max(0.05, Math.cos((area.latitude * Math.PI) / 180))),
        ],
        [
          area.latitude + area.radius / 111320,
          area.longitude +
            area.radius /
              (111320 *
                Math.max(0.05, Math.cos((area.latitude * Math.PI) / 180))),
        ],
      ],
      { padding: [28, 28], maxZoom: 15, animate: false },
    );
  }, [area.latitude, area.longitude, area.radius, map]);
  useEffect(() => {
    if (selected)
      map.flyTo(
        [selected.latitude, selected.longitude],
        Math.max(14, map.getZoom()),
        { duration: 0.5 },
      );
  }, [selected, map]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
export default function ZoneMap({
  area,
  incidents,
  categories,
  heat = false,
  scrollWheelZoom = false,
  selectedId,
  onSelect,
  onMove,
}: Props): React.JSX.Element {
  return (
    <MapContainer
      className="zone-map"
      center={[area.latitude, area.longitude]}
      zoom={13}
      scrollWheelZoom={scrollWheelZoom}
      zoomControl={false}
    >
      <View
        area={area}
        selected={incidents.find((i) => i.id === selectedId)}
        onMove={onMove}
      />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapControls />
      <Circle
        center={[area.latitude, area.longitude]}
        radius={area.radius}
        pathOptions={{
          color: "#398363",
          weight: 1,
          dashArray: "5 7",
          fillOpacity: 0.035,
        }}
      />
      {incidents.map((i) => (
        <CircleMarker
          key={i.id}
          center={[i.latitude, i.longitude]}
          radius={heat ? 26 : selectedId === i.id ? 12 : 7}
          eventHandlers={{ click: () => onSelect?.(i.id) }}
          pathOptions={{
            color: i.verified ? "#247751" : "#b06a23",
            fillColor: i.verified ? "#39bc7c" : "#f6b44c",
            weight: heat ? 0 : 3,
            fillOpacity: heat ? 0.16 : 0.95,
          }}
        >
          {!onSelect && (
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
          )}
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
function MapControls(): React.JSX.Element {
  const map = useMap();
  return (
    <div
      className="map-zoom"
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <button aria-label="Acercar mapa" onClick={() => map.zoomIn()}>
        +
      </button>
      <button aria-label="Alejar mapa" onClick={() => map.zoomOut()}>
        −
      </button>
    </div>
  );
}
