"use client";
import type { Category, Incident } from "@/lib/contracts";
export function Summary({
  incidents,
  categories,
  partial,
  loading = false,
  unavailable = false,
}: {
  incidents: Incident[];
  categories: Category[];
  partial: boolean;
  loading?: boolean;
  unavailable?: boolean;
}): React.JSX.Element {
  const confirmed = incidents.filter((i) => i.verified).length;
  const counts = categories
    .map((c) => ({
      ...c,
      count: incidents.filter((i) => i.type === c.id).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  return (
    <>
      <div className="metrics">
        <article>
          <span>Reportes cargados</span>
          <strong>
            {loading || unavailable ? "—" : incidents.length}
            {!loading && !unavailable && partial ? "+" : ""}
          </strong>
          <small className="muted">En esta consulta</small>
        </article>
        <article>
          <span>No verificados</span>
          <strong>
            {loading || unavailable ? "—" : incidents.length - confirmed}
          </strong>
          <small className="muted">Pendientes de confirmación</small>
        </article>
        <article>
          <span>Confirmados por la comunidad</span>
          <strong>{loading || unavailable ? "—" : confirmed}</strong>
          <small className="muted">Al menos otro usuario confirmó</small>
        </article>
      </div>
      <section className="panel distribution">
        <h2>Qué está reportando la comunidad</h2>
        <p className="muted small">
          {partial
            ? "Consulta parcial: carga todas las páginas para ampliar la muestra."
            : "Cifras de los reportes cargados en la zona y el periodo consultados."}
        </p>
        {unavailable ? (
          <p className="muted">
            No se pudo cargar la consulta. Actualiza para ver el resumen.
          </p>
        ) : loading ? (
          <p className="muted" role="status">
            Consultando los reportes…
          </p>
        ) : counts.length ? (
          counts.map((c) => (
            <div className="chart-row" key={c.id}>
              <span>{c.label}</span>
              <div className="chart-track">
                <div
                  style={{
                    width: `${(c.count / Math.max(1, incidents.length)) * 100}%`,
                  }}
                />
              </div>
              <strong>{c.count}</strong>
            </div>
          ))
        ) : (
          <p className="muted">
            Los gráficos aparecerán cuando esta consulta tenga reportes.
          </p>
        )}
      </section>
    </>
  );
}
