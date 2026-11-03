"use client";
import { useAuth } from "@/lib/auth";
import { useArea } from "@/lib/use-area";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import {
  areaQuery,
  LIMA,
  dateLabel,
  type Meta,
  type Area,
  type Incident,
} from "@/lib/contracts";
import { useResource } from "@/lib/use-resource";
import type { SupportPlace } from "../support/contracts";
import { useReports } from "../reports/use-reports";
import { Verification } from "../reports/report-card";
import { NeighborhoodRail } from "./neighborhood-rail";
import ZoneMap from "./map-loader";
import { MapCityControl } from "./map-city-control";
import type { Business } from "../business/business-contract";

export function MapWorkspace({
  initialIncident,
}: { initialIncident?: string } = {}): React.JSX.Element {
  const [area, setArea] = useArea(LIMA);
  const [selectedId, setSelected] = useState(initialIncident || "");
  const { user } = useAuth();
  const institutional = user?.role === "gov" || user?.role === "admin";
  const { data: meta, error: metaError } = useResource<Meta>("meta");
  const categories = meta?.categories || [];
  const reports = useReports(area);
  const linked = useResource<Incident>(
    initialIncident ? `incidents/${initialIncident}` : null,
  );
  const incidents =
    linked.data && !reports.items.some((i) => i.id === linked.data!.id)
      ? [...reports.items, linked.data]
      : reports.items;
  const support = useResource<{ items: SupportPlace[] }>(
    area.geoPending || area.geoError
      ? null
      : `support/places?${areaQuery(area)}`,
  );
  const supportPlaces = support.data?.items || [];
  const businesses = useResource<{ items: Business[] }>(
    area.geoPending || area.geoError
      ? null
      : `businesses?lat=${area.latitude}&lng=${area.longitude}&radius_meters=${area.radius}&limit=100`,
  );
  const selected = incidents.find((i) => i.id === selectedId);
  const changeArea = (a: Area) => {
    setArea({ ...a, type: "" });
    setSelected("");
  };
  return (
    <section
      className="map-workspace"
      aria-label="Explora los reportes en el mapa"
    >
      <NeighborhoodRail
        area={area}
        categories={categories}
        reports={reports}
        institutional={institutional}
        selectedId={selectedId}
        onSelect={setSelected}
        onArea={changeArea}
        supportError={support.error}
        supportPlaces={supportPlaces}
        metadataError={metaError}
      />
      <div className="map-stage">
        <ZoneMap
          businesses={businesses.data?.items || []}
          supportPlaces={supportPlaces}
          scrollWheelZoom
          area={area}
          incidents={incidents}
          categories={categories}
          selectedId={selectedId}
          onSelect={setSelected}
        />
        <MapCityControl area={area} onChange={changeArea} />
        <div className="map-legend">
          <span>
            <i className="report-dot business" /> Negocios
          </span>
          <span>
            <i className="report-dot user-location" /> Tu ubicación
          </span>
          <span>
            <i className="report-dot support" /> Salud y ayuda
          </span>
          <span>
            <i className="report-dot" /> Reportes por categoría
          </span>
        </div>
        {selected && (
          <article className="map-preview">
            <button
              className="icon-button preview-close"
              aria-label="Cerrar vista del reporte"
              onClick={() => setSelected("")}
            >
              <X size={18} />
            </button>
            <span className="eyebrow">REPORTE DE LA COMUNIDAD</span>
            <h2>
              {categories.find((c) => c.id === selected.type)?.label ||
                selected.type}
            </h2>
            <Verification incident={selected} />
            <p>{selected.description}</p>
            <div>
              <span className="small muted">
                {selected.district ||
                  selected.city ||
                  dateLabel(selected.created_at)}
              </span>
              <Link href={`/incidents/${selected.id}`}>
                Ver detalle <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
