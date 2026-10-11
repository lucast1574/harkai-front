"use client";
import { useRef, useState } from "react";
import { LocateFixed, MapPin, X } from "lucide-react";
import { LocationDialog } from "./location-dialog";
import { useLocationRequest } from "./use-location-request";
import { useLocationState } from "@/lib/user-location";
import { rememberUserLocation } from "@/lib/use-area";
import type { Point } from "@/lib/location";
export function LocationControl({
  point,
  onChange,
}: {
  point: Point;
  onChange: (point: Point) => void;
}): React.JSX.Element {
  const automatic = useLocationState();
  const dialog = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState(point);
  const [accuracy, setAccuracy] = useState<number>();
  const [open, setOpen] = useState(false);
  const request = useLocationRequest((next) => {
    rememberUserLocation(next);
    if (next.accuracy > 2000) {
      setDraft({ latitude: next.latitude, longitude: next.longitude });
      setAccuracy(next.accuracy);
      setOpen(true);
      dialog.current?.showModal();
      setMessage("Confirma o ajusta la ubicación aproximada en el mapa.");
    } else {
      onChange({ latitude: next.latitude, longitude: next.longitude });
      setMessage(
        `Zona actualizada · precisión aproximada de ${Math.round(next.accuracy)} m. Puedes ajustarla en el mapa.`,
      );
    }
  });
  function chooseManually(): void {
    request.cancel();
    request.clearError();
    setMessage("");
    setDraft(point);
    setAccuracy(undefined);
    setOpen(true);
    dialog.current?.showModal();
  }
  return (
    <div className="location-control">
      <div className="location-actions">
        <button
          type="button"
          className="location-button"
          disabled={request.busy || automatic.busy}
          onClick={() => {
            setMessage("");
            void request.find();
          }}
        >
          <LocateFixed size={16} />
          {request.busy || automatic.busy
            ? "Localizando…"
            : automatic.point
              ? "Volver a mi ubicación"
              : "Reintentar ubicación"}
        </button>
        {request.busy && (
          <button
            type="button"
            className="text-button"
            onClick={request.cancel}
          >
            <X size={14} />
            Cancelar búsqueda
          </button>
        )}
        <button
          type="button"
          className="location-button"
          onClick={chooseManually}
        >
          <MapPin size={16} />
          Elegir ciudad o zona
        </button>
      </div>
      {(request.busy || automatic.busy) && (
        <p className="small muted" role="status">
          Acepta el permiso del navegador. Si no consigue ubicarte, puedes
          elegir tu zona sin esperar.
        </p>
      )}
      {(request.error || automatic.error) && (
        <div className="location-recovery" role="alert">
          <p>{request.error || automatic.error}</p>
          <button
            type="button"
            className="text-button"
            onClick={chooseManually}
          >
            Elegir mi zona ahora →
          </button>
        </div>
      )}
      {!message && automatic.point && !automatic.busy && !automatic.error && (
        <p className="small location-detected">
          Ubicación detectada · precisión {Math.round(automatic.point.accuracy)}{" "}
          m
        </p>
      )}
      {message && (
        <p className="small muted" role="status">
          {message}
        </p>
      )}
      <LocationDialog
        dialog={dialog}
        open={open}
        draft={draft}
        accuracy={accuracy}
        onClose={() => setOpen(false)}
        onDraft={(next) => {
          setDraft(next);
          setAccuracy(undefined);
        }}
        onConfirm={() => {
          onChange(draft);
          request.clearError();
          setMessage(
            "Zona actualizada. Se conserva al cambiar de sección en esta pestaña.",
          );
          dialog.current?.close();
        }}
      />
    </div>
  );
}
