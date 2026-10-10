"use client";
import dynamic from "next/dynamic";
import { X, MapPin } from "lucide-react";
import { type RefObject } from "react";
import { Notice } from "@/components/ui";
import { PointCoordinates } from "./point-coordinates";
import { validPoint, ZONE_PRESETS, type Point } from "@/lib/location";
const PointMap = dynamic(() => import("./point-map"), {
  ssr: false,
  loading: () => <Notice>Cargando mapa…</Notice>,
});
export function LocationDialog({
  dialog,
  open,
  draft,
  accuracy,
  onDraft,
  onClose,
  onConfirm,
}: {
  dialog: RefObject<HTMLDialogElement | null>;
  open: boolean;
  draft: Point;
  accuracy?: number;
  onDraft: (point: Point) => void;
  onClose: () => void;
  onConfirm: () => void;
}): React.JSX.Element {
  return (
    <dialog
      ref={dialog}
      className="location-dialog"
      aria-label="Elegir zona de consulta"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) dialog.current.close();
      }}
    >
      <div className="location-dialog-heading">
        <div>
          <span className="eyebrow">TU ZONA DE CONSULTA</span>
          <h2>Encuentra tu zona</h2>
          <p>
            Arrastra el mapa o pulsa un lugar. El punto del centro es la zona
            que vas a consultar.
          </p>
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
      <div className="location-presets" aria-label="Ir a una ciudad">
        {ZONE_PRESETS.map((city) => (
          <button
            type="button"
            key={city.label}
            className="button secondary"
            onClick={() =>
              onDraft({ latitude: city.latitude, longitude: city.longitude })
            }
          >
            <MapPin size={14} />
            {city.label}
          </button>
        ))}
        <span className="small muted">Elige una ciudad y ajusta el punto.</span>
      </div>
      {accuracy !== undefined && (
        <Notice>
          El navegador solo pudo ubicarte con una precisión de aproximadamente{" "}
          {Math.round(accuracy).toLocaleString("es-PE")} m. Ajusta el punto
          antes de confirmar.
        </Notice>
      )}
      {open && (
        <PointMap point={draft} onChange={onDraft} accuracy={accuracy} />
      )}
      <PointCoordinates
        key={`${draft.latitude}:${draft.longitude}`}
        point={draft}
        onChange={onDraft}
      />
      <div className="location-dialog-footer">
        <span className="small muted">
          Punto elegido: {draft.latitude.toFixed(4)},{" "}
          {draft.longitude.toFixed(4)}
        </span>
        <button
          type="button"
          className="button"
          disabled={!validPoint(draft)}
          onClick={onConfirm}
        >
          Usar esta zona
        </button>
      </div>
    </dialog>
  );
}
