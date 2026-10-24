"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Page } from "@/lib/contracts";
import { Notice } from "@/components/ui";
type Point = {
  id: string;
  name: string;
  description: string;
  kind: string;
  subtype?: string;
  address: string;
  district: string;
  city: string;
  moderation: string;
  billing_status: string;
  media_id?: string;
  enabled: boolean;
  paid_until?: string;
};
export function BusinessReview(): React.JSX.Element {
  const { user } = useAuth();
  const [items, setItems] = useState<Point[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [cursor, setCursor] = useState("");
  const load = useCallback(async (next = ""): Promise<void> => {
    try {
      const page = await api<Page<Point>>(
        `admin/businesses?limit=50${next ? `&cursor=${next}` : ""}`,
      );
      setItems((old) => (next ? [...old, ...page.items] : page.items));
      setCursor(page.next_cursor || "");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    if (user?.role === "admin") void load();
  }, [user?.role, load]);
  async function review(id: string, status: string): Promise<void> {
    setBusy(id);
    setError("");
    try {
      await api(`admin/businesses/${id}/moderation`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  if (user?.role !== "admin")
    return <Notice>Esta sección es para administración.</Notice>;
  return (
    <section className="publication">
      <p className="eyebrow">Administración</p>
      <h1>Negocios de la comunidad</h1>
      <p>
        Revisa la descripción, ubicación y foto. Aprobar un negocio permite
        publicarlo únicamente cuando tenga un pago vigente. Stripe sigue
        pendiente de habilitar.
      </p>
      {error && <Notice error>{error}</Notice>}
      {items.map((p) => (
        <article
          className="panel"
          key={p.id}
          style={{ padding: 24, marginTop: 20 }}
        >
          <h2>{p.name}</h2>
          <p>
            {p.kind}
            {p.subtype ? ` · ${p.subtype}` : ""}
          </p>
          <p>{p.description}</p>
          <p>{[p.address, p.district, p.city].filter(Boolean).join(", ")}</p>
          {p.media_id && (
            <Image
              unoptimized
              width={600}
              height={400}
              src={`/api/backend/media/${p.media_id}`}
              alt={`Foto de ${p.name}`}
              style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 16 }}
            />
          )}
          <p>
            Revisión: {p.moderation} · Pago: {p.billing_status} ·{" "}
            {p.enabled ? "Habilitado" : "Pausado"}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="button"
              disabled={!!busy}
              onClick={() => void review(p.id, "approved")}
            >
              Aprobar
            </button>
            <button
              className="button secondary"
              disabled={!!busy}
              onClick={() => void review(p.id, "rejected")}
            >
              Rechazar
            </button>
          </div>
        </article>
      ))}
      {!items.length && !error && <p>No hay negocios registrados.</p>}
      {cursor && (
        <button className="button" onClick={() => void load(cursor)}>
          Ver más
        </button>
      )}
    </section>
  );
}
