"use client";
import { ArrowUpRight, RefreshCw, Clock3, MessageCircle } from "lucide-react";
import { Notice } from "@/components/ui";
import { dateLabel, type Category } from "@/lib/contracts";
import type { useReports } from "../reports/use-reports";
import styles from "./neighborhood-rail.module.css";

export function NeighborhoodFeed({
  reports,
  categories,
  selectedId,
  onSelect,
  metadataError,
}: {
  reports: ReturnType<typeof useReports>;
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  metadataError: string;
}): React.JSX.Element {
  const items = [...reports.items].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );
  return (
    <section
      className={styles.feed}
      aria-label="Lo último en tu zona"
      aria-busy={reports.loading}
    >
      <div className={styles.feedHeading}>
        <h2>Lo último en tu zona</h2>
        <button
          className="icon-button"
          aria-label="Actualizar reportes"
          disabled={reports.loading}
          onClick={() => void reports.reload()}
        >
          <RefreshCw size={15} />
        </button>
      </div>
      {(reports.error || metadataError) && (
        <Notice error>{reports.error || metadataError}</Notice>
      )}
      {reports.loading && !items.length && (
        <p className={styles.state} role="status">
          Buscando las alertas de esta zona…
        </p>
      )}
      {!reports.loading && !reports.error && !items.length && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <MessageCircle size={22} />
          </span>
          <h3>Aún no hay novedades publicadas</h3>
          <p>
            Los avisos de tus vecinos aparecerán aquí. Mientras tanto, puedes
            conocer lo que pasó antes o encontrar ayuda.
          </p>
        </div>
      )}
      <div className={styles.cards}>
        {items.map((report) => (
          <button
            key={report.id}
            className={`${styles.report} ${selectedId === report.id ? styles.selected : ""}`}
            aria-pressed={selectedId === report.id}
            onClick={() => onSelect(report.id)}
          >
            <span className={styles.reportTop}>
              <strong>
                {categories.find((category) => category.id === report.type)
                  ?.label || report.type}
              </strong>
              <ArrowUpRight size={15} />
            </span>
            <span className={styles.description}>{report.description}</span>
            <span className={styles.reportMeta}>
              <span
                className={report.verified ? styles.confirmed : styles.pending}
              >
                {report.verified
                  ? "Confirmado por la comunidad"
                  : "Por confirmar"}
              </span>
            </span>
            <span className={styles.reportTime}>
              <Clock3 size={12} />
              {dateLabel(report.created_at)}
              {report.district && ` · ${report.district}`}
            </span>
          </button>
        ))}
      </div>
      {reports.cursor && (
        <button
          className="button secondary"
          disabled={reports.loading}
          onClick={() => void reports.more()}
        >
          Ver más novedades
        </button>
      )}
    </section>
  );
}
