"use client";
import { LocationControl } from "../map/location-control";
import type { Area, Category } from "@/lib/contracts";
import { Select } from "@/components/ui";
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
  return (
    <div className="zone-controls">
      <div className="zone-caption">
        <span>
          <span className="live-dot" /> Zona de consulta
        </span>
        <strong>{area.geography?.province || "Selecciona un punto"}</strong>
      </div>
      <div className="zone-options">
        <Select
          label="Alcance"
          value={area.scope || "district"}
          onChange={(e) =>
            onChange({ ...area, scope: e.target.value as "district" | "city" })
          }
        >
          <option value="district">Mi distrito</option>
          <option value="city">Toda la ciudad</option>
        </Select>
        <Select
          label="Distrito"
          value={area.ubigeo || ""}
          disabled={area.geoPending || !!area.geoError}
          onChange={(e) =>
            onChange({
              ...area,
              ubigeo: e.target.value,
              scope: "district",
              district: "",
            })
          }
        >
          {!area.ubigeo && (
            <option value="">
              {area.geoPending ? "Buscando…" : "Sin distrito"}
            </option>
          )}
          {area.districts?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
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
      {area.geoError && (
        <p className="small error" role="alert">
          {area.geoError}
          <button type="button" className="text-button" onClick={area.geoRetry}>
            Reintentar
          </button>
        </p>
      )}
      {area.geography && (
        <p className="small geography-source">
          Límites de referencia {area.geography.reference_year} ·{" "}
          <a
            href={area.geography.source_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            SENACE / INEI
          </a>
        </p>
      )}
      <LocationControl
        point={area}
        onChange={(point) => onChange({ ...area, ...point })}
      />
    </div>
  );
}
