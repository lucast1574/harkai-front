"use client";
import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Field, Select, Notice } from "@/components/ui";
import { useResource } from "@/lib/use-resource";
import type { Area } from "@/lib/contracts";

type District = {
  id: string;
  name: string;
  province: string;
  department: string;
  latitude: number;
  longitude: number;
};
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function DistrictSearch({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div className="district-search">
      <button
        type="button"
        className="button secondary"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <MapPin size={16} />{" "}
        {area.districts?.find((d) => d.id === area.ubigeo)?.name ||
          area.geography?.name ||
          "Elegir distrito"}{" "}
        <ChevronDown size={15} />
      </button>
      {open && (
        <div
          className="district-search-panel"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              event.currentTarget.parentElement
                ?.querySelector("button")
                ?.focus();
            }
          }}
        >
          <DistrictOptions
            area={area}
            onChange={(next) => {
              onChange(next);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export function DistrictOptions({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
}): React.JSX.Element {
  const catalog = useResource<{ items: District[] }>("geo/catalog");
  const [search, setSearch] = useState("");
  const all = catalog.data?.items || [];
  const matches = all.filter((d) =>
    normalize(`${d.name} ${d.province} ${d.department}`).includes(
      normalize(search.trim()),
    ),
  );
  return (
    <>
      <Field
        label="Buscar distrito"
        placeholder="Distrito, provincia o departamento"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Select
        label="Distrito que quieres ver"
        value={matches.some((d) => d.id === area.ubigeo) ? area.ubigeo : ""}
        disabled={catalog.loading}
        onChange={(e) => {
          const d = all.find((item) => item.id === e.target.value);
          if (d)
            onChange({
              ...area,
              latitude: d.latitude,
              longitude: d.longitude,
              ubigeo: d.id,
              scope: "district",
            });
        }}
      >
        <option value="">
          {catalog.loading ? "Cargando distritos…" : "Seleccionar distrito"}
        </option>
        {matches.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} · {d.province}, {d.department}
          </option>
        ))}
      </Select>
      {!catalog.loading && !catalog.error && !matches.length && (
        <p className="muted">
          No encontramos ese distrito. Prueba otro nombre.
        </p>
      )}
      {catalog.error && (
        <Notice error>
          {catalog.error}{" "}
          <button className="text-button" onClick={() => void catalog.reload()}>
            Reintentar
          </button>
        </Notice>
      )}
    </>
  );
}
