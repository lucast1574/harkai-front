"use client";
import Link from "next/link";
import { districtChatPath } from "@/lib/district-chat";
import { useEffect, useRef, useState } from "react";
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
import { useLocationRequest } from "../map/use-location-request";
import { ForumCompose } from "./forum-compose";
import type { ForumThread } from "./forum-contracts";
import { ForumCard } from "./forum-card";
import { useForum } from "./use-forum";
import { DistrictSearch } from "../map/district-search";
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

  const id = area.ubigeo;
  const path =
    area.geoPending || area.geoError || !id
      ? null
      : `forum?ubigeo=${id}&scope=district`;

  return (
    <div className={styles.shell}>
      <header className="account-hero">
        <div className="account-hero-copy">
          <div className="account-badge">
            <MessageCircle size={14} />
            <span>COMUNIDAD VECINAL</span>
          </div>
          <h1>El chat de tu distrito</h1>
          <p>
            Un chat anónimo para cada distrito. Puedes leer cualquier zona,
            estés donde estés.
          </p>
        </div>
        <div className={styles.heroActions}>
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

      <DistrictSearch area={area} onChange={setArea} />
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
  const [replyTo, setReplyTo] = useState<ForumThread | null>(null);
  const [replyRevision, setReplyRevision] = useState(0);
  const messages = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  useEffect(() => {
    if (follow.current && messages.current)
      messages.current.scrollTop = messages.current.scrollHeight;
  }, [feed.items]);
  return (
    <div className={styles.layout}>
      <div
        className={styles.feed}
        ref={messages}
        tabIndex={0}
        aria-label={`Mensajes de ${district}`}
        onScroll={(event) => {
          const el = event.currentTarget;
          follow.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        }}
      >
        <div className={styles.feedHeading}>
          <div>
            <h2>{district}</h2>
            <p className="muted small">
              Chat del distrito · Tu nombre y foto no se muestran.
            </p>
          </div>
          <div className={styles.feedActions}>
            {feed.items.length > 0 && (
              <Link
                className={`button secondary ${styles.publicLink}`}
                href={districtChatPath(
                  districtId,
                  district,
                  feed.items[0].province,
                )}
              >
                Ver página pública <ArrowUpRight size={14} />
              </Link>
            )}
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
        </div>
        {feed.error && <Notice error>{feed.error}</Notice>}
        {feed.loading && <Notice>Cargando mensajes…</Notice>}
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
        {feed.cursor && (
          <button
            type="button"
            className="button secondary"
            disabled={feed.loading}
            onClick={() => void feed.reload(feed.cursor)}
          >
            Cargar mensajes anteriores
          </button>
        )}
        {[...feed.items]
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
          .map((thread) => (
            <ForumCard
              key={thread.id}
              thread={thread}
              onReply={setReplyTo}
              replyRevision={replyRevision}
              onRemoved={() => {
                setReplyTo(null);
                return feed.reload();
              }}
            />
          ))}
      </div>
      <ForumCompose
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onReplied={() => {
          setReplyRevision((n) => n + 1);
          setReplyTo(null);
        }}
        districtId={districtId}
        district={district}
        onPublished={() => {
          follow.current = true;
          return feed.reload();
        }}
      />
    </div>
  );
}
