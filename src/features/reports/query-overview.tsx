import { MapPin, MessageSquare, ShieldCheck, CircleHelp } from "lucide-react";
import type { Area, Incident } from "@/lib/contracts";
import styles from "./query-overview.module.css";

/** Context and counts describe the loaded query, never an estimated city total. */
export function QueryOverview({
  area,
  incidents,
  loading,
  partial,
  unavailable = false,
  compact = false,
  archive = false,
}: {
  area: Area;
  incidents: Incident[];
  loading: boolean;
  partial: boolean;
  unavailable?: boolean;
  compact?: boolean;
  archive?: boolean;
}): React.JSX.Element {
  const confirmed = incidents.filter((report) => report.verified).length;
  const value = (count: number): string =>
    loading || unavailable ? "—" : String(count);
  return (
    <section
      className={`${styles.overview} ${compact ? styles.compact : ""}`}
      aria-label="Resumen de la consulta"
      aria-busy={loading}
    >
      <header className={styles.context}>
        <MapPin size={17} aria-hidden="true" />
        <div>
          <strong>{area.geography?.name || "Zona seleccionada"}</strong>
          <span>
            {area.geography
              ? area.scope === "city"
                ? "Consulta de ciudad"
                : "Consulta distrital"
              : "Distrito pendiente"}{" "}
            · {archive ? "Historial" : "Alertas vigentes"}
          </span>
        </div>
      </header>
      <div className={styles.metrics}>
        <article>
          <MessageSquare size={17} aria-hidden="true" />
          <strong>
            {value(incidents.length)}
            {!loading && !unavailable && partial ? "+" : ""}
          </strong>
          <span>Cargados</span>
        </article>
        <article>
          <ShieldCheck size={17} aria-hidden="true" />
          <strong>{value(confirmed)}</strong>
          <span>Confirmados</span>
        </article>
        <article>
          <CircleHelp size={17} aria-hidden="true" />
          <strong>{value(incidents.length - confirmed)}</strong>
          <span>Por confirmar</span>
        </article>
      </div>
      <p>
        {unavailable
          ? "No pudimos consultar los reportes. Vuelve a actualizar."
          : loading
            ? "Consultando los reportes de esta zona…"
            : partial
              ? "Hay más resultados. Carga más para ampliar esta muestra."
              : "Resumen de los reportes cargados en esta consulta."}
      </p>
    </section>
  );
}
