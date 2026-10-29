"use client";
import { useState } from "react";
import { MapPin, Phone, ExternalLink } from "lucide-react";
import { Notice } from "@/components/ui";
import { useResource } from "@/lib/use-resource";
import { areaQuery, type Area } from "@/lib/contracts";
import ZoneMap from "../map/map-loader";
import { placeKind } from "./place-kind";
import type { SupportPlace } from "./contracts";
export function OfficialPlaces({ area }: { area: Area }): React.JSX.Element {
  const { data, error, loading, reload } = useResource<{
    items: SupportPlace[];
  }>(
    area.geoPending || area.geoError
      ? null
      : `support/places?${areaQuery(area)}`,
  );
  const [selected, setSelected] = useState("");
  return (
    <section aria-label="Directorio de salud, policía y bomberos en el mapa">
      <header className="support-results-heading">
        <div>
          <span className="eyebrow">DIRECTORIO INSTITUCIONAL</span>
          <h2>Salud, policía y bomberos cerca de esta zona</h2>
          <p className="muted small">
            Estos lugares son recursos permanentes; no son alertas ni
            confirmaciones comunitarias.
          </p>
        </div>
      </header>
      {error && (
        <Notice error>
          {error}{" "}
          <button className="text-button" onClick={() => void reload()}>
            Reintentar
          </button>
        </Notice>
      )}
      {loading && <Notice>Cargando establecimientos…</Notice>}
      <div className="map-panel">
        <ZoneMap
          scrollWheelZoom
          area={area}
          incidents={[]}
          categories={[]}
          supportPlaces={data?.items || []}
          selectedId={selected}
        />
        <p className="map-note">
          Ubicación de referencia. Consulta dirección, disponibilidad y
          condiciones de atención antes de acudir. Las centrales de los
          establecimientos no sustituyen al SAMU.
        </p>
      </div>
      <div className="report-grid">
        {data?.items.map((place) => (
          <article className="panel support-place" key={place.id}>
            <span className="eyebrow">
              <PlaceIcon kind={place.kind} />
              {placeKind(place.kind).label}
            </span>
            <h3>{place.name}</h3>
            <p className="muted small">
              {place.address} · {place.district}
            </p>
            <div className="page-actions">
              <button
                className="button secondary"
                onClick={() => setSelected(place.id)}
              >
                <MapPin size={15} /> Ver ubicación
              </button>
              {place.phone && (
                <a className="button secondary" href={`tel:${place.phone}`}>
                  <Phone size={15} />
                  {place.phone}
                </a>
              )}
            </div>
            <small className="muted">
              Contacto institucional; consulta el uso del número en su fuente.
            </small>
            <div className="page-actions">
              <a
                className="text-button"
                href={place.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Fuente institucional <ExternalLink size={12} />
              </a>
              <a
                className="text-button"
                href={place.location_source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Fuente de ubicación ↗
              </a>
            </div>
            <small className="muted">
              Fuentes consultadas: {place.reviewed_at}
            </small>
          </article>
        ))}
      </div>
      {!loading && !error && !data?.items.length && (
        <Notice>
          Aún no hay establecimientos del directorio cargados cerca de esta
          zona. Elige otro distrito o amplía el área de consulta.
        </Notice>
      )}
    </section>
  );
}
function PlaceIcon({ kind }: { kind: SupportPlace["kind"] }) {
  const { Icon } = placeKind(kind);
  return <Icon size={16} aria-hidden="true" />;
}
