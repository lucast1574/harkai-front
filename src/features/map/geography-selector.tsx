"use client";
import { Select, Notice } from "@/components/ui";
import type { Area } from "@/lib/contracts";
import { DistrictOptions } from "./district-search";

export function GeographySelector({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
  quick?: boolean;
}): React.JSX.Element {
  return (
    <div className="geography-selector">
      <DistrictOptions area={area} onChange={onChange} />
      <Select
        label="Alcance de la consulta"
        value={area.scope === "city" ? "province" : area.scope || "district"}
        disabled={!area.ubigeo || area.geoPending}
        onChange={(e) =>
          onChange({
            ...area,
            scope: e.target.value as Area["scope"],
            district: "",
          })
        }
      >
        <option value="district">Solo este distrito</option>
        <option value="province">Toda la provincia</option>
        <option value="department">Todo el departamento</option>
      </Select>
      {area.geoError && (
        <Notice error>
          {area.geoError}{" "}
          <button type="button" className="text-button" onClick={area.geoRetry}>
            Reintentar
          </button>
        </Notice>
      )}
    </div>
  );
}
