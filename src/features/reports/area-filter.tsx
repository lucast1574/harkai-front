"use client";
import type { Area, Category } from "@/lib/contracts";
import { Field, Select } from "@/components/ui";
import { useState } from "react";
import { ScopeToggle } from "../map/scope-toggle";
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
        onChange({
          ...draft,
          latitude: area.latitude,
          longitude: area.longitude,
          ubigeo: area.ubigeo,
          scope: area.scope,
          type: fixedType || draft.type,
        });
      }}
    >
      <div className="filter-heading">
        <h2>Ubicación de consulta</h2>
      </div>
      <ScopeToggle area={area} onChange={onChange} />
      <div className="filter-fields">
        <Select
          label="Distrito"
          value={area.ubigeo || ""}
          disabled={area.geoPending || !!area.geoError}
          onChange={(e) => {
            const next = {
              ...draft,
              ...area,
              ubigeo: e.target.value,
              scope: "district" as const,
              district: "",
            };
            setDraft(next);
            onChange(next);
          }}
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
      {area.geoError && (
        <p className="small error" role="alert">
          {area.geoError}{" "}
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
        onChange={(point) => {
          const next = {
            ...draft,
            ...area,
            ...point,
            type: fixedType || draft.type,
          };
          setDraft(next);
          onChange(next);
        }}
      />
    </form>
  );
}
