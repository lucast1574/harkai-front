"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useResource } from "@/lib/use-resource";
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
  const { data: meta } = useResource<Meta>("meta");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setEnabled(!!user && !!savedSubscription(user.id));
  }, [user]);
  async function activate(): Promise<void> {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      if ((await Notification.requestPermission()) !== "granted")
        throw new Error(
          "Activa las notificaciones en los permisos del navegador.",
        );
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 12000,
            maximumAge: 0,
          }),
      );
      await subscribe(
        user.id,
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        false,
      );
      setEnabled(true);
    } catch {
      setError(
        "No se pudo activar. Revisa los permisos de notificación y ubicación e inténtalo nuevamente.",
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
        Usaremos tu ubicación una vez al activar o actualizar la zona. No se
        sigue tu ubicación en segundo plano.
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
      {error && <Notice error>{error}</Notice>}
      <div className="page-actions">
        <button
          className="button"
          disabled={!ready || busy}
          onClick={() => void activate()}
        >
          {busy
            ? "Procesando…"
            : enabled
              ? "Actualizar zona con mi ubicación"
              : "Usar mi ubicación y activar"}
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
