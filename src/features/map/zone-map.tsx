"use client";
import Link from "next/link";
import { geoJSON } from "leaflet";
import { LocateFixed } from "lucide-react";
import { useUserLocation, queryUserLocation } from "@/lib/use-area";
import {
  Circle,
  GeoJSON,
  CircleMarker,
  MapContainer,
  TileLayer,
  Popup,
  useMap,
} from "react-leaflet";
import { SupportPlaceLayer } from "./support-place-layer";
import { UserLocationMarker } from "./user-location-marker";
import { IncidentHeatLayer } from "./incident-heat-layer";
import { incidentColor } from "@/lib/incident-density";
import { ZoneMapView } from "./zone-map-view";
import type { SupportPlace } from "../support/contracts";
import type { Area, Incident, Category } from "@/lib/contracts";
import "leaflet/dist/leaflet.css";
export type ZoneMapProps = {
  supportPlaces?: SupportPlace[];
  area: Area;
  incidents: Incident[];
  categories: Category[];
  heat?: boolean;
  scrollWheelZoom?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
};
export default function ZoneMap({
  area,
  incidents,
  supportPlaces = [],
  categories,
  heat = false,
  scrollWheelZoom = true,
  selectedId,
  onSelect,
}: ZoneMapProps): React.JSX.Element {
  const point = useUserLocation();
  const bounds = area.geography
    ? geoJSON(area.geography.geometry).getBounds()
    : undefined;
  const personal =
    point &&
    area.scope !== "city" &&
    bounds?.contains([point.latitude, point.longitude]) &&
    Math.abs(point.latitude - area.latitude) < 0.001 &&
    Math.abs(point.longitude - area.longitude) < 0.001;
  return (
    <MapContainer
      className="zone-map"
      center={
        personal
          ? [point.latitude, point.longitude]
          : bounds
            ? undefined
            : [area.latitude, area.longitude]
      }
      zoom={personal ? 15 : bounds ? undefined : 13}
      bounds={personal ? undefined : bounds}
      boundsOptions={{ padding: [28, 80], maxZoom: 15 }}
      fadeAnimation={false}
      scrollWheelZoom={scrollWheelZoom}
      zoomControl={false}
      worldCopyJump
      maxBounds={[
        [-85, -180],
        [85, 180],
      ]}
    >
      <ZoneMapView
        area={area}
        selected={
          incidents.find((i) => i.id === selectedId) ||
          supportPlaces.find((p) => p.id === selectedId)
        }
      />
      <TileLayer
        className="harkai-basemap"
        keepBuffer={2}
        updateWhenIdle
        updateWhenZooming
        maxNativeZoom={19}
        maxZoom={19}
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapControls />
      {area.geography && (
        <GeoJSON
          key={`${area.ubigeo}:${area.scope}`}
          data={area.geography.geometry}
          style={{ color: "#2b9e5a", weight: 2.2, fillOpacity: 0.04 }}
        />
      )}
      {!area.geoPending && !area.geoError && !area.geography && (
        <Circle
          center={[area.latitude, area.longitude]}
          radius={area.radius}
          pathOptions={{ color: "#2b9e5a", weight: 1, fillOpacity: 0.035 }}
        />
      )}
      {!area.geography && (
        <CircleMarker
          center={[area.latitude, area.longitude]}
          radius={5}
          pathOptions={{
            color: "#061325",
            fillColor: "#fff",
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Popup>Centro de tu zona de consulta</Popup>
        </CircleMarker>
      )}
      <UserLocationMarker />
      <div className="map-zone-label" aria-live="polite">
        <i className="map-zone-dot" aria-hidden="true" />
        <strong>
          {area.geography?.name ||
            (area.geoPending ? "Ubicando distrito…" : "Lima")}
        </strong>
        <span>{area.scope === "department" ? "Departamento" : area.scope === "province" ? "Provincia" : area.scope === "city" ? "Área metropolitana" : "Distrito"}</span>
      </div>
      <SupportPlaceLayer places={supportPlaces} />
      {heat && <IncidentHeatLayer incidents={incidents} />}
      {incidents.map((i) => (
        <CircleMarker
          key={i.id}
          center={[i.latitude, i.longitude]}
          radius={selectedId === i.id ? 12 : heat ? 4 : 7}
          eventHandlers={{ click: () => onSelect?.(i.id) }}
          pathOptions={{
            color: heat ? "#ffffff" : i.verified ? "#247751" : "#b06a23",
            fillColor: heat
              ? incidentColor(i.type)
              : i.verified
                ? "#39bc7c"
                : "#f6b44c",
            weight: heat ? 1 : 3,
            fillOpacity: heat ? 0.9 : 0.95,
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
  const point = useUserLocation();
  return (
    <div
      className="map-zoom"
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {point && (
        <button
          aria-label="Centrar en mi ubicación"
          title="Centrar en mi ubicación"
          onClick={() => {
            queryUserLocation(point);
            map.flyTo(
              [point.latitude, point.longitude],
              Math.max(15, map.getZoom()),
              { duration: 0.3 },
            );
          }}
        >
          <LocateFixed size={18} />
        </button>
      )}
      <button aria-label="Acercar mapa" onClick={() => map.zoomIn()}>
        +
      </button>
      <button aria-label="Alejar mapa" onClick={() => map.zoomOut()}>
        −
      </button>
    </div>
  );
}
