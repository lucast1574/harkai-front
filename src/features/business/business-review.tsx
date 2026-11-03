"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Page } from "@/lib/contracts";
import { Notice } from "@/components/ui";
import type { Business } from "./business-contract";
import {
  BusinessReviewCard,
  BusinessReviewResult,
} from "./business-review-card";
import styles from "./business-review.module.css";

type Decision = "approved" | "rejected";
const filters = [
  { id: "pending", label: "Pendientes" },
  { id: "approved", label: "Aprobados" },
  { id: "rejected", label: "Rechazados" },
] as const;

export function BusinessReview({
  embedded = false,
}: {
  embedded?: boolean;
}): React.JSX.Element {
  const { user } = useAuth();
  const [items, setItems] = useState<Business[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<{ id: string; status: Decision } | null>(
    null,
  );
  const [cursor, setCursor] = useState("");
  const [filter, setFilter] = useState<string>("pending");
  const [result, setResult] = useState<Business | null>(null);
  const lock = useRef(false);
  const tabs = useRef<HTMLDivElement>(null);
  const load = useCallback(async (next = ""): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const page = await api<Page<Business>>(
        `admin/businesses?limit=50${next ? `&cursor=${encodeURIComponent(next)}` : ""}`,
      );
      setItems((old) =>
        next
          ? [
              ...new Map(
                [...old, ...page.items].map((item) => [item.id, item]),
              ).values(),
            ]
          : page.items,
      );
      setCursor(page.next_cursor || "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (user?.role === "admin") void load();
  }, [user?.role, load]);
  async function review(point: Business, status: Decision): Promise<void> {
    if (lock.current || loading || point.moderation === status) return;
    lock.current = true;
    setBusy({ id: point.id, status });
    setError("");
    try {
      const updated = await api<Business>(
        `admin/businesses/${point.id}/moderation`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      setItems((old) =>
        old.map((item) => (item.id === updated.id ? updated : item)),
      );
      setFilter(updated.moderation);
      setResult(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(null);
    }
  }
  if (user?.role !== "admin")
    return <Notice>Esta sección es para administración.</Notice>;
  const visible = items.filter((item) =>
    filter === "pending"
      ? !["approved", "rejected"].includes(item.moderation)
      : item.moderation === filter,
  );
  return (
    <section className={embedded ? undefined : "publication"}>
      {embedded ? (
        <h2>Negocios de la comunidad</h2>
      ) : (
        <h1>Negocios de la comunidad</h1>
      )}
      <p className="muted">
        Revisa cada solicitud. Los lugares aprobados quedan organizados en su
        propia sección.
      </p>
      <div
        ref={tabs}
        className={styles.filters}
        role="group"
        aria-label="Estado de los negocios"
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            disabled={!!busy}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error && (
        <Notice error>
          {error}{" "}
          <button
            className="text-button"
            disabled={loading || !!busy}
            onClick={() => void load()}
          >
            Actualizar lista
          </button>
        </Notice>
      )}
      {loading && <p role="status">Cargando negocios…</p>}
      <div className={styles.grid} aria-busy={!!busy || loading}>
        {visible.map((point) => (
          <BusinessReviewCard
            key={point.id}
            point={point}
            busy={busy?.id === point.id ? busy.status : undefined}
            disabled={!!busy || loading}
            onReview={(status) => void review(point, status)}
          />
        ))}
      </div>
      {!loading && !error && !visible.length && (
        <div className={styles.empty}>
          <h3>
            No hay negocios{" "}
            {filters.find((item) => item.id === filter)?.label.toLowerCase()} en
            esta lista.
          </h3>
          <p>
            {cursor
              ? "Carga más negocios para revisar los siguientes resultados."
              : "Las solicitudes aparecerán aquí según su estado."}
          </p>
        </div>
      )}
      {cursor && (
        <button
          className="button secondary"
          disabled={loading || !!busy}
          onClick={() => void load(cursor)}
        >
          Cargar más negocios
        </button>
      )}
      {result && (
        <BusinessReviewResult
          point={result}
          onClose={() => {
            setResult(null);
            tabs.current
              ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
              ?.focus();
          }}
        />
      )}
    </section>
  );
}
