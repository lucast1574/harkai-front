"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, ListFilter, Clock3 } from "lucide-react";
import type { Category, Incident } from "@/lib/contracts";
import { dateLabel } from "@/lib/contracts";
import { Verification } from "./report-card";
import { Field, Select } from "@/components/ui";
export function ReportCollection({
  incidents,
  categories,
  feed = false,
  archive = false,
  loading = false,
}: {
  incidents: Incident[];
  categories: Category[];
  feed?: boolean;
  archive?: boolean;
  loading?: boolean;
}): React.JSX.Element {
  const [feedView, setFeedView] = useState(feed);
  const [now] = useState(() => Date.now());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const items = incidents.filter(
    (i) =>
      (status === "all" ||
        (status === "confirmed" ? i.verified : !i.verified)) &&
      `${i.description} ${i.district || ""} ${i.city || ""} ${categories.find((c) => c.id === i.type)?.label || i.type}`
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")),
  );
  return (
    <section
      className={feedView ? "community-feed" : "report-directory"}
      aria-label={feedView ? "Actividad reciente" : "Directorio de reportes"}
    >
      {feed && (
        <div className="collection-views" aria-label="Vista de la comunidad">
          <button
            className={feedView ? "selected" : ""}
            aria-pressed={feedView}
            onClick={() => setFeedView(true)}
          >
            Conversaciones
          </button>
          <button
            className={!feedView ? "selected" : ""}
            aria-pressed={!feedView}
            onClick={() => setFeedView(false)}
          >
            Lista de reportes
          </button>
        </div>
      )}
      <div className="collection-tools">
        <span className="collection-icon">
          {feedView ? <Clock3 size={18} /> : <ListFilter size={18} />}
        </span>
        <Field
          label="Buscar en los reportes cargados"
          type="search"
          placeholder="Descripción, distrito o categoría…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          label="Confirmación"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">No verificados</option>
          <option value="confirmed">Confirmados</option>
        </Select>
      </div>
      {feedView ? (
        <div className="timeline">
          {items.map((i) => (
            <article key={i.id} className="timeline-entry">
              <div className="timeline-time">
                <span>
                  {new Date(i.created_at).toLocaleDateString("es-PE", {
                    timeZone: "America/Lima",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <small>
                  {new Date(i.created_at).toLocaleTimeString("es-PE", {
                    timeZone: "America/Lima",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
              <div className="timeline-body">
                <Verification incident={i} />
                <h2>
                  <Link href={`/incidents/${i.id}`}>
                    {categories.find((c) => c.id === i.type)?.label || i.type}
                  </Link>
                </h2>
                <p>{i.description}</p>
                <footer>
                  <span>{i.district || i.city || "Reporte con ubicación"}</span>
                  <Link href={`/incidents/${i.id}#conversacion`}>
                    Ver conversación <ArrowUpRight size={15} />
                  </Link>
                </footer>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="report-table-scroll">
          <table className="report-table">
            <thead>
              <tr>
                <th>Reporte</th>
                <th>Zona</th>
                {archive && <th>Estado</th>}
                <th>Confirmación</th>
                <th>Publicado</th>
                <th>
                  <span className="sr-only">Detalle</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>
                    <Link href={`/incidents/${i.id}`}>
                      <strong>
                        {categories.find((c) => c.id === i.type)?.label ||
                          i.type}
                      </strong>
                      <span>{i.description}</span>
                    </Link>
                  </td>
                  <td>{i.district || i.city || "Ver ubicación"}</td>
                  {archive && (
                    <td>
                      {i.status === "resolved"
                        ? "Resuelto"
                        : i.expires_at &&
                            new Date(i.expires_at).getTime() <= now
                          ? "Alerta vencida"
                          : "Vigente"}
                    </td>
                  )}
                  <td>
                    <Verification incident={i} />
                  </td>
                  <td>{dateLabel(i.created_at)}</td>
                  <td>
                    <Link
                      aria-label={`Ver reporte: ${categories.find((c) => c.id === i.type)?.label || i.type}`}
                      href={`/incidents/${i.id}`}
                    >
                      <ArrowUpRight size={19} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!items.length && !loading && (
        <div className="collection-empty">
          <Search size={28} />
          <h2>
            {incidents.length
              ? "Sin coincidencias"
              : "Aún no hay actividad en esta zona"}
          </h2>
          <p>
            {incidents.length
              ? "Prueba otro texto o estado de confirmación."
              : "Consulta otro lugar o revisa el historial de la ciudad."}
          </p>
        </div>
      )}
    </section>
  );
}
