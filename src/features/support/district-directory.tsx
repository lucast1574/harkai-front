"use client";
import { useState } from "react";
import { Phone, ExternalLink, MapPin } from "lucide-react";
import { Select, Notice } from "@/components/ui";
import { LIMA } from "@/lib/contracts";
import { useArea } from "@/lib/use-area";
import { useResource } from "@/lib/use-resource";
import { SUPPORT_CITIES, type SupportDistrict } from "./contracts";
import styles from "./directory.module.css";

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function DistrictDirectory({
  onCityChange,
}: {
  onCityChange?: (city: keyof typeof SUPPORT_CITIES) => void;
}): React.JSX.Element {
  const [area] = useArea(LIMA);
  const detectedCity: keyof typeof SUPPORT_CITIES =
    area.geography?.province &&
    normalizeName(area.geography.province).includes("trujillo")
      ? "trujillo"
      : "lima";

  const [manualCity, setManualCity] = useState<
    keyof typeof SUPPORT_CITIES | null
  >(null);
  const [manualDistrict, setManualDistrict] = useState<string | null>(null);

  const city = manualCity ?? detectedCity;
  const directory = useResource<{ items: SupportDistrict[] }>(
    `support/directory?city=${city}`,
  );

  const items = directory.data?.items || [];
  const detectedDistrictMatch =
    !manualCity && area.geography?.name
      ? items.find(
          (item) =>
            normalizeName(item.district) ===
            normalizeName(area.geography?.name || ""),
        )?.district
      : undefined;

  const activeDistrict =
    (manualDistrict && items.some((d) => d.district === manualDistrict)
      ? manualDistrict
      : undefined) ||
    detectedDistrictMatch ||
    items[0]?.district ||
    (city === "lima" ? "Lima" : "Trujillo");

  const selected = items.find((item) => item.district === activeDistrict);

  return (
    <section className={`panel ${styles.directory}`}>
      <header className={styles.header}>
        <div>
          <span className="eyebrow">DIRECTORIO OFICIAL</span>
          <h2>Líneas de emergencia por distrito</h2>
          <p className="muted small">
            Contactos municipales y líneas nacionales verificadas.
          </p>
        </div>
        <div className="city-switcher" role="group" aria-label="Ciudad del directorio">
          {(
            Object.entries(SUPPORT_CITIES) as [
              keyof typeof SUPPORT_CITIES,
              (typeof SUPPORT_CITIES)["lima"],
            ][]
          ).map(([id, c]) => (
            <button
              key={id}
              type="button"
              className={`city-pill ${city === id ? "active" : ""}`}
              onClick={() => {
                setManualCity(id);
                setManualDistrict(null);
                onCityChange?.(id);
              }}
            >
              {id === "lima" ? "Lima" : c.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.selectorRow}>
        <Select
          label="Distrito de consulta"
          value={directory.data ? activeDistrict : ""}
          disabled={directory.loading || !!directory.error}
          onChange={(e) => setManualDistrict(e.target.value)}
        >
          {!directory.data && <option value="">Cargando distritos…</option>}
          {items.map((d) => (
            <option key={d.district} value={d.district}>
              {d.district}
            </option>
          ))}
        </Select>
      </div>

      {directory.loading && <Notice>Consultando el directorio…</Notice>}
      {directory.error && (
        <Notice error>
          {directory.error}{" "}
          <button
            className="text-button"
            onClick={() => void directory.reload()}
          >
            Reintentar
          </button>
        </Notice>
      )}
      {selected && (
        <>
          <div className={styles.contacts}>
            {selected.contacts.map((contact) => (
              <article key={`${contact.label}:${contact.phone}`}>
                <div className={styles.contactMeta}>
                  <span
                    className={`${styles.scope} ${contact.scope === "distrital" ? styles.scopeDistrict : ""}`}
                  >
                    <MapPin size={11} />
                    {contact.scope === "distrital"
                      ? selected.district
                      : "Línea nacional"}
                  </span>
                  <h3>{contact.label}</h3>
                </div>
                <div className={styles.contactActions}>
                  <a className={styles.phone} href={`tel:${contact.phone}`}>
                    <Phone size={15} />
                    {contact.phone}
                  </a>
                  <a
                    className={styles.source}
                    href={contact.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fuente <ExternalLink size={11} />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="muted small">
            Fuentes revisadas: {selected.contacts[0]?.reviewed_at}. Harkai no
            realiza llamadas automáticas.
          </p>
        </>
      )}
      {!directory.loading && !directory.error && !selected && (
        <Notice>No hay una ficha disponible para este distrito.</Notice>
      )}
    </section>
  );
}
