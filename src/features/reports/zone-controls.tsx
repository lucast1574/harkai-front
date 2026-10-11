"use client";
import { useLocationState } from "@/lib/user-location";
import { ScopeToggle } from "../map/scope-toggle";
import { LocationControl } from "../map/location-control";
import type { Area, Category } from "@/lib/contracts";
import { Select } from "@/components/ui";
export function ZoneControls({
  area,
  categories,
  onChange,
  fixedType,
  compact = false,
}: {
  area: Area;
  categories: Category[];
  onChange: (a: Area) => void;
  fixedType?: string;
  compact?: boolean;
}): React.JSX.Element {
  const location = useLocationState();
  const adjustment = (
    <>
      <LocationControl
        point={area}
        onChange={(point) => onChange({ ...area, ...point })}
      />
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
    </>
  );
  return (
    <div className={`zone-controls ${compact ? "zone-controls-compact" : ""}`}>
      {!compact && (
        <div className="zone-caption">
          <span>
            <span className="live-dot" /> Zona de consulta
          </span>
          <strong>{area.geography?.province || "Selecciona un punto"}</strong>
        </div>
      )}
      <div className="zone-options">
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
      <ScopeToggle area={area} onChange={onChange} />
      {area.geoError && (
        <p className="small error" role="alert">
          {area.geoError}
          <button type="button" className="text-button" onClick={area.geoRetry}>
            Reintentar
          </button>
        </p>
      )}
      {compact && location.busy && (
        <p className="small muted" role="status">
          Detectando tu distrito… Puedes elegir otra zona mientras tanto.
        </p>
      )}
      {compact ? (
        <details
          className="zone-advanced"
          open={location.error || area.geoError ? true : undefined}
        >
          <summary>Cambiar ciudad o ajustar ubicación</summary>
          {adjustment}
        </details>
      ) : (
        adjustment
      )}
    </div>
  );
}
