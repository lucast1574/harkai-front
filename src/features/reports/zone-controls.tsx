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
      <LocationControl
        point={area}
        onChange={(point) => onChange({ ...area, ...point })}
      />
    </div>
  );
}
