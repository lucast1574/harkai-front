"use client";
import Link from "next/link";
import {
  Circle,
  GeoJSON,
  CircleMarker,
  MapContainer,
  TileLayer,
  Popup,
  useMap,
} from "react-leaflet";
import { DistrictMask } from "./district-mask";
import { UserLocationMarker } from "./user-location-marker";
import { ZoneMapView } from "./zone-map-view";
import type { SupportPlace } from "../support/contracts";
import type { Area, Incident, Category } from "@/lib/contracts";
import "leaflet/dist/leaflet.css";
type Props = {
  supportPlaces?: SupportPlace[];
  area: Area;
  incidents: Incident[];
  categories: Category[];
  heat?: boolean;
  scrollWheelZoom?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  onMove?: (latitude: number, longitude: number) => void;
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
  onMove,
}: Props): React.JSX.Element {
  return (
    <MapContainer
      className="zone-map"
      center={[area.latitude, area.longitude]}
      zoom={13}
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
        onMove={onMove}
      />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapControls />
      {area.geography && <DistrictMask geography={area.geography} />}
      {area.geography && (
        <GeoJSON
          key={`${area.ubigeo}:${area.scope}`}
          data={area.geography.geometry}
          style={{ color: "#398363", weight: 2, fillOpacity: 0.04 }}
        />
      )}
      {!area.geoPending && !area.geoError && !area.geography && (
        <Circle
          center={[area.latitude, area.longitude]}
          radius={area.radius}
          pathOptions={{ color: "#398363", weight: 1, fillOpacity: 0.035 }}
        />
      )}
      {!area.geography && (
        <CircleMarker
          center={[area.latitude, area.longitude]}
          radius={5}
          pathOptions={{
            color: "#011935",
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
        <strong>
          {area.geography?.name ||
            (area.geoPending
              ? "Identificando distrito…"
              : "Selecciona una zona")}
        </strong>
        <span>
          {area.scope === "city"
            ? "Toda la ciudad · cobertura provincial"
            : "Distrito de consulta"}
        </span>
      </div>
      {supportPlaces.map((place) => (
        <CircleMarker
          key={`support:${place.id}`}
          center={[place.latitude, place.longitude]}
          radius={8}
          pathOptions={{
            color: "#245b9b",
            fillColor: "#73a9e4",
            weight: 3,
            fillOpacity: 0.95,
          }}
        >
          <Popup>
            <strong>{place.name}</strong>
            <p>Centro de salud / ayuda · Directorio institucional</p>
            <p>
              {place.address} · {place.district}
            </p>
            {place.phone && (
              <p>
                <a href={`tel:${place.phone}`}>Contacto: {place.phone}</a>
              </p>
            )}
            <a
              href={place.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar fuente institucional
            </a>
          </Popup>
        </CircleMarker>
      ))}
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
