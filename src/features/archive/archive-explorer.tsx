"use client";
import { useArea } from "@/lib/use-area";
import { useState } from "react";
import { Layers3, CalendarDays } from "lucide-react";
import { Heading, Notice, Field } from "@/components/ui";
import { useResource } from "@/lib/use-resource";
import { LIMA, type Meta } from "@/lib/contracts";
import { useReports } from "../reports/use-reports";
import { ZoneControls } from "../reports/zone-controls";
import { Summary } from "../stats/summary";
import { ReportCollection } from "../reports/report-collection";
import ZoneMap from "../map/map-loader";
export function ArchiveExplorer(): React.JSX.Element {
  const [area, setArea] = useArea({
    ...LIMA,
    radius: 50000,
    district: "",
    before: "",
  });
  const [heat, setHeat] = useState(true);
  const { data: meta, error: metaError } = useResource<Meta>("meta");
  const categories = meta?.categories || [];
  const reports = useReports(area, "archive/incidents");
  return (
    <>
      <Heading
        eyebrow="MEMORIA DE LA COMUNIDAD"
        title="La ciudad, con perspectiva."
      >
        Los reportes permanecen en este historial cuando vence su alerta o se
        resuelven. Explora su ubicación, revisa el periodo y sigue la
        conversación. El contenido retirado por moderación no se publica.
      </Heading>
      <div className="archive-layout">
        <aside className="panel archive-filters">
          <div className="archive-filter-title">
            <Layers3 size={20} />
            <h2>Explora una zona</h2>
          </div>
          <ZoneControls
            area={area}
            categories={categories}
            onChange={(next) => setArea({ ...next, district: "" })}
          />
          <div className="archive-filter-title">
            <CalendarDays size={17} />
            <h2>Periodo</h2>
          </div>
          <Field
            label="Desde"
            type="datetime-local"
            value={area.after}
            onChange={(e) => setArea({ ...area, after: e.target.value })}
          />
          <Field
            label="Hasta"
            type="datetime-local"
            value={area.before || ""}
            onChange={(e) => setArea({ ...area, before: e.target.value })}
          />
          <button
            className="text-button"
            onClick={() =>
              setArea({ ...area, after: "", before: "", district: "" })
            }
          >
            Ver todos los periodos
          </button>
        </aside>
        <div className="archive-overview">
          {(metaError || reports.error) && (
            <Notice error>{metaError || reports.error}</Notice>
          )}
          <Summary
            incidents={reports.items}
            categories={categories}
            partial={!!reports.cursor}
            loading={reports.loading}
            unavailable={!!reports.error}
          />
          <section className="archive-map map-panel">
            <div className="archive-map-heading">
              <div>
                <h2>Dónde se ha reportado</h2>
                <p>
                  {reports.items.length} reportes cargados
                  {reports.cursor ? " · muestra parcial" : ""}
                </p>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={heat}
                  onChange={(e) => setHeat(e.target.checked)}
                />
                Ver concentración
              </label>
            </div>
            <ZoneMap
              area={area}
              incidents={reports.items}
              categories={categories}
              heat={heat}
            />
            <p className="map-note">
              La concentración representa aportes de la comunidad, no una tasa
              oficial de criminalidad. Selecciona un punto para abrir el reporte
              y sus comentarios.
            </p>
          </section>
        </div>
      </div>
      {reports.loading && <Notice>Consultando el historial…</Notice>}
      <ReportCollection
        incidents={reports.items}
        categories={categories}
        loading={reports.loading}
        unavailable={!!reports.error}
        archive
      />
      {reports.cursor && (
        <button
          className="button secondary"
          disabled={reports.loading}
          onClick={() => void reports.more()}
        >
          Ampliar la muestra · cargar más
        </button>
      )}
    </>
  );
}
