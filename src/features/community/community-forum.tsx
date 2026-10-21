"use client";
import Link from "next/link";
import { useState } from "react";
import {
  MessageCircle,
  RefreshCw,
  ArrowUpRight,
  LocateFixed,
  MapPin,
} from "lucide-react";
import { useArea, rememberUserLocation } from "@/lib/use-area";
import { useAuth } from "@/lib/auth";
import { LIMA } from "@/lib/contracts";
import { Notice } from "@/components/ui";
import { SUPPORT_CITIES } from "../support/contracts";
import { useLocationRequest } from "../map/use-location-request";
import { ForumCompose } from "./forum-compose";
import { ForumCard } from "./forum-card";
import { useForum } from "./use-forum";
import styles from "./forum.module.css";

export function CommunityForum(): React.JSX.Element {
  const [area, setArea] = useArea(LIMA);
  const [city, setCity] = useState(false);
  const [districtFilter, setDistrictFilter] = useState("");
  const { user } = useAuth();

  const locate = useLocationRequest((next) => {
    rememberUserLocation(next);
    setDistrictFilter("");
    setArea({
      ...area,
      latitude: next.latitude,
      longitude: next.longitude,
      ubigeo: "",
      scope: "district",
    });
  });

  const district =
    area.districts?.find((item) => item.id === area.ubigeo)?.name ||
    area.geography?.name ||
    "tu distrito";
  const province = area.geography?.province || "Lima";
  const isTrujillo = province.toLowerCase().includes("trujillo");

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

  function selectCity(target: "lima" | "trujillo"): void {
    const coords = SUPPORT_CITIES[target];
    setDistrictFilter("");
    setArea({
      ...area,
      latitude: coords.latitude,
      longitude: coords.longitude,
      ubigeo: "",
      scope: "district",
    });
  }

  return (
    <div className={styles.shell}>
      <header className="account-hero">
        <div className="account-hero-copy">
          <div className="account-badge">
            <MessageCircle size={14} />
            <span>COMUNIDAD VECINAL</span>
          </div>
          <h1>Conversa con tus vecinos</h1>
          <p>
            Preguntas, avisos y novedades útiles de tu zona. Todos participamos
            de forma anónima para cuidar la privacidad del barrio.
          </p>
        </div>
        <div className={styles.heroActions}>
          <div className="city-switcher" role="group" aria-label="Ciudad activa">
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
          <Link href="/dashboard/incidents/reports" className="account-map-pill">
            <span>Alertas vecinales</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>

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
            type="button"
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
            type="button"
            role="tab"
            aria-selected={city}
            tabIndex={city ? 0 : -1}
            aria-controls="forum-panel"
            onClick={() => setCity(true)}
          >
            Toda la ciudad · {province}
          </button>
        </div>

        <div className={styles.districtPicker}>
          <MapPin size={15} />
          <select
            aria-label={city ? "Filtrar por distrito" : "Cambiar distrito"}
            value={city ? selectedFilter : area.ubigeo || ""}
            disabled={area.geoPending || !area.districts?.length}
            onChange={(event) => {
              const nextId = event.target.value;
              if (city) {
                setDistrictFilter(nextId);
              } else {
                setArea({ ...area, ubigeo: nextId, scope: "district" });
              }
            }}
          >
            {city && (
              <option value="">Todos los distritos de {province}</option>
            )}
            {area.districts?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section
        id="forum-panel"
        role="tabpanel"
        aria-labelledby={city ? "forum-city-tab" : "forum-district-tab"}
      >
        {(area.geoError || locate.error) && (
          <Notice error>{area.geoError || locate.error}</Notice>
        )}
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
    </div>
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
          <div>
            <h2>Conversaciones en {district}</h2>
            <p className="muted small">
              Participa con respeto y sin compartir datos privados.
            </p>
          </div>
          <button
            type="button"
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
            <MessageCircle size={28} />
            <h3>La conversación empieza contigo</h3>
            <p>
              Comparte una novedad útil o plantea una pregunta a tus vecinos de{" "}
              {district}.
            </p>
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
            type="button"
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
