"use client";
import { useState } from "react";
import { LocateFixed, SlidersHorizontal } from "lucide-react";
import type { Area, Category } from "@/lib/contracts";
import { Field, Select } from "@/components/ui";
export function ZoneControls({
  area,
  categories,
  onChange,
  fixedType,
}: {
  area: Area;
  categories: Category[];
  onChange: (a: Area) => void;
  fixedType?: string;
}): React.JSX.Element {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="zone-controls">
      <div className="zone-caption">
        <span>
          <span className="live-dot" /> Zona de consulta
        </span>
        <strong>
          {area.latitude.toFixed(3)}, {area.longitude.toFixed(3)}
        </strong>
      </div>
      <div className="zone-options">
        <Select
          label="Alcance"
          value={area.radius}
          onChange={(e) =>
            onChange({ ...area, radius: Number(e.target.value) })
          }
        >
          {[500, 1000, 5000, 10000, 50000, 100000].map((r) => (
            <option key={r} value={r}>
              {r < 1000 ? `${r} m` : `${r / 1000} km`}
            </option>
          ))}
        </Select>
        {!fixedType && (
          <Select
            label="Tipo de reporte"
            value={area.type}
            onChange={(e) => onChange({ ...area, type: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        )}
      </div>
      <button
        className="location-button"
        disabled={busy}
        onClick={() => {
          if (!navigator.geolocation) {
            setError("Este navegador no ofrece ubicación.");
            return;
          }
          setBusy(true);
          navigator.geolocation.getCurrentPosition(
            (p) => {
              onChange({
                ...area,
                latitude: p.coords.latitude,
                longitude: p.coords.longitude,
              });
              setBusy(false);
              setError("");
            },
            () => {
              setBusy(false);
              setError(
                "No se pudo obtener tu ubicación. Mueve el mapa o cambia las coordenadas.",
              );
            },
            { timeout: 10000, maximumAge: 60000 },
          );
        }}
      >
        <LocateFixed size={16} />
        {busy ? "Buscando ubicación…" : "Usar mi ubicación"}
      </button>
      <details className="coordinate-options">
        <summary>
          <SlidersHorizontal size={14} /> Cambiar coordenadas
        </summary>
        <Coordinates
          key={`${area.latitude}:${area.longitude}`}
          area={area}
          onChange={onChange}
        />
      </details>
      {error && (
        <p className="error small" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
function Coordinates({
  area,
  onChange,
}: {
  area: Area;
  onChange: (a: Area) => void;
}): React.JSX.Element {
  const [lat, setLat] = useState(String(area.latitude));
  const [lng, setLng] = useState(String(area.longitude));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange({ ...area, latitude: Number(lat), longitude: Number(lng) });
      }}
    >
      <div className="two-columns">
        <Field
          label="Latitud"
          type="number"
          step="any"
          min={-90}
          max={90}
          required
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <Field
          label="Longitud"
          type="number"
          step="any"
          min={-180}
          max={180}
          required
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
      </div>
      <button className="button secondary">Consultar ubicación</button>
    </form>
  );
}
