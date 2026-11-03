"use client";
import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  MapPin,
  Store,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import {
  businessKinds,
  businessStatus,
  type Business,
} from "./business-contract";
import styles from "./business-review.module.css";

export function BusinessReviewCard({
  point,
  busy,
  disabled,
  onReview,
}: {
  point: Business;
  busy?: "approved" | "rejected";
  disabled: boolean;
  onReview: (status: "approved" | "rejected") => void;
}): React.JSX.Element {
  const approved = point.moderation === "approved";
  return (
    <article className={styles.card}>
      {point.media_id ? (
        <Image
          unoptimized
          width={600}
          height={300}
          className={styles.photo}
          src={`/api/backend/media/${point.media_id}`}
          alt={`Foto de ${point.name}`}
        />
      ) : (
        <div className={styles.placeholder}>
          <Store size={30} />
        </div>
      )}
      <div className={styles.body}>
        <span className={styles.status}>
          {approved && <CheckCircle2 size={15} />}
          {businessStatus(point)}
        </span>
        <h3>{point.name}</h3>
        <p className="muted small">{businessKinds[point.kind] || point.kind}</p>
        <p className={styles.location}>
          <MapPin size={15} />
          {[point.address, point.district, point.city]
            .filter(Boolean)
            .join(", ") || "Ubicación registrada en el mapa"}
        </p>
        {approved ? (
          <details>
            <summary>Ver detalles</summary>
            <p>{point.description}</p>
            {point.offer && <p>Oferta: {point.offer}</p>}
            {point.discount_code && <p>Código: {point.discount_code}</p>}
            <button
              type="button"
              className="text-button"
              disabled={disabled}
              onClick={() => onReview("rejected")}
            >
              {busy ? "Actualizando…" : "Retirar aprobación"}
            </button>
          </details>
        ) : (
          <>
            <p>{point.description}</p>
            {point.offer && <p>Oferta: {point.offer}</p>}
            {point.discount_code && <p>Código: {point.discount_code}</p>}
            <div className={styles.actions}>
              <button
                type="button"
                className="button"
                disabled={disabled}
                onClick={() => onReview("approved")}
              >
                {busy === "approved" && (
                  <LoaderCircle size={16} className={styles.spinner} />
                )}
                {busy === "approved" ? "Aprobando…" : "Aprobar"}
              </button>
              {point.moderation !== "rejected" && (
                <button
                  type="button"
                  className="button secondary"
                  disabled={disabled}
                  onClick={() => onReview("rejected")}
                >
                  {busy === "rejected" ? "Rechazando…" : "Rechazar"}
                </button>
              )}
            </div>
          </>
        )}
        {busy && <small role="status">Guardando la revisión…</small>}
      </div>
    </article>
  );
}

export function BusinessReviewResult({
  point,
  onClose,
}: {
  point: Business;
  onClose: () => void;
}): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const approved = point.moderation === "approved";
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {approved ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
      <h2 id={title}>{approved ? "Lugar aprobado" : "Revisión guardada"}</h2>
      <p>
        <strong>{point.name}</strong>{" "}
        {approved
          ? "ya está en la sección de aprobados."
          : "quedó rechazado y está en su sección correspondiente."}
      </p>
      {approved && (
        <p className="muted">
          {!point.enabled
            ? "El propietario tiene el negocio pausado."
            : point.billing_status !== "active"
              ? "Su publicación está pendiente de activación."
              : "El negocio está habilitado para aparecer en el mapa."}
        </p>
      )}
      <button type="button" className="button" onClick={onClose}>
        Entendido
      </button>
    </dialog>
  );
}
