"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { useResource } from "@/lib/use-resource";
import { useAuth } from "@/lib/auth";
import {
  dateLabel,
  reportURL,
  LIMA,
  type Incident,
  type Meta,
} from "@/lib/contracts";
import { Heading, Notice } from "@/components/ui";
import { Verification } from "./report-card";
import ZoneMap from "../map/map-loader";
export function ReportDetail({ id }: { id: string }): React.JSX.Element {
  const {
    data: incident,
    error,
    loading,
    reload,
  } = useResource<Incident>(`incidents/${id}`);
  const { data: meta } = useResource<Meta>("meta");
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [hide, setHide] = useState(false);
  async function action(
    path: string,
    method: string,
    body?: unknown,
  ): Promise<void> {
    setBusy(true);
    setActionError("");
    try {
      await api(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      await reload();
      setHide(false);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
    return;
  }
  async function share(): Promise<void> {
    try {
      const url = reportURL(id);
      if (navigator.share)
        await navigator.share({
          title: "Reporte comunitario en Harkai",
          text: "Revisa su estado y los detalles.",
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        setMessage("Enlace copiado.");
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setActionError(
          "No se pudo compartir. Puedes copiar el enlace de esta página.",
        );
    }
    return;
  }
  if (loading) return <Notice>Cargando el reporte…</Notice>;
  if (error || !incident)
    return (
      <>
        <Heading title="Reporte no disponible" />
        <Notice error>{error || "Este reporte no está disponible."}</Notice>
        <Link href="/dashboard">Volver a mi zona</Link>
      </>
    );
  const category = meta?.categories.find((c) => c.id === incident.type);
  const expired =
    !!incident.expires_at && new Date(incident.expires_at) <= new Date();
  return (
    <>
      <Heading title={category?.label || "Reporte comunitario"}>
        {incident.district || incident.city || "Ubicación indicada en el mapa"}{" "}
        · {dateLabel(incident.created_at)}
      </Heading>
      <div className="detail-layout">
        <section className="panel report-detail">
          <Verification incident={incident} />
          <p className="preserve-text">{incident.description}</p>
          <p className="muted">
            Estado:{" "}
            {incident.status === "resolved"
              ? "Resuelto"
              : incident.status === "hidden"
                ? "Oculto"
                : expired
                  ? "Expirado"
                  : "Activo"}
          </p>
          {incident.contact_info && (
            <p>Contacto compartido por el autor: {incident.contact_info}</p>
          )}
          {incident.media_id && (
            <Image
              src={`/api/backend/media/${incident.media_id}`}
              alt="Evidencia del reporte comunitario"
              className="evidence"
              width={900}
              height={600}
              unoptimized
            />
          )}
          <ul className="advice">
            {category?.advice.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <Notice>
            Una persona distinta del autor puede confirmar lo observado. Esta
            confirmación es comunitaria y no acredita una investigación oficial.
          </Notice>
          <div className="page-actions">
            <button
              className="button secondary"
              onClick={() => {
                void share();
              }}
            >
              Compartir reporte
            </button>
            {!incident.viewer_is_author &&
              !incident.verified &&
              incident.status === "active" &&
              !expired &&
              (user ? (
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => {
                    void action(`incidents/${id}/confirm`, "POST");
                  }}
                >
                  Confirmo que observé este hecho
                </button>
              ) : (
                <Link className="button" href="/login">
                  Ingresar para confirmar
                </Link>
              ))}
          </div>
          {incident.viewer_is_author && incident.status === "active" && (
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => {
                void action(`incidents/${id}/status`, "PATCH", {
                  status: "resolved",
                });
              }}
            >
              Marcar como resuelto
            </button>
          )}
          {user?.role === "admin" && incident.status !== "hidden" && (
            <>
              <button className="text-button" onClick={() => setHide(!hide)}>
                Moderar este reporte
              </button>
              {hide && (
                <Notice>
                  Se ocultará de la consulta pública.{" "}
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => {
                      void action(`incidents/${id}/status`, "PATCH", {
                        status: "hidden",
                      });
                    }}
                  >
                    Confirmar ocultamiento
                  </button>
                </Notice>
              )}
            </>
          )}
          {message && <Notice>{message}</Notice>}
          {actionError && <Notice error>{actionError}</Notice>}
        </section>
        <section className="map-panel">
          <ZoneMap
            area={{
              ...LIMA,
              latitude: incident.latitude,
              longitude: incident.longitude,
              radius: 500,
            }}
            incidents={[incident]}
            categories={meta?.categories || []}
          />
        </section>
      </div>
    </>
  );
}
