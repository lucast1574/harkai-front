"use client";
import { reportFilterCategories } from "@/lib/report-categories";
import type { Area, Category } from "@/lib/contracts";
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
  const province = area.geography?.province || "la ciudad";

  return (
    <section className="area-filter panel" aria-label="Filtros de consulta">
      <div className="filter-heading">
        <div>
          <span className="eyebrow">FILTROS DE CONSULTA</span>
          <h2>Alcance y categoría</h2>
        </div>
        <div
          className="archive-scope-pills"
          role="group"
          aria-label="Alcance territorial"
        >
          <button
            type="button"
            className={area.scope !== "city" ? "active" : ""}
            onClick={() =>
              onChange({ ...area, scope: "district", district: "" })
            }
          >
            Por distrito
          </button>
          <button
            type="button"
            className={area.scope === "city" ? "active" : ""}
            onClick={() => onChange({ ...area, scope: "city", district: "" })}
          >
            Toda {province}
          </button>
        </div>
      </div>

      <div className="filter-fields">
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
