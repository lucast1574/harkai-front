"use client";
import { incidentColor } from "@/lib/incident-density";
import { reportFilterCategories } from "@/lib/report-categories";
import { useState } from "react";
import {
  History,
  Layers3,
  CalendarDays,
  LocateFixed,
  RefreshCw,
  Flame,
} from "lucide-react";
import { useArea, rememberUserLocation } from "@/lib/use-area";
import { Notice, Field, Select } from "@/components/ui";
import { useResource } from "@/lib/use-resource";
import { LIMA, type Meta } from "@/lib/contracts";
import { SUPPORT_CITIES } from "../support/contracts";
import { useLocationRequest } from "../map/use-location-request";
import { useReports } from "../reports/use-reports";
import { Summary } from "../stats/summary";
import { ReportCollection } from "../reports/report-collection";
import ZoneMap from "../map/map-loader";

function daysAgoISO(days: number): string {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00`;
}

export function ArchiveExplorer(): React.JSX.Element {
  const [area, setArea] = useArea({
    ...LIMA,
    radius: 50000,
    district: "",
    before: "",
  });
  const [heat, setHeat] = useState(true);
  const [preset, setPreset] = useState<"all" | "7d" | "30d" | "90d" | "custom">(
    "all",
  );
  const { data: meta, error: metaError } = useResource<Meta>("meta");
  const categories = meta?.categories || [];
  const reports = useReports(area, "archive/incidents");

  const locate = useLocationRequest((next) => {
    rememberUserLocation(next);
    setArea({
      ...area,
      latitude: next.latitude,
      longitude: next.longitude,
      ubigeo: "",
      district: "",
    });
  });

  const province = area.geography?.province || "Lima";
  const isTrujillo = province.toLowerCase().includes("trujillo");

  function selectCity(target: "lima" | "trujillo"): void {
    const coords = SUPPORT_CITIES[target];
    setArea({
      ...area,
      latitude: coords.latitude,
      longitude: coords.longitude,
      ubigeo: "",
      district: "",
      scope: "city",
    });
  }

  function applyPreset(next: "all" | "7d" | "30d" | "90d"): void {
    setPreset(next);
    if (next === "all") {
      setArea({ ...area, after: "", before: "" });
    } else {
      const days = next === "7d" ? 7 : next === "30d" ? 30 : 90;
      setArea({ ...area, after: daysAgoISO(days), before: "" });
    }
  }

  return (
    <div className="archive-shell">
      <header className="account-hero">
        <div className="account-hero-copy">
          <div className="account-badge">
            <History size={14} />
            <span>MEMORIA DE LA CIUDAD</span>
          </div>
          <h1>Historial y perspectiva</h1>
          <p>
            Explora los reportes resueltos o con alerta vencida por ciudad,
            distrito, categoría y periodo.
          </p>
        </div>
        <div className="archive-hero-actions">
          <div
            className="city-switcher"
            role="group"
            aria-label="Ciudad activa"
          >
            <button
              type="button"
              className={`city-pill ${!isTrujillo ? "active" : ""}`}
              onClick={() => selectCity("lima")}
            >
              Lima
            </button>
            <button
              type="button"
              className={`city-pill ${isTrujillo ? "active" : ""}`}
              onClick={() => selectCity("trujillo")}
            >
              Trujillo
            </button>
          </div>
          <button
            type="button"
            className="account-map-pill"
            disabled={locate.busy || area.geoPending}
            onClick={() => void locate.find()}
          >
            <LocateFixed size={15} />
            <span>{locate.busy ? "Ubicando…" : "Mi ubicación"}</span>
          </button>
          <button
            type="button"
            className="account-map-pill"
            disabled={reports.loading}
            onClick={() => void reports.reload()}
          >
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </header>

      <div className="archive-layout">
        <aside className="panel archive-filters">
          <div className="archive-filter-section">
            <div className="archive-filter-title">
              <Layers3 size={17} />
              <h2>Zona y categoría</h2>
            </div>

            <div
              className="archive-scope-pills"
              role="group"
              aria-label="Alcance de consulta"
            >
              <button
                type="button"
                className={area.scope !== "city" ? "active" : ""}
                onClick={() =>
                  setArea({ ...area, scope: "district", district: "" })
                }
              >
                Por distrito
              </button>
              <button
                type="button"
                className={area.scope === "city" ? "active" : ""}
                onClick={() =>
                  setArea({ ...area, scope: "city", district: "" })
                }
              >
                Toda {province}
              </button>
            </div>

            <Select
              label="Distrito"
              value={area.ubigeo || ""}
              disabled={area.geoPending || !!area.geoError}
              onChange={(e) =>
                setArea({
                  ...area,
                  ubigeo: e.target.value,
                  scope: "district",
                  district: "",
                })
              }
            >
              {!area.ubigeo && (
                <option value="">
                  {area.geoPending ? "Buscando…" : "Sin distrito"}
                </option>
              )}
              {area.districts?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>

            <Select
              label="Categoría"
              value={area.type}
              onChange={(e) => setArea({ ...area, type: e.target.value })}
            >
              <option value="">Todas las categorías</option>
              {reportFilterCategories(categories).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="archive-filter-section">
            <div className="archive-filter-title">
              <CalendarDays size={17} />
              <h2>Periodo de consulta</h2>
            </div>

            <div
              className="archive-preset-grid"
              role="group"
              aria-label="Periodo rápido"
            >
              {(
                [
                  ["all", "Todo"],
                  ["7d", "7 días"],
                  ["30d", "30 días"],
                  ["90d", "90 días"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`archive-preset-btn ${preset === id ? "active" : ""}`}
                  onClick={() => applyPreset(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <details
              className="archive-custom-dates"
              open={preset === "custom" ? true : undefined}
            >
              <summary>Rango de fechas específico</summary>
              <div className="archive-date-fields">
                <Field
                  label="Desde"
                  type="datetime-local"
                  value={area.after}
                  onChange={(e) => {
                    setPreset("custom");
                    setArea({ ...area, after: e.target.value });
                  }}
                />
                <Field
                  label="Hasta"
                  type="datetime-local"
                  value={area.before || ""}
                  onChange={(e) => {
                    setPreset("custom");
                    setArea({ ...area, before: e.target.value });
                  }}
                />
              </div>
            </details>
          </div>
        </aside>

        <div className="archive-overview">
          {(metaError || reports.error || area.geoError || locate.error) && (
            <Notice error>
              {metaError || reports.error || area.geoError || locate.error}
            </Notice>
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
                  {reports.items.length} reportes en la muestra
                  {reports.cursor ? " · muestra parcial" : ""}
                </p>
              </div>
              <button
                type="button"
                aria-pressed={heat}
                className={`archive-heat-toggle ${heat ? "active" : ""}`}
                onClick={() => setHeat(!heat)}
              >
                <Flame size={14} />
                <span>
                  {heat ? "Concentración activa" : "Ver concentración"}
                </span>
              </button>
            </div>
            <ZoneMap
              area={area}
              incidents={reports.items}
              categories={categories}
              heat={heat}
              scrollWheelZoom={false}
            />
            <footer className="archive-map-footer">
              {heat && reports.items.length > 0 && (
                <div
                  className="archive-heat-legend"
                  aria-label="Colores por tipo de reporte"
                >
                  {[...new Set(reports.items.map((i) => i.type))].map(
                    (type) => (
                      <span key={type}>
                        <i
                          style={{ backgroundColor: incidentColor(type) }}
                          aria-hidden="true"
                        />
                        {categories.find((c) => c.id === type)?.label || type}
                      </span>
                    ),
                  )}
                  <small>Más intensidad y tamaño = más reportes cercanos</small>
                </div>
              )}
              <p className="map-note">
                La concentración representa aportes de la comunidad, no una tasa
                oficial de criminalidad. Selecciona un punto para abrir el
                reporte.
              </p>
            </footer>
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
        <div className="archive-more">
          <button
            type="button"
            className="button secondary"
            disabled={reports.loading}
            onClick={() => void reports.more()}
          >
            Ampliar la muestra · cargar más
          </button>
        </div>
      )}
    </div>
  );
}
