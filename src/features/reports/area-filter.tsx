"use client";
import { reportFilterCategories } from "@/lib/report-categories";
import type { Area, Category } from "@/lib/contracts";
import { GeographySelector } from "../map/geography-selector";
import { Field, Select } from "@/components/ui";

export function AreaFilter({
  area,
  categories,
  onChange,
  fixedType,
  dates = false,
}: {
  area: Area;
  categories: Category[];
  onChange: (area: Area) => void;
  fixedType?: string;
  dates?: boolean;
}): React.JSX.Element {
  return (
    <section className="area-filter panel" aria-label="Filtros de consulta">
      <div className="filter-heading">
        <div>
          <span className="eyebrow">FILTROS DE CONSULTA</span>
          <h2>Alcance y categoría</h2>
        </div>
      </div>

      <div className="filter-fields">
        <GeographySelector area={area} onChange={onChange} />
        {!fixedType && (
          <Select
            label="Categoría"
            value={area.type}
            onChange={(e) => onChange({ ...area, type: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            {reportFilterCategories(categories).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        )}
        {dates && (
          <Field
            label="Desde"
            type="datetime-local"
            value={area.after}
            onChange={(e) => onChange({ ...area, after: e.target.value })}
          />
        )}
      </div>

      {area.geoError && (
        <p className="small error" role="alert">
          {area.geoError}{" "}
          <button type="button" className="text-button" onClick={area.geoRetry}>
            Reintentar
          </button>
        </p>
      )}
    </section>
  );
}
