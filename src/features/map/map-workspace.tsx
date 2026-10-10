"use client";
import { useArea } from "@/lib/use-area";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, RefreshCw, ShieldCheck, X } from "lucide-react";
import {
  areaQuery,
  LIMA,
  dateLabel,
  type Meta,
  type Area,
} from "@/lib/contracts";
import { useResource } from "@/lib/use-resource";
import type { SupportPlace } from "../support/contracts";
import { Notice } from "@/components/ui";
import { QueryOverview } from "../reports/query-overview";
import { useReports } from "../reports/use-reports";
import { Verification } from "../reports/report-card";
import { ZoneControls } from "../reports/zone-controls";
import ZoneMap from "./map-loader";
export function MapWorkspace(): React.JSX.Element {
  const [showSupport, setShowSupport] = useState(true);
  const [area, setArea] = useArea(LIMA);
  const [selectedId, setSelected] = useState("");
  const [candidate, setCandidate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const { data: meta, error: metaError } = useResource<Meta>("meta");
  const categories = meta?.categories || [];
  const reports = useReports(area);
  const support = useResource<{ items: SupportPlace[] }>(
    area.geoPending || area.geoError
      ? null
      : `support/places?${areaQuery(area)}`,
  );
  const selected = reports.items.find((i) => i.id === selectedId);
  const changeArea = (a: Area) => {
    setArea(a);
    setSelected("");
    setCandidate(null);
  };
  return (
    <section
      className="map-workspace"
      aria-label="Explora los reportes en el mapa"
    >
      <aside className="explore-rail">
        <header className="explore-heading">
          <span className="eyebrow">MAPA DE MI ZONA</span>
          <h1>Qué pasa cerca de ti.</h1>
          <p>
            Consulta las alertas vigentes, abre un reporte y conversa con tu
            comunidad.
          </p>
        </header>
        <ZoneControls
          area={area}
          categories={categories}
          onChange={changeArea}
        />
        <label className="checkbox">
          <input
            type="checkbox"
            checked={showSupport}
            onChange={(e) => setShowSupport(e.target.checked)}
          />{" "}
          Mostrar centros de salud y ayuda
        </label>
        {showSupport && support.error && (
          <Notice error>
            No se pudo cargar el directorio de salud. Las alertas siguen
            disponibles.
          </Notice>
        )}
        <QueryOverview
          compact
          area={area}
          incidents={reports.items}
          loading={reports.loading}
          partial={!!reports.cursor}
          unavailable={!!reports.error}
        />
        <div className="rail-results">
          <div className="results-heading">
            <h2>
              Reportes cercanos{" "}
              <span>
                {reports.items.length}
                {reports.cursor ? "+" : ""}
              </span>
            </h2>
            <button
              className="icon-button"
              aria-label="Actualizar reportes"
              disabled={reports.loading}
              onClick={() => void reports.reload()}
            >
              <RefreshCw size={16} />
            </button>
          </div>
          {(reports.error || metaError) && (
            <Notice error>{reports.error || metaError}</Notice>
          )}
          {reports.loading && (
            <p className="small muted" role="status">
              Consultando esta zona…
            </p>
          )}
          {!reports.loading && !reports.error && !reports.items.length && (
            <div className="rail-empty">
              <span className="empty-icon">
                <MapPin size={25} />
              </span>
              <h3>Esta zona aún no tiene reportes</h3>
              <p>
                Mueve el mapa o elige otra zona para explorar los aportes de la
                comunidad.
              </p>
              <Link href="/dashboard/archive">
                Explorar el historial <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
          <div className="map-report-list">
            {reports.items.map((i) => (
              <button
                key={i.id}
                className={`map-report-item ${i.id === selectedId ? "selected" : ""}`}
                aria-pressed={i.id === selectedId}
                onClick={() => setSelected(i.id)}
              >
                <span
                  className={`report-dot ${i.verified ? "confirmed" : ""}`}
                />
                <span>
                  <strong>
                    {categories.find((c) => c.id === i.type)?.label || i.type}
                  </strong>
                  <span className="report-snippet">{i.description}</span>
                  <small>
                    {dateLabel(i.created_at)} ·{" "}
                    {i.verified ? "Confirmado" : "No verificado"}
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
          {reports.cursor && (
            <button
              className="button secondary"
              disabled={reports.loading}
              onClick={() => void reports.more()}
            >
              Cargar más reportes
            </button>
          )}
        </div>
        <div className="rail-footnote">
          <ShieldCheck size={16} />
          <span>
            La comunidad confirma los reportes. La ausencia de alertas no
            garantiza seguridad.
          </span>
        </div>
      </aside>
      <div className="map-stage">
        <ZoneMap
          supportPlaces={showSupport ? support.data?.items || [] : []}
          scrollWheelZoom
          area={area}
          incidents={reports.items}
          categories={categories}
          selectedId={selectedId}
          onSelect={setSelected}
          onMove={(latitude, longitude) =>
            setCandidate(
              Math.abs(latitude - area.latitude) < 0.0001 &&
                Math.abs(longitude - area.longitude) < 0.0001
                ? null
                : { latitude, longitude },
            )
          }
        />
        {candidate && (
          <button
            className="button map-search"
            onClick={() => changeArea({ ...area, ...candidate })}
          >
            <MapPin size={15} /> Buscar en esta zona
          </button>
        )}
        <div className="map-legend">
          <span>
            <i className="report-dot user-location" /> Tu ubicación
          </span>
          {showSupport && (
            <span>
              <i className="report-dot support" /> Salud y ayuda
            </span>
          )}
          <span>
            <i className="report-dot confirmed" /> Confirmado
          </span>
          <span>
            <i className="report-dot" /> No verificado
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
