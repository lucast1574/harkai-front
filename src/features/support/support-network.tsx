"use client";
import { useState } from "react";
import { PawPrint, HeartHandshake, RefreshCw } from "lucide-react";
import { Heading, Notice } from "@/components/ui";
import { LIMA, type Area, type Meta } from "@/lib/contracts";
import { useResource } from "@/lib/use-resource";
import { ZoneControls } from "../reports/zone-controls";
import { useReports } from "../reports/use-reports";
import { ReportCard } from "../reports/report-card";
export function SupportNetwork(): React.JSX.Element {
  const [area, setArea] = useState<Area>({ ...LIMA, type: "pet" });
  const { data: meta, error } = useResource<Meta>("meta");
  const reports = useReports(area);
  return (
    <>
      <Heading eyebrow="COMUNIDAD QUE ACOMPAÑA" title="Una red para ayudarnos.">
        Encuentra mascotas perdidas o encontradas y lugares de ayuda compartidos
        por tu comunidad. Abre un reporte para conversar o consultar su contacto
        público.
      </Heading>
      <div className="support-choices" aria-label="Tipo de ayuda">
        {[
          {
            type: "pet",
            icon: PawPrint,
            title: "Mascotas",
            description: "Perdidas y encontradas cerca de ti.",
          },
          {
            type: "place",
            icon: HeartHandshake,
            title: "Lugares de ayuda",
            description: "Recursos y espacios publicados por la comunidad.",
          },
        ].map((choice) => (
          <button
            className={area.type === choice.type ? "selected" : ""}
            key={choice.type}
            aria-pressed={area.type === choice.type}
            onClick={() => setArea({ ...area, type: choice.type })}
          >
            <choice.icon size={26} />
            <span>
              <strong>{choice.title}</strong>
              <small>{choice.description}</small>
            </span>
          </button>
        ))}
      </div>
      <section className="panel support-zone">
        <ZoneControls
          area={area}
          categories={meta?.categories || []}
          fixedType={area.type}
          onChange={setArea}
        />
      </section>
      <div className="support-results-heading">
        <h2>
          {area.type === "pet"
            ? "Mascotas en esta zona"
            : "Lugares de ayuda en esta zona"}
        </h2>
        <button
          className="text-button"
          disabled={reports.loading}
          onClick={() => void reports.reload()}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>
      {(error || reports.error) && (
        <Notice error>{error || reports.error}</Notice>
      )}
      {reports.loading && <Notice>Consultando la red de apoyo…</Notice>}
      <div className="report-grid">
        {reports.items.map((incident) => (
          <ReportCard
            key={incident.id}
            incident={incident}
            categories={meta?.categories || []}
          />
        ))}
      </div>
      {!reports.loading && !reports.error && !reports.items.length && (
        <section className="panel empty">
          <h2>Aún no hay aportes en esta zona</h2>
          <p>
            Amplía el radio o elige otro lugar. Los aportes se publican desde la
            app móvil.
          </p>
        </section>
      )}
      {reports.cursor && (
        <button
          className="button secondary"
          disabled={reports.loading}
          onClick={() => void reports.more()}
        >
          Ver más aportes
        </button>
      )}
      <p className="muted small">
        Los lugares son aportes comunitarios: no implican afiliación ni atención
        oficial garantizada. Confirma disponibilidad antes de acudir.
      </p>
    </>
  );
}
