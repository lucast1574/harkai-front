"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useResource } from "@/lib/use-resource";
import { LocationControl } from "../map/location-control";
import { type Point } from "@/lib/location";
import { useQueryPoint } from "@/lib/use-area";
import type { Meta } from "@/lib/contracts";
import {
  clearPush,
  pushConfigured,
  savedSubscription,
  subscribe,
} from "@/lib/push";
import { Notice } from "@/components/ui";
export function PushSettings(): React.JSX.Element {
  const { user } = useAuth();
  const queryPoint = useQueryPoint();
  const { data: meta } = useResource<Meta>("meta");
  const [zone, setZone] = useState<Point | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const saved = user ? savedSubscription(user.id) : null;
    setEnabled(!!saved);
    setZone(
      saved ? { latitude: saved.latitude, longitude: saved.longitude } : null,
    );
  }, [user]);
  async function activate(): Promise<void> {
    if (!user || !zone) return;
    setBusy(true);
    setError("");
    try {
      if (!("Notification" in window))
        throw new Error("Este navegador no admite notificaciones.");
      if ((await Notification.requestPermission()) !== "granted")
        throw new Error(
          "Activa las notificaciones en los permisos del navegador.",
        );
      await subscribe(user.id, zone, false);
      setEnabled(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo activar. Revisa los permisos de notificación y vuelve a intentarlo.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function deactivate(): Promise<void> {
    setBusy(true);
    setError("");
    try {
      await clearPush();
      setEnabled(false);
    } catch {
      setError("No se pudo retirar el dispositivo. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }
  const ready = meta?.capabilities.push_notifications && pushConfigured();
  return (
    <section className="panel account-privacy">
      <h2>Notificaciones en este navegador</h2>
      <p className="muted">
        Recibe también reportes no verificados cerca de la zona que registres.
        Se aplican el radio y las preferencias guardadas en tu cuenta.
      </p>
      <p className="small muted">
        Elige una zona en el mapa o usa tu ubicación una vez. No se sigue tu
        ubicación en segundo plano.
      </p>
      {!ready && (
        <Notice>
          Las notificaciones todavía están pendientes de configuración. Puedes
          consultar las alertas en el mapa.
        </Notice>
      )}
      {enabled && (
        <Notice>
          Este navegador está registrado. Actualiza la zona si cambias de lugar.
        </Notice>
      )}
      {ready && (
        <LocationControl point={zone || queryPoint} onChange={setZone} />
      )}
      {zone && (
        <p className="small muted">
          Zona elegida: {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}.
          Pulsa activar o guardar para registrar el cambio.
        </p>
      )}
      {error && <Notice error>{error}</Notice>}
      <div className="page-actions">
        <button
          className="button"
          disabled={!ready || busy || !zone}
          onClick={() => void activate()}
        >
          {busy
            ? "Procesando…"
            : enabled
              ? "Guardar nueva zona"
              : "Activar en esta zona"}
        </button>
        {enabled && (
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => void deactivate()}
          >
            Desactivar este navegador
          </button>
        )}
      </div>
    </section>
  );
}
