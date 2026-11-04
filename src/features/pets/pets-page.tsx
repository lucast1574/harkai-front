"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  LocateFixed,
  MapPin,
  PawPrint,
  RefreshCw,
  Search,
  Smartphone,
} from "lucide-react";
import { Field, Notice, Select } from "@/components/ui";
import { LIMA } from "@/lib/contracts";
import { rememberUserLocation, useArea } from "@/lib/use-area";
import { useLocationRequest } from "../map/use-location-request";
import { DistrictOptions } from "../map/district-search";
import { useReports } from "../reports/use-reports";
import { PetCard } from "./pet-card";
import { petResults, type PetFilter, type PetSort } from "./pet-results";
import styles from "./pets.module.css";

const filters: { id: PetFilter; label: string }[] = [
  { id: "all", label: "Todos los avisos" },
  { id: "photo", label: "Con foto" },
  { id: "contact", label: "Con contacto" },
];

export function PetsPage(): React.JSX.Element {
  const [area, setArea] = useArea({ ...LIMA, type: "pet", radius: 2000 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PetFilter>("all");
  const [sort, setSort] = useState<PetSort>("nearby");
  // A circular query deliberately includes neighboring districts.
  const reports = useReports(
    { ...area, ubigeo: undefined, district: undefined, type: "pet" },
    "archive/incidents",
  );
  const locate = useLocationRequest((point) => {
    rememberUserLocation(point);
    setArea({ ...area, ...point, ubigeo: "", scope: "district" });
  });
  const items = petResults(reports.items, {
    origin: area,
    radius: area.radius,
    search,
    filter,
    sort,
  });
  const error = reports.error || locate.error;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            <PawPrint size={15} aria-hidden="true" /> MASCOTAS DE LA COMUNIDAD
          </span>
          <h1>Mascotas</h1>
          <p>Ayuda a que una mascota vuelva a casa.</p>
        </div>
        <Link href="/dashboard/report" className="button">
          <Smartphone size={17} aria-hidden="true" /> Publicar desde la app{" "}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>

      <div className={styles.zoneBar}>
        <div>
          <MapPin size={17} aria-hidden="true" />
          <span>
            {area.geoPending
              ? "Identificando tu zona…"
              : area.geography?.name || "Zona de consulta"}
            <small>Incluye distritos vecinos dentro del radio elegido.</small>
          </span>
        </div>
        <button
          type="button"
          className="button secondary"
          disabled={locate.busy}
          onClick={() => void locate.find()}
        >
          <LocateFixed size={16} aria-hidden="true" />
          {locate.busy ? "Ubicando…" : "Mi ubicación"}
        </button>
      </div>

      <details className={styles.zone}>
        <summary>Cambiar zona de búsqueda</summary>
        <div>
          <DistrictOptions area={area} onChange={setArea} />
          <p className="small muted">
            El distrito elegido define el centro de búsqueda. También se
            incluyen avisos de distritos vecinos dentro del radio.
          </p>
        </div>
      </details>

      <div className={styles.toolbar}>
        <Field
          label="Buscar una mascota"
          type="search"
          placeholder="Perro, gato, rasgos o zona…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          label="Radio de búsqueda"
          value={String(area.radius)}
          onChange={(event) =>
            setArea({ ...area, radius: Number(event.target.value) })
          }
        >
          <option value="2000">2 km a la redonda</option>
          <option value="5000">5 km a la redonda</option>
          <option value="10000">10 km a la redonda</option>
        </Select>
        <Select
          label="Ordenar por"
          value={sort}
          onChange={(event) => setSort(event.target.value as PetSort)}
        >
          <option value="nearby">Más cercanas</option>
          <option value="recent">Más recientes</option>
        </Select>
      </div>

      <div className={styles.resultsBar}>
        <div
          className={styles.filters}
          role="group"
          aria-label="Filtrar avisos de mascotas"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          className={styles.refresh}
          type="button"
          disabled={reports.loading}
          onClick={() => void reports.reload()}
        >
          <RefreshCw size={14} aria-hidden="true" /> Actualizar
        </button>
      </div>

      {error && (
        <Notice error>
          {error}
          {reports.error && (
            <button
              type="button"
              className="text-button"
              onClick={() => void reports.reload()}
            >
              Reintentar
            </button>
          )}
        </Notice>
      )}

      <div className={styles.resultCount} role="status">
        {reports.error
          ? "No pudimos actualizar los avisos."
          : reports.loading
            ? "Buscando mascotas en esta zona…"
            : `${items.length} ${items.length === 1 ? "aviso" : "avisos"} ${reports.cursor ? "cargados" : "en esta búsqueda"}`}
        <span>Distancias aproximadas desde el punto de consulta.</span>
      </div>

      <div
        className={styles.grid}
        aria-label="Avisos de mascotas"
        aria-busy={reports.loading}
      >
        {items.map(({ incident, meters }) => (
          <PetCard key={incident.id} incident={incident} meters={meters} />
        ))}
        {reports.loading &&
          !items.length &&
          [0, 1, 2].map((index) => (
            <div className={styles.loadingCard} key={index} aria-hidden="true">
              <div />
              <span />
              <span />
            </div>
          ))}
      </div>

      {!reports.loading && !reports.error && !items.length && (
        <div className={styles.empty}>
          {search || filter !== "all" ? (
            <Search size={32} strokeWidth={1.4} aria-hidden="true" />
          ) : (
            <PawPrint size={38} strokeWidth={1.3} aria-hidden="true" />
          )}
          <h2>
            {search || filter !== "all"
              ? "No encontramos coincidencias"
              : "Aún no hay avisos de mascotas aquí"}
          </h2>
          <p>
            {search || filter !== "all"
              ? "Prueba otros rasgos o revisa todos los avisos de esta zona."
              : "Puedes ampliar el radio o cambiar de zona para buscar más lejos."}
          </p>
          {(search || filter !== "all") && (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {reports.cursor && (
        <button
          type="button"
          className="button secondary"
          disabled={reports.loading}
          onClick={() => void reports.more()}
        >
          {reports.loading ? "Cargando…" : "Cargar más avisos"}
        </button>
      )}

      <footer className={styles.help}>
        <PawPrint size={22} strokeWidth={1.5} aria-hidden="true" />
        <div>
          <h2>Un detalle puede ayudar a reencontrarse</h2>
          <p>
            Revisa la foto y la zona. Si reconoces a una mascota, abre el caso
            para comentar o consultar el contacto compartido.
          </p>
        </div>
      </footer>
    </section>
  );
}
