"use client";
import { useState } from "react";
import Link from "next/link";
import { Heading, Notice } from "@/components/ui";
import { Access } from "@/components/access";
import { useResource } from "@/lib/use-resource";
import { LIMA, type Area, type Meta } from "@/lib/contracts";
import { ZoneControls } from "./zone-controls";
import { AreaFilter } from "./area-filter";
import { ReportCollection } from "./report-collection";
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
  const [area, setArea] = useState<Area>({ ...LIMA, type: fixedType || "" });
  const [heat, setHeat] = useState(false);
  const { data: meta, error: metaError } = useResource<Meta>("meta");
  const reports = useReports(
    area,
    history ? "me/incidents" : institutional ? "gov/incidents" : "incidents",
  );
  const categories = meta?.categories || [];
  return (
    <>
      <Heading
        eyebrow={
          institutional ? "Información para gobiernos locales" : undefined
        }
        title={title}
      >
        {mode === "directory"
          ? "Busca un reporte, revisa su estado y abre el detalle para ver su ubicación o confirmar lo ocurrido."
          : mode === "feed"
            ? "Una cronología de lo que comparte la comunidad en tu zona. Los reportes se muestran como fueron publicados; no son noticias verificadas por una redacción."
            : mode === "analytics"
              ? "Entiende la muestra de reportes de tu consulta: qué se reporta y cuántos cuentan con una confirmación comunitaria."
              : "Explora aportes de la comunidad en la zona que elijas."}
      </Heading>
      <div className="page-actions">
        <Link className="button" href="/dashboard/report">
          + Crear reporte
        </Link>
        <button
          className="button secondary"
          disabled={reports.loading}
          onClick={() => {
            void reports.reload();
          }}
        >
          Actualizar
        </button>
        {institutional && (
          <button
            className="button secondary"
            disabled={!reports.items.length}
            onClick={() =>
              exportReports(reports.items, categories, !!reports.cursor, area)
            }
          >
            Descargar CSV de esta consulta
          </button>
        )}
      </div>
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
            Zona de consulta · {area.radius / 1000} km alrededor de{" "}
            {area.latitude.toFixed(3)}, {area.longitude.toFixed(3)}{" "}
            <span>Cambiar zona o categoría ↓</span>
          </summary>
          <ZoneControls
            area={area}
            categories={categories}
            onChange={setArea}
            fixedType={fixedType}
          />
        </details>
      )}
      {(metaError || reports.error) && (
        <Notice error>{metaError || reports.error}</Notice>
      )}
      {(stats || institutional) && (
        <Summary
          incidents={reports.items}
          categories={categories}
          partial={!!reports.cursor}
          loading={reports.loading}
        />
      )}
      <div className="coverage">
        <span>
          {reports.items.length} reportes cargados · {area.radius / 1000} km de
          radio{reports.cursor ? " · hay más resultados" : ""}
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
    </>
  );
}
