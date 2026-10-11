"use client";
import { useState } from "react";
import { Field } from "@/components/ui";
import type { Point } from "@/lib/location";
export function PointCoordinates({
  point,
  onChange,
}: {
  point: Point;
  onChange: (point: Point) => void;
}): React.JSX.Element {
  const [latitude, setLatitude] = useState(String(point.latitude));
  const [longitude, setLongitude] = useState(String(point.longitude));
  const lat = Number(latitude),
    lng = Number(longitude);
  const valid =
    latitude.trim() !== "" &&
    longitude.trim() !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 85 &&
    Math.abs(lng) <= 180;
  return (
    <details className="coordinate-options">
      <summary>Ingresar coordenadas</summary>
      <div className="two-columns">
        <Field
          label="Latitud"
          type="number"
          step="any"
          min={-85}
          max={85}
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />
        <Field
          label="Longitud"
          type="number"
          step="any"
          min={-180}
          max={180}
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="button secondary"
        disabled={!valid}
        onClick={() => onChange({ latitude: lat, longitude: lng })}
      >
        Mostrar este punto
      </button>
    </details>
  );
}
