"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Plus, Store } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Page } from "@/lib/contracts";
import { Notice } from "@/components/ui";
import { AuthForm } from "@/features/account/auth-form";
import { BusinessEditor } from "./business-editor";
import { BusinessPayment } from "./business-payment";
import {
  businessKinds,
  businessStatus,
  type Business,
} from "./business-contract";

export function BusinessWorkspace(): React.JSX.Element {
  const { user, loading } = useAuth();
  return (
    <section className="business-workspace">
      <header className="business-heading">
        <div>
          <h1>Ponte en el mapa</h1>
          <p>Tu negocio, al alcance de quienes están cerca.</p>
        </div>
        <span className="business-price">US$5 por negocio · Pago único</span>
      </header>
      {loading ? (
        <Notice>Cargando tu sesión…</Notice>
      ) : !user ? (
        <>
          <p>
            Ingresa o crea tu cuenta para registrar tu negocio y administrar su
            presencia en Harkai.
          </p>
          <AuthForm redirectTo="/dashboard/my-businesses" />
        </>
      ) : (
        <BusinessManager key={user.id} />
      )}
    </section>
  );
}
function BusinessManager(): React.JSX.Element {
  const payment = useSearchParams().get("payment");
  const [items, setItems] = useState<Business[]>([]);
  const [cursor, setCursor] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Business | "new" | null>(null);
  const [saved, setSaved] = useState<Business | null>(null);
  const load = useCallback(async (next = ""): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const page = await api<Page<Business>>(
        `me/businesses?limit=50${next ? `&cursor=${encodeURIComponent(next)}` : ""}`,
      );
      setItems((old) => (next ? [...old, ...page.items] : page.items));
      setCursor(page.next_cursor || "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (payment !== "processing") return;
    const timer = window.setInterval(() => void load(), 3000);
    const stop = window.setTimeout(() => window.clearInterval(timer), 60000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [load, payment]);
  async function toggle(point: Business): Promise<void> {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api<Business>(`me/businesses/${point.id}/enabled`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !point.enabled }),
      });
      setItems((old) => old.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (editing)
    return (
      <BusinessEditor
        point={editing === "new" ? undefined : editing}
        onCancel={() => setEditing(null)}
        onSaved={(point) => {
          setItems((old) => [
            point,
            ...old.filter((item) => item.id !== point.id),
          ]);
          setError("");
          setSaved(point);
          setEditing(null);
        }}
      />
    );
  if (saved)
    return (
      <section className="business-success" role="status">
        <CheckCircle2 size={48} />
        <h2>Ya recibimos tu negocio</h2>
        <p>
          <strong>{saved.name}</strong> está en revisión.{" "}
          {saved.billing_status === "active"
            ? "Tu acceso se conserva y no necesitas volver a pagar."
            : "Cuando lo aprobemos, podrás activar su publicación con un pago único de US$5."}
        </p>
        <p>
          Con el pago confirmado, aparecerá en el mapa y podrá llegar a personas
          cercanas según sus permisos de ubicación y notificaciones.
        </p>
        <button className="button" onClick={() => setSaved(null)}>
          Ver mis negocios
        </button>
      </section>
    );
  return (
    <>
      <div className="business-list-heading">
        <h2>Mis negocios</h2>
        <button className="button" onClick={() => setEditing("new")}>
          <Plus size={18} />
          Añadir negocio
        </button>
      </div>
      {payment === "processing" &&
        items.some(
          (point) =>
            point.moderation === "approved" &&
            point.billing_status === "pending",
        ) && (
          <Notice>
            Estamos consultando la confirmación del pago. Tu negocio se activará
            cuando Stripe lo confirme.{" "}
            <button onClick={() => void load()}>Actualizar estado</button>
          </Notice>
        )}
      {payment === "canceled" && (
        <Notice>
          Volviste del formulario de pago. Puedes revisar el estado de tu
          negocio y retomar el pago si sigue pendiente.
        </Notice>
      )}
      {error && (
        <Notice error>
          {error} <button onClick={() => void load()}>Reintentar</button>
        </Notice>
      )}
      {loading && <p role="status">Cargando tus negocios…</p>}
      {!loading && !error && !items.length && (
        <section className="business-empty">
          <Store size={40} />
          <h2>El próximo vecino puede ser tu próximo cliente</h2>
          <p>
            Cuenta qué ofreces, marca tu ubicación y envía tu negocio a
            revisión. Puedes añadir una oferta para animar a quienes pasen
            cerca.
          </p>
          <button className="button" onClick={() => setEditing("new")}>
            Registrar mi negocio
          </button>
          <p className="muted">
            Pagas una sola vez, después de la aprobación. Tú controlas cuándo
            pausar tu presencia.
          </p>
        </section>
      )}
      <div className="business-list">
        {items.map((point) => (
          <article key={point.id}>
            <div>
              <span className="business-state">{businessStatus(point)}</span>
              <h3>{point.name}</h3>
              <p>
                {businessKinds[point.kind]}
                {point.address ? ` · ${point.address}` : ""}
              </p>
              {point.offer && <p>{point.offer}</p>}
              {point.moderation === "rejected" && (
                <p>
                  Revisa los datos, la ubicación y la oferta. Guarda los cambios
                  para solicitar una nueva revisión.
                </p>
              )}
            </div>
            <BusinessPayment point={point} onRefresh={() => void load()} />
            <div className="business-actions">
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => setEditing(point)}
              >
                Editar negocio
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => void toggle(point)}
              >
                {point.enabled ? "Pausar negocio" : "Habilitar negocio"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {cursor && (
        <button
          className="button secondary"
          disabled={loading}
          onClick={() => void load(cursor)}
        >
          Ver más negocios
        </button>
      )}
    </>
  );
}
