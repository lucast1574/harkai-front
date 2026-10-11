"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Incident, Meta } from "@/lib/contracts";
import {
  listenPush,
  savedSubscription,
  subscribe,
  pushConfigured,
} from "@/lib/push";
export function PushInbox(): React.JSX.Element | null {
  const { user } = useAuth();
  const [report, setReport] = useState<{ user: string; id: string } | null>(
    null,
  );
  const owner = user?.id;
  useEffect(() => {
    let live = true;
    let unsubscribe: (() => void) | undefined;
    if (!owner || !pushConfigured()) return;
    const saved = savedSubscription(owner);
    if (!saved || Notification.permission !== "granted") return;
    void (async () => {
      try {
        const meta = await api<Meta>("meta");
        if (!live || !meta.capabilities.push_notifications) return;
        await subscribe(owner, saved, false);
        if (!live) return;
        const stop = await listenPush((payload) => {
          const id = payload.data?.report_id;
          if (!id || !/^[a-f0-9]{24}$/.test(id) || !live) return;
          void api<Incident>(`incidents/${id}`)
            .then((i) => {
              if (
                live &&
                i.status === "active" &&
                (!i.expires_at || new Date(i.expires_at).getTime() > Date.now())
              )
                setReport({ user: owner, id });
            })
            .catch(() => undefined);
        });
        if (live) unsubscribe = stop;
        else stop();
      } catch {
        /* Background push can continue; explicit settings allow retry. */
      }
    })();
    return () => {
      live = false;
      unsubscribe?.();
    };
  }, [owner]);
  if (!report || report.user !== user?.id) return null;
  return (
    <aside className="push-notice" role="status">
      <strong>Nuevo reporte cerca de tu zona</strong>
      <p>Información comunitaria: revisa si está confirmado.</p>
      <Link
        className="button"
        href={`/incidents/${report.id}`}
        onClick={() => setReport(null)}
      >
        Ver reporte
      </Link>
      <button className="text-button" onClick={() => setReport(null)}>
        Cerrar
      </button>
    </aside>
  );
}
