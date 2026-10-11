"use client";
import Link from "next/link";
import { useState } from "react";
import { MessageCircle, RefreshCw, ArrowUpRight } from "lucide-react";
import { useArea } from "@/lib/use-area";
import { useAuth } from "@/lib/auth";
import { LIMA } from "@/lib/contracts";
import { Heading, Notice, Select } from "@/components/ui";
import { LocationControl } from "../map/location-control";
import { ForumCompose } from "./forum-compose";
import { ForumCard } from "./forum-card";
import { useForum } from "./use-forum";
import styles from "./forum.module.css";

export function CommunityForum(): React.JSX.Element {
  const [area, setArea] = useArea(LIMA);
  const [city, setCity] = useState(false);
  const [districtFilter, setDistrictFilter] = useState("");
  const { user } = useAuth();
  const district =
    area.districts?.find((item) => item.id === area.ubigeo)?.name ||
    area.geography?.name ||
    "tu distrito";
  const province = area.geography?.province || "tu ciudad";
  const selectedFilter = area.districts?.some(
    (item) => item.id === districtFilter,
  )
    ? districtFilter
    : "";
  const id = city && selectedFilter ? selectedFilter : area.ubigeo;
  const path =
    area.geoPending || area.geoError || !id
      ? null
      : `forum?ubigeo=${id}&scope=${city && !selectedFilter ? "city" : "district"}`;
  return (
    <>
      <Heading eyebrow="COMUNIDAD" title="Conversa con tus vecinos.">
        Preguntas, novedades y conversaciones de tu zona. Todos participamos
        como vecinos anónimos.
      </Heading>
      <div className={styles.toolbar}>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Zona de las conversaciones"
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const next =
              event.key === "Home" ? false : event.key === "End" ? true : !city;
            setCity(next);
            document
              .getElementById(next ? "forum-city-tab" : "forum-district-tab")
              ?.focus();
          }}
        >
          <button
            id="forum-district-tab"
            role="tab"
            aria-selected={!city}
            tabIndex={city ? -1 : 0}
            aria-controls="forum-panel"
            onClick={() => setCity(false)}
          >
            Mi distrito · {district}
          </button>
          <button
            id="forum-city-tab"
            role="tab"
            aria-selected={city}
            tabIndex={city ? 0 : -1}
            aria-controls="forum-panel"
            onClick={() => setCity(true)}
          >
            Mi ciudad · {province}
          </button>
        </div>
        <Link href="/dashboard/incidents/reports">
          Ver alertas vecinales <ArrowUpRight size={14} />
        </Link>
      </div>
      <section
        id="forum-panel"
        role="tabpanel"
        aria-labelledby={city ? "forum-city-tab" : "forum-district-tab"}
      >
        <div className={styles.zone}>
          <p>
            {city
              ? "Conoce lo que conversan otros distritos de tu ciudad."
              : `Esta es la conversación de ${district}.`}
          </p>
          {city && (
            <Select
              label="Filtrar por distrito"
              value={selectedFilter}
              onChange={(event) => setDistrictFilter(event.target.value)}
            >
              <option value="">Todos los distritos de {province}</option>
              {area.districts?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          )}
          <details>
            <summary>Cambiar mi zona</summary>
            <LocationControl
              point={area}
              onChange={(point) =>
                setArea({ ...area, ...point, scope: "district" })
              }
            />
          </details>
        </div>
        {area.geoError && <Notice error>{area.geoError}</Notice>}
        {area.geoPending ? (
          <Notice>Identificando tu distrito…</Notice>
        ) : (
          <ForumContent
            key={`${path}:${user?.id || "guest"}:${user?.role || ""}`}
            path={path}
            districtId={id || ""}
            district={
              area.districts?.find((item) => item.id === id)?.name || district
            }
          />
        )}
      </section>
    </>
  );
}
function ForumContent({
  path,
  districtId,
  district,
}: {
  path: string | null;
  districtId: string;
  district: string;
}): React.JSX.Element {
  const feed = useForum(path);
  return (
    <div className={styles.layout}>
      <ForumCompose
        districtId={districtId}
        district={district}
        onPublished={() => feed.reload()}
      />
      <div className={styles.feed}>
        <div className={styles.feedHeading}>
          <h2>Conversaciones de esta zona</h2>
          <button
            className="icon-button"
            aria-label="Actualizar conversaciones"
            disabled={feed.loading}
            onClick={() => void feed.reload()}
          >
            <RefreshCw size={16} />
          </button>
        </div>
        {feed.error && <Notice error>{feed.error}</Notice>}
        {feed.loading && <Notice>Cargando conversaciones…</Notice>}
        {!feed.loading && !feed.error && !feed.items.length && (
          <div className={styles.empty}>
            <MessageCircle size={26} />
            <h3>La conversación empieza contigo</h3>
            <p>Comparte algo útil o plantea una pregunta a tus vecinos.</p>
          </div>
        )}
        {feed.items.map((thread) => (
          <ForumCard
            key={thread.id}
            thread={thread}
            onRemoved={() => feed.reload()}
          />
        ))}
        {feed.cursor && (
          <button
            className="button secondary"
            disabled={feed.loading}
            onClick={() => void feed.reload(feed.cursor)}
          >
            Ver más conversaciones
          </button>
        )}
      </div>
    </div>
  );
}
