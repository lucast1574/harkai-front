"use client";
import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Select, Notice } from "@/components/ui";
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

export function DistrictOptions(props: {
  area: Area;
  onChange: (area: Area) => void;
  onPendingChange?: (pending: boolean) => void;
}): React.JSX.Element {
  return (
    <DistrictHierarchy key={props.area.ubigeo || "automatic"} {...props} />
  );
}

function DistrictHierarchy({
  area,
  onChange,
  onPendingChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
  onPendingChange?: (pending: boolean) => void;
}): React.JSX.Element {
  const catalog = useResource<{ items: District[] }>("geo/catalog");
  const all = catalog.data?.items || [];
  const [department, setDepartment] = useState((area.ubigeo || "").slice(0, 2));
  const [province, setProvince] = useState((area.ubigeo || "").slice(0, 4));
  const departments = [
    ...new Map(
      all.map((d) => [
        d.id.slice(0, 2),
        { id: d.id.slice(0, 2), name: d.department },
      ]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const provinces = [
    ...new Map(
      all
        .filter((d) => d.id.startsWith(department))
        .map((d) => [
          d.id.slice(0, 4),
          { id: d.id.slice(0, 4), name: d.province },
        ]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const districts = province
    ? all
        .filter((d) => d.id.startsWith(province))
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
    : [];
  return (
    <>
      <div className="district-options">
        <Select
          label="Departamento"
          value={department}
          disabled={catalog.loading || !all.length}
          onChange={(e) => {
            onPendingChange?.(true);
            setDepartment(e.target.value);
            setProvince("");
          }}
        >
          <option value="" disabled>
            {catalog.loading ? "Cargando…" : "Elige departamento"}
          </option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select
          label="Provincia"
          value={province}
          disabled={catalog.loading || !department || !all.length}
          onChange={(e) => {
            onPendingChange?.(true);
            setProvince(e.target.value);
          }}
        >
          <option value="" disabled>
            Elige provincia
          </option>
          {provinces.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select
          label="Distrito"
          value={districts.some((d) => d.id === area.ubigeo) ? area.ubigeo : ""}
          disabled={catalog.loading || !province || !districts.length}
          onChange={(e) => {
            const d = districts.find((item) => item.id === e.target.value);
            if (d)
              onChange({
                ...area,
                latitude: d.latitude,
                longitude: d.longitude,
                ubigeo: d.id,
                scope: "district",
                district: "",
              });
          }}
        >
          <option value="" disabled>
            Elige distrito
          </option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>
      {!catalog.loading && !catalog.error && !all.length && (
        <p className="muted">No hay distritos disponibles por el momento.</p>
      )}
      {catalog.error && (
        <Notice error>
          {catalog.error}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => void catalog.reload()}
          >
            Reintentar
          </button>
        </Notice>
      )}
    </>
  );
}
