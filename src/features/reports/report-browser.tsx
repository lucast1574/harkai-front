"use client";
import { useState } from "react";
import { Radio, LocateFixed, RefreshCw, Download } from "lucide-react";
import { useArea, rememberUserLocation } from "@/lib/use-area";
import { Notice } from "@/components/ui";
import { Access } from "@/components/access";
import { useResource } from "@/lib/use-resource";
import { LIMA, type Meta } from "@/lib/contracts";
import { SUPPORT_CITIES } from "../support/contracts";
import { useLocationRequest } from "../map/use-location-request";
import { ZoneControls } from "./zone-controls";
import { AreaFilter } from "./area-filter";
import { ReportCollection } from "./report-collection";
import { QueryOverview } from "./query-overview";
import { ReportCard } from "./report-card";
import { useReports } from "./use-reports";
import ZoneMap from "../map/map-loader";
import { Summary } from "../stats/summary";
import { exportReports } from "../stats/export";

export function ReportBrowser({
  title = "El pulso de tu zona",
  fixedType,
  institutional = false,
  history = false,
  map = true,
  stats = false,
  mode = "cards",
}: {
  title?: string;
  fixedType?: string;
  institutional?: boolean;
  history?: boolean;
  map?: boolean;
  stats?: boolean;
  mode?: "cards" | "directory" | "feed" | "analytics";
}): React.JSX.Element {
  if (institutional || history)
    return (
      <Access roles={institutional ? ["gov", "admin"] : undefined}>
        <Browser
          title={title}
          fixedType={fixedType}
          institutional={institutional}
          history={history}
          map={map}
          stats={stats}
          mode={mode}
        />
      </Access>
    );
  return (
    <Browser
      title={title}
      fixedType={fixedType}
      institutional={institutional}
      history={history}
      map={map}
      stats={stats}
      mode={mode}
    />
  );
}

function Browser({
  title,
  fixedType,
  institutional,
  history,
  map,
  stats,
  mode,
}: {
  title: string;
  fixedType?: string;
  institutional: boolean;
  history: boolean;
  map: boolean;
  stats: boolean;
  mode: "cards" | "directory" | "feed" | "analytics";
}): React.JSX.Element {
  const [area, setArea] = useArea({ ...LIMA, type: fixedType || "" });
  const [heat, setHeat] = useState(false);
  const { data: meta, error: metaError } = useResource<Meta>("meta");
  const reports = useReports(
    area,
    history ? "me/incidents" : institutional ? "gov/incidents" : "incidents",
  );
  const categories = meta?.categories || [];

  const locate = useLocationRequest((next) => {
    rememberUserLocation(next);
    setArea({
      ...area,
      latitude: next.latitude,
      longitude: next.longitude,
      ubigeo: "",
    });
  });

  const province = area.geography?.province || "Lima";
  const isTrujillo = province.toLowerCase().includes("trujillo");

  function selectCity(target: "lima" | "trujillo"): void {
    const coords = SUPPORT_CITIES[target];
    setArea({
      ...area,
      latitude: coords.latitude,
      longitude: coords.longitude,
      ubigeo: "",
    });
  }

  return (
    <div className="archive-shell">
      <header className="account-hero">
        <div className="account-hero-copy">
          <div className="account-badge">
            <Radio size={14} />
            <span>
              {institutional
                ? "PANEL INSTITUCIONAL"
                : history
                  ? "TU ACTIVIDAD"
                  : "ALERTAS DE LA COMUNIDAD"}
            </span>
          </div>
          <h1>{title}</h1>
          <p>
            {mode === "directory"
              ? "Busca un reporte, revisa su estado y abre el detalle para ver su ubicación o confirmar lo ocurrido."
              : mode === "feed"
                ? "Cronología de lo que comparte la comunidad en tu zona."
                : mode === "analytics"
                  ? "Muestra de reportes de tu consulta: qué se reporta y cuántos cuentan con confirmación comunitaria."
                  : "Explora los aportes de la comunidad en la zona que elijas."}
          </p>
        </div>
        <div className="archive-hero-actions">
          <div className="city-switcher" role="group" aria-label="Ciudad activa">
            <button
              type="button"
              className={`city-pill ${!isTrujillo ? "active" : ""}`}
              onClick={() => selectCity("lima")}
            >
              Lima
            </button>
            <button
              type="button"
              className={`city-pill ${isTrujillo ? "active" : ""}`}
              onClick={() => selectCity("trujillo")}
            >
              Trujillo
            </button>
          </div>
          <button
            type="button"
            className="account-map-pill"
            disabled={locate.busy || area.geoPending}
            onClick={() => void locate.find()}
          >
            <LocateFixed size={15} />
            <span>{locate.busy ? "Ubicando…" : "Mi ubicación"}</span>
          </button>
          <button
            type="button"
            className="account-map-pill"
            disabled={reports.loading}
            onClick={() => void reports.reload()}
          >
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
          {institutional && (
            <button
              type="button"
              className="account-map-pill"
              disabled={!reports.items.length}
              onClick={() =>
                exportReports(
                  reports.items,
                  categories,
                  !!reports.cursor,
                  area,
                )
              }
            >
              <Download size={15} />
              <span>Exportar CSV</span>
            </button>
          )}
        </div>
      </header>

      {institutional || history ? (
        <AreaFilter
          area={area}
          categories={categories}
          onChange={setArea}
          fixedType={fixedType}
          dates={institutional || history}
        />
      ) : (
        <details className="collection-zone">
          <summary>
            Zona de consulta ·{" "}
            {area.geography?.name || "Identificando distrito…"}{" "}
            <span>Cambiar distrito o categoría ↓</span>
          </summary>
          <ZoneControls
            area={area}
            categories={categories}
            onChange={setArea}
            fixedType={fixedType}
          />
        </details>
      )}
      {(metaError || reports.error || locate.error) && (
        <Notice error>{metaError || reports.error || locate.error}</Notice>
      )}
      {!stats && !institutional && (
        <QueryOverview
          area={area}
          incidents={reports.items}
          loading={reports.loading}
          partial={!!reports.cursor}
          unavailable={!!reports.error}
          archive={history}
        />
      )}
      {(stats || institutional) && (
        <Summary
          incidents={reports.items}
          categories={categories}
          partial={!!reports.cursor}
          loading={reports.loading}
          unavailable={!!reports.error}
        />
      )}
      {(stats || institutional) && (
        <div className="coverage">
          <span>
            {reports.items.length} reportes cargados ·{" "}
            {area.geography?.name || "Distrito pendiente"}
            {reports.cursor ? " · hay más resultados" : ""}
            {history ? " · historial de tu cuenta" : ""}
          </span>
          {institutional && (
            <label>
              <input
                type="checkbox"
                checked={heat}
                onChange={(e) => setHeat(e.target.checked)}
              />{" "}
              Densidad de reportes
            </label>
          )}
        </div>
      )}
      {map && (
        <section className="map-panel">
          {heat && (
            <p className="map-note">
              Concentración de los reportes cargados; no representa una tasa de
              criminalidad ni una cobertura completa.
            </p>
          )}
          <ZoneMap
            area={area}
            incidents={reports.items}
            categories={categories}
            heat={mode === "analytics" || heat}
          />
        </section>
      )}
      {mode === "directory" || mode === "feed" ? (
        <ReportCollection
          incidents={reports.items}
          categories={categories}
          feed={mode === "feed"}
          loading={reports.loading}
          unavailable={!!reports.error}
        />
      ) : (
        mode !== "analytics" && (
          <section
            className="report-grid"
            aria-label="Reportes de esta consulta"
          >
            {reports.items.map((i) => (
              <ReportCard key={i.id} incident={i} categories={categories} />
            ))}
          </section>
        )
      )}
      {reports.loading && <Notice>Cargando reportes…</Notice>}
      {!reports.loading &&
        !reports.error &&
        !reports.items.length &&
        mode === "cards" && (
          <section className="empty panel">
            <h2>Aún no hay reportes en esta consulta</h2>
            <p>
              Prueba otra zona o categoría. La ausencia de reportes no garantiza
              que no existan riesgos.
            </p>
          </section>
        )}
      {reports.cursor && (
        <button
          className="button secondary"
          disabled={reports.loading}
          onClick={() => {
            void reports.more();
          }}
        >
          Cargar más reportes
        </button>
      )}
    </div>
  );
}
