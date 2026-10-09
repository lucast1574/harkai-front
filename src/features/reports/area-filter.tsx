"use client";
import type { Area, Category } from "@/lib/contracts";
import { Field, Select } from "@/components/ui";
import { useState } from "react";
import { LocationControl } from "../map/location-control";
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
  const [draft, setDraft] = useState(area);
  return (
    <form
      className="area-filter panel"
      onSubmit={(e) => {
        e.preventDefault();
        onChange({ ...draft, type: fixedType || draft.type });
      }}
    >
      <div className="filter-heading">
        <h2>Ubicación de consulta</h2>
      </div>
      <div className="filter-fields">
        <Field
          label="Latitud"
          type="number"
          step="any"
          min={-90}
          max={90}
          required
          value={draft.latitude}
          onChange={(e) =>
            setDraft({ ...draft, latitude: Number(e.target.value) })
          }
        />
        <Field
          label="Longitud"
          type="number"
          step="any"
          min={-180}
          max={180}
          required
          value={draft.longitude}
          onChange={(e) =>
            setDraft({ ...draft, longitude: Number(e.target.value) })
          }
        />
        <Select
          label="Radio"
          value={draft.radius}
          onChange={(e) =>
            setDraft({ ...draft, radius: Number(e.target.value) })
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
            label="Categoría"
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        )}
        {dates && (
          <Field
            label="Desde (hora de tu dispositivo)"
            type="datetime-local"
            value={draft.after}
            onChange={(e) => setDraft({ ...draft, after: e.target.value })}
          />
        )}
        <button className="button" type="submit">
          Consultar zona
        </button>
      </div>
      <LocationControl
        point={draft}
        onChange={(point) => {
          const next = { ...draft, ...point, type: fixedType || draft.type };
          setDraft(next);
          onChange(next);
        }}
      />
    </form>
  );
}
