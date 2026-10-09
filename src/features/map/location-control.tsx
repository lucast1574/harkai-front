"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, X } from "lucide-react";
import { Notice } from "@/components/ui";
import { PointCoordinates } from "./point-coordinates";
import { locate, type Point } from "@/lib/location";
const PointMap = dynamic(() => import("./point-map"), {
  ssr: false,
  loading: () => <Notice>Cargando mapa…</Notice>,
});
export function LocationControl({
  point,
  onChange,
}: {
  point: Point;
  onChange: (point: Point) => void;
}): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const generation = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState(point);
  const [open, setOpen] = useState(false);
  useEffect(
    () => () => {
      ++generation.current;
    },
    [],
  );
  async function find(): Promise<void> {
    const request = ++generation.current;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const next = await locate();
      if (request !== generation.current) return;
      onChange({ latitude: next.latitude, longitude: next.longitude });
      setMessage(
        `Ubicación aproximada${Number.isFinite(next.accuracy) ? ` · precisión de ${Math.round(next.accuracy)} m` : ""}. Puedes ajustarla en el mapa.`,
      );
    } catch (e) {
      if (request === generation.current) setError((e as Error).message);
    } finally {
      if (request === generation.current) setBusy(false);
    }
  }
  return (
    <div className="location-control">
      <div className="location-actions">
        <button
          type="button"
          className="location-button"
          disabled={busy}
          onClick={() => void find()}
        >
          <LocateFixed size={16} />
          {busy ? "Buscando ubicación…" : "Usar mi ubicación"}
        </button>
        <button
          type="button"
          className="location-button"
          onClick={() => {
            ++generation.current;
            setBusy(false);
            setDraft(point);
            setOpen(true);
            dialog.current?.showModal();
          }}
        >
          <MapPin size={16} />
          Elegir zona en mapa
        </button>
      </div>
      {error && (
        <p className="error small" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="small muted" role="status">
          {message}
        </p>
      )}
      <dialog
        ref={dialog}
        className="location-dialog"
        aria-label="Elegir zona de consulta"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="location-dialog-heading">
          <div>
            <h2>Elige tu zona</h2>
            <p>Mueve el mapa y selecciona un punto. No requiere GPS.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar selector de zona"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        {open && <PointMap point={draft} onChange={setDraft} />}
        <PointCoordinates
          key={`${draft.latitude}:${draft.longitude}`}
          point={draft}
          onChange={setDraft}
        />
        <div className="location-dialog-footer">
          <span className="small muted">
            {draft.latitude.toFixed(4)}, {draft.longitude.toFixed(4)}
          </span>
          <button
            type="button"
            className="button"
            disabled={
              !Number.isFinite(draft.latitude) ||
              !Number.isFinite(draft.longitude) ||
              Math.abs(draft.latitude) > 90 ||
              Math.abs(draft.longitude) > 180
            }
            onClick={() => {
              onChange(draft);
              setError("");
              setMessage("Zona elegida en el mapa.");
              dialog.current?.close();
            }}
          >
            Usar esta zona
          </button>
        </div>
      </dialog>
    </div>
  );
}
