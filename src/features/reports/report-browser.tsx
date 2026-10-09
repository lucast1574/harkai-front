"use client";
import { useState } from "react";
import Link from "next/link";
import { Heading, Notice } from "@/components/ui";
import { Access } from "@/components/access";
import { useResource } from "@/lib/use-resource";
import { LIMA, type Area, type Meta } from "@/lib/contracts";
import { AreaFilter } from "./area-filter";
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
}: {
  title?: string;
  fixedType?: string;
  institutional?: boolean;
  history?: boolean;
  map?: boolean;
  stats?: boolean;
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
}: {
  title: string;
  fixedType?: string;
  institutional: boolean;
  history: boolean;
  map: boolean;
  stats: boolean;
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
        Reportes de la comunidad. Una confirmación comunitaria no sustituye una
        verificación oficial.
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
      <AreaFilter
        area={area}
        categories={categories}
        onChange={setArea}
        fixedType={fixedType}
        dates={institutional || history}
      />
      {(metaError || reports.error) && (
        <Notice error>{metaError || reports.error}</Notice>
      )}
      {(stats || institutional) && (
        <Summary
          incidents={reports.items}
          categories={categories}
          partial={!!reports.cursor}
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
            heat={heat}
          />
        </section>
      )}
      <section className="report-grid" aria-label="Reportes de esta consulta">
        {reports.items.map((i) => (
          <ReportCard key={i.id} incident={i} categories={categories} />
        ))}
      </section>
      {reports.loading && <Notice>Cargando reportes…</Notice>}
      {!reports.loading && !reports.error && !reports.items.length && (
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
