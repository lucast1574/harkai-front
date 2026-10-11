"use client";
import { Select } from "@/components/ui";
import type { Area } from "@/lib/contracts";
import { ScopeToggle } from "./scope-toggle";
import { LocationControl } from "./location-control";

/** Everyday location choices; detailed filters belong to the archive. */
export function NeighborhoodZone({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
}): React.JSX.Element {
  return (
    <div className="zone-controls zone-controls-compact">
      <Select
        label="Distrito"
        value={area.ubigeo || ""}
        disabled={area.geoPending || !!area.geoError}
        onChange={(event) =>
          onChange({
            ...area,
            ubigeo: event.target.value,
            scope: "district",
            district: "",
          })
        }
      >
        {!area.ubigeo && (
          <option value="">
            {area.geoPending ? "Buscando…" : "Elige una zona"}
          </option>
        )}
        {area.districts?.map((district) => (
          <option key={district.id} value={district.id}>
            {district.name}
          </option>
        ))}
      </Select>
      <ScopeToggle area={area} onChange={onChange} />
      <LocationControl
        point={area}
        onChange={(point) => onChange({ ...area, ...point })}
      />
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
    </div>
  );
}
