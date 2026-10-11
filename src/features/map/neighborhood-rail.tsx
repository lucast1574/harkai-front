"use client";
import Link from "next/link";
import {
  MapPin,
  HeartHandshake,
  History,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { useLocationState } from "@/lib/user-location";
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
  showSupport,
  onSupport,
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
  showSupport: boolean;
  onSupport: (show: boolean) => void;
  supportError: string;
  supportPlaces: SupportPlace[];
  metadataError: string;
}): React.JSX.Element {
  const location = useLocationState();
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
          Qué pasa en <span>{name}.</span>
        </h1>
        <p>
          <MapPin size={13} />
          {area.scope === "city" ? "Toda la ciudad" : "Tu zona de consulta"}
          {area.geography?.province && ` · ${area.geography.province}`}
        </p>
      </header>
      <CoverageNotice />
      <section
        className={`${styles.summary} ${count ? styles.active : ""}`}
        aria-label="Tu zona ahora"
        aria-live="polite"
      >
        <span className={styles.summaryLabel}>
          <span />
          {unavailable ? "Consulta pendiente" : "Ahora en esta zona"}
        </span>
        <strong>
          {unavailable
            ? "No pudimos consultar las alertas"
            : reports.loading
              ? "Consultando las novedades…"
              : count
                ? `${reports.cursor ? "Al menos " : ""}${count} ${count === 1 ? "alerta vigente" : "alertas vigentes"}`
                : "Sin alertas vigentes publicadas"}
        </strong>
        <p>
          {unavailable
            ? "Vuelve a actualizar o elige otra zona."
            : reports.loading
              ? "Enseguida verás los avisos de la comunidad."
              : count
                ? `${pending ? `${pending} ${pending === 1 ? "aviso necesita" : "avisos necesitan"} confirmación. ` : ""}Abre un aviso para ver dónde ocurrió y conversar.`
                : "Esto no garantiza que la zona sea segura. Solo refleja los avisos publicados."}
        </p>
      </section>
      <details
        className={styles.settings}
        open={location.error || area.geoError ? true : undefined}
      >
        <summary>
          <MapPin size={14} />
          <span>Cambiar zona</span>
          <ChevronDown size={14} className={styles.chevron} />
        </summary>
        <NeighborhoodZone area={area} onChange={onArea} />
        <div className="scope-toggle">
          <div>
            <strong>Salud y ayuda en el mapa</strong>
            <span>Hospitales, postas y puntos de apoyo</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Mostrar centros de salud y ayuda"
            aria-checked={showSupport}
            onClick={() => onSupport(!showSupport)}
          >
            <span />
          </button>
        </div>
      </details>
      {location.busy && (
        <p className={styles.state} role="status">
          Detectando tu ubicación. Puedes explorar esta zona mientras tanto.
        </p>
      )}
      <NearbySupport places={supportPlaces} />
      <NeighborhoodFeed
        reports={reports}
        categories={categories}
        selectedId={selectedId}
        onSelect={onSelect}
        metadataError={metadataError}
      />
      <nav className={styles.shortcuts} aria-label="Más sobre tu zona">
        <Link href="/dashboard/help">
          <HeartHandshake size={19} />
          <span>
            <strong>Necesito ayuda</strong>
            <small>Contactos y orientación</small>
          </span>
          <ArrowUpRight size={15} />
        </Link>
        <Link href="/dashboard/archive">
          <History size={19} />
          <span>
            <strong>Qué pasó antes</strong>
            <small>Explora por fecha, distrito y categoría</small>
          </span>
          <ArrowUpRight size={15} />
        </Link>
      </nav>
      {showSupport && supportError && (
        <Notice error>
          No pudimos cargar los lugares de ayuda. Los reportes siguen
          disponibles.
        </Notice>
      )}
      {institutional && (
        <>
          <Link className={styles.institutional} href="/dashboard/gov">
            Análisis municipal y exportaciones <ArrowUpRight size={15} />
          </Link>
        </>
      )}
      <p className={styles.footnote}>
        Los avisos los publica la comunidad desde la app. En la web puedes
        informarte, comentar y confirmar.
      </p>
    </aside>
  );
}
