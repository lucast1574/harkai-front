"use client";
import { Phone, ExternalLink, MapPin } from "lucide-react";
import { Notice } from "@/components/ui";
import { LIMA } from "@/lib/contracts";
import { useArea } from "@/lib/use-area";
import { useResource } from "@/lib/use-resource";
import { type SupportDistrict } from "./contracts";
import { GeographySelector } from "../map/geography-selector";
import styles from "./directory.module.css";

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function DistrictDirectory(): React.JSX.Element {
  const [area, setArea] = useArea(LIMA);
  const province = (area.ubigeo || "").slice(0, 4);
  const city = ["1501", "0701"].includes(province)
    ? "lima"
    : province === "1301"
      ? "trujillo"
      : province;
  const directory = useResource<{ items: SupportDistrict[] }>(
    city ? `support/directory?city=${city}` : null,
  );
  const name = area.districts?.find((d) => d.id === area.ubigeo)?.name || "";
  const selected = directory.data?.items.find(
    (item) =>
      item.district_id === area.ubigeo ||
      normalizeName(item.district) === normalizeName(name),
  );
  return (
    <section className={`panel ${styles.directory}`}>
      <header className={styles.header}>
        <div>
          <span className="eyebrow">DIRECTORIO OFICIAL</span>
          <h2>Líneas de emergencia por distrito</h2>
          <p className="muted small">
            Líneas nacionales en todo el Perú y contactos municipales donde
            están verificados.
          </p>
        </div>
      </header>
      <GeographySelector area={area} onChange={setArea} />
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
