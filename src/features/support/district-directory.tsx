"use client";
import { useState } from "react";
import { Phone, ExternalLink } from "lucide-react";
import { Select, Notice } from "@/components/ui";
import { useResource } from "@/lib/use-resource";
import { SUPPORT_CITIES, type SupportDistrict } from "./contracts";
import styles from "./directory.module.css";
export function DistrictDirectory({
  onCityChange,
}: {
  onCityChange?: (city: keyof typeof SUPPORT_CITIES) => void;
}): React.JSX.Element {
  const [city, setCity] = useState<keyof typeof SUPPORT_CITIES>("lima");
  const [district, setDistrict] = useState("Lima");
  const directory = useResource<{ items: SupportDistrict[] }>(
    `support/directory?city=${city}`,
  );
  const selected = directory.data?.items.find(
    (item) => item.district === district,
  );
  return (
    <section className={`panel ${styles.directory}`}>
      <header>
        <span className="eyebrow">AYUDA POR DISTRITO</span>
        <h2>Ten a mano el contacto correcto</h2>
        <p className="muted small">
          Líneas nacionales y contactos distritales publicados por las
          entidades. Selecciona dónde necesitas ayuda.
        </p>
      </header>
      <div className="two-columns">
        <Select
          label="Ciudad"
          value={city}
          onChange={(e) => {
            const next = e.target.value as keyof typeof SUPPORT_CITIES;
            setCity(next);
            setDistrict(next === "lima" ? "Lima" : SUPPORT_CITIES[next].label);
            onCityChange?.(next);
          }}
        >
          {Object.entries(SUPPORT_CITIES).map(([id, c]) => (
            <option key={id} value={id}>
              {c.label}
            </option>
          ))}
        </Select>
        <Select
          label="Distrito"
          value={directory.data ? district : ""}
          disabled={directory.loading || !!directory.error}
          onChange={(e) => setDistrict(e.target.value)}
        >
          {!directory.data && <option value="">Cargando distritos…</option>}
          {directory.data?.items.map((d) => (
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
                <div>
                  <span className={styles.scope}>
                    {contact.scope === "distrital"
                      ? selected.district
                      : "Línea nacional"}
                  </span>
                  <h3>{contact.label}</h3>
                </div>
                <a className={styles.phone} href={`tel:${contact.phone}`}>
                  <Phone size={16} />
                  {contact.phone}
                </a>
                <a
                  className={styles.source}
                  href={contact.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fuente institucional <ExternalLink size={12} />
                </a>
              </article>
            ))}
          </div>
          {!selected.contacts.some((c) => c.scope === "distrital") && (
            <p className="muted small">
              Este distrito tiene disponibles las líneas nacionales. Su teléfono
              municipal todavía está pendiente de contraste con una fuente
              vigente.
            </p>
          )}
          <p className="muted small">
            Consulta de fuentes: {selected.contacts[0]?.reviewed_at}. La
            disponibilidad depende de cada servicio. Harkai no envía avisos ni
            realiza llamadas automáticamente.
          </p>
        </>
      )}
      {!directory.loading && !directory.error && !selected && (
        <Notice>No hay una ficha disponible para este distrito.</Notice>
      )}
    </section>
  );
}
