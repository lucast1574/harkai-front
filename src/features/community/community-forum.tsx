"use client";
import Link from "next/link";
import {
  MessageCircle,
  RefreshCw,
  ArrowUpRight,
  LocateFixed,
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
import { GeographySelector } from "../map/geography-selector";
import styles from "./forum.module.css";

export function CommunityForum(): React.JSX.Element {
  const [area, setArea] = useArea(LIMA);
  const { user } = useAuth();

  const locate = useLocationRequest((next) => {
    rememberUserLocation(next);
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

  const id = area.ubigeo;
  const path =
    area.geoPending || area.geoError || !id
      ? null
      : `forum?ubigeo=${id}&scope=${area.scope || "district"}`;

  function selectCity(target: "lima" | "trujillo"): void {
    const coords = SUPPORT_CITIES[target];
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
          <div
            className="city-switcher"
            role="group"
            aria-label="Ciudad activa"
          >
            <button
              type="button"
              className={`city-pill ${["Lima", "Callao"].includes(province) ? "active" : ""}`}
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
          <Link
            href="/dashboard/incidents/reports"
            className="account-map-pill"
          >
            <span>Alertas vecinales</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>

      <section className="panel">
        <GeographySelector area={area} onChange={setArea} quick={false} />
      </section>
      <section
        id="forum-panel"
        aria-label="Conversaciones de la zona seleccionada"
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
