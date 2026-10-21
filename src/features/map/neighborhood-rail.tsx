"use client";
import Link from "next/link";
import { MapPin, ArrowUpRight, ChevronDown } from "lucide-react";
import { Notice } from "@/components/ui";
import type { Area, Category } from "@/lib/contracts";
import type { useReports } from "../reports/use-reports";
import { NeighborhoodZone } from "./neighborhood-zone";
import { NeighborhoodFeed } from "./neighborhood-feed";
import type { SupportPlace } from "../support/contracts";
import { CoverageNotice } from "../support/coverage-notice";
import { NearbySupport } from "../support/nearby-support";
import styles from "./neighborhood-rail.module.css";

export function NeighborhoodRail({
  area,
  categories,
  reports,
  institutional,
  selectedId,
  onSelect,
  onArea,
  supportError,
  supportPlaces,
  metadataError,
}: {
  area: Area;
  categories: Category[];
  reports: ReturnType<typeof useReports>;
  institutional: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onArea: (area: Area) => void;
  supportError: string;
  supportPlaces: SupportPlace[];
  metadataError: string;
}): React.JSX.Element {
  const name = area.geography?.name || "tu zona";
  const count = reports.items.length;
  const pending = reports.items.filter((report) => !report.verified).length;
  const unavailable = !!reports.error || !!area.geoError;
  return (
    <aside className={`explore-rail ${styles.rail}`}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>
          {institutional ? "VISTA MUNICIPAL" : "EL PULSO DE TU BARRIO"}
        </span>
        <h1>
          Qué pasa en <span>{name}</span>
        </h1>
      </header>
      <details className={styles.settings}>
        <summary>
          <span className={styles.zonePin}>
            <MapPin size={14} />
          </span>
          <span className={styles.zoneSummaryText}>
            <strong>{name}</strong>
            <small>
              {area.scope === "city"
                ? "Toda la ciudad"
                : area.geography?.province || "Distrito actual"}
            </small>
          </span>
          <span className={styles.zoneAction}>
            Cambiar
            <ChevronDown size={14} className={styles.chevron} />
          </span>
        </summary>
        <div className={styles.settingsBody}>
          <NeighborhoodZone area={area} onChange={onArea} />
        </div>
      </details>
      <CoverageNotice />
      <section
        className={`${styles.summary} ${count ? styles.active : ""}`}
        aria-label="Tu zona ahora"
        aria-live="polite"
      >
        <div className={styles.summaryHeader}>
          <span className={styles.summaryDot} />
          <strong>
            {unavailable
              ? "No pudimos consultar las alertas"
              : reports.loading
                ? "Consultando novedades…"
                : count
                  ? `${reports.cursor ? "Al menos " : ""}${count} ${count === 1 ? "alerta activa" : "alertas activas"}`
                  : "Sin alertas activas ahora"}
          </strong>
        </div>
        {(unavailable || count > 0) && (
          <p>
            {unavailable
              ? "Vuelve a actualizar o selecciona otro distrito."
              : `${pending ? `${pending} por confirmar · ` : ""}Selecciona un aviso para ver su ubicación en el mapa.`}
          </p>
        )}
      </section>
      <NearbySupport places={supportPlaces} />
      <NeighborhoodFeed
        reports={reports}
        categories={categories}
        selectedId={selectedId}
        onSelect={onSelect}
        metadataError={metadataError}
      />
      {supportError && (
        <Notice error>
          No pudimos cargar los lugares de ayuda. Los reportes siguen
          disponibles.
        </Notice>
      )}
      {institutional && (
        <Link className={styles.institutional} href="/dashboard/gov">
          Análisis municipal y exportaciones <ArrowUpRight size={15} />
        </Link>
      )}
    </aside>
  );
}
