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
    onChange({ latitude: next.latitude, longitude: next.longitude });
    setMessage("Ubicación actualizada.");
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
          <LocateFixed size={15} />
          {request.busy || automatic.busy
            ? "Ubicando…"
            : "Usar mi ubicación"}
        </button>
        <button
          type="button"
          className="location-button"
          onClick={chooseManually}
        >
          <MapPin size={15} />
          Ajustar en mapa
        </button>
      </div>
      {request.busy && (
        <button
          type="button"
          className="text-button"
          onClick={request.cancel}
        >
          <X size={13} />
          Cancelar búsqueda
        </button>
      )}
      {request.error && (
        <div className="location-recovery" role="alert">
          <p>{request.error}</p>
          <button
            type="button"
            className="text-button"
            onClick={chooseManually}
          >
            Elegir punto en el mapa →
          </button>
        </div>
      )}
      {message && (
        <p className="small location-detected" role="status">
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
          setMessage("Zona actualizada.");
          dialog.current?.close();
        }}
      />
    </div>
  );
}
