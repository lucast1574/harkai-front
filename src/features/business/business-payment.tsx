"use client";
import { useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { Notice } from "@/components/ui";
import type { Business } from "./business-contract";

export function BusinessPayment({
  point,
  onRefresh,
}: {
  point: Business;
  onRefresh: () => void;
}): React.JSX.Element | null {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  if (point.billing_status === "active" || point.moderation !== "approved")
    return null;
  if (point.billing_status === "refunded")
    return (
      <p>Pago reembolsado. Contacta con soporte para revisar tu publicación.</p>
    );
  async function pay(): Promise<void> {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const session = await api<{ url: string; status: string }>(
        `me/businesses/${point.id}/checkout`,
        { method: "POST" },
      );
      if (session.status === "processing") {
        setProcessing(true);
        onRefresh();
        return;
      }
      const url = new URL(session.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
        throw new Error("No pudimos abrir el pago. Inténtalo de nuevo.");
      window.location.assign(url.href);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="business-payment">
      <strong>
        {processing
          ? "Estamos confirmando tu pago"
          : "Tu negocio está aprobado"}
      </strong>
      <p>
        {processing
          ? "La confirmación puede tardar unos momentos. Tu negocio se activará cuando recibamos el pago."
          : "Activa su publicación con un pago único de US$5. Sin suscripción ni renovación automática."}
      </p>
      {error && <Notice error>{error}</Notice>}
      {processing ? (
        <button className="button secondary" onClick={onRefresh}>
          <RefreshCw size={18} />
          Actualizar estado
        </button>
      ) : (
        <button className="button" disabled={busy} onClick={() => void pay()}>
          <CreditCard size={18} />
          {busy ? "Abriendo pago…" : "Pagar US$5 una vez"}
        </button>
      )}
    </div>
  );
}
