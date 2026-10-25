"use client";
import { useState } from "react";
import { Field, Select, Notice } from "@/components/ui";
import { useResource } from "@/lib/use-resource";
import type { Area } from "@/lib/contracts";

type District = {
  id: string;
  name: string;
  department: string;
  province: string;
  latitude: number;
  longitude: number;
};
const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function GeographySelector({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
  quick?: boolean;
}): React.JSX.Element {
  const catalog = useResource<{ items: District[] }>("geo/catalog");
  const all = catalog.data?.items || [];
  const [search, setSearch] = useState("");
  const department = (area.ubigeo || "").slice(0, 2),
    province = (area.ubigeo || "").slice(0, 4);
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
  const districts = all
    .filter(
      (d) =>
        d.id.startsWith(province) &&
        (d.id === area.ubigeo || normalize(d.name).includes(normalize(search))),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  function choose(prefix: string, scope: Area["scope"]): void {
    const d = all.find((d) => d.id.startsWith(prefix));
    if (!d) return;
    setSearch("");
    onChange({
      ...area,
      latitude: d.latitude,
      longitude: d.longitude,
      ubigeo: d.id,
      scope,
      district: "",
    });
  }
  return (
    <div className="geography-selector">
      <Select
        label="Departamento"
        value={department}
        disabled={!all.length}
        onChange={(e) => choose(e.target.value, "department")}
      >
        <option value="">Selecciona departamento</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </Select>
      <Select
        label="Provincia"
        value={province}
        disabled={!all.length || !department}
        onChange={(e) => choose(e.target.value, "province")}
      >
        <option value="">Selecciona provincia</option>
        {provinces.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Field
        label="Buscar distrito"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Escribe el nombre"
        disabled={!all.length || !province}
      />
      <Select
        label="Distrito"
        value={area.ubigeo || ""}
        disabled={!all.length || !province}
        onChange={(e) => choose(e.target.value, "district")}
      >
        <option value="">Selecciona distrito</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </Select>
      <Select
        label="Área que quieres consultar"
        value={area.scope || "district"}
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
        {(province === "1501" || province === "0701") && (
          <option value="city">Lima y Callao juntos</option>
        )}
      </Select>
      {catalog.error && (
        <Notice error>
          {catalog.error}
          <button
            type="button"
            className="text-button"
            onClick={() => void catalog.reload()}
          >
            Reintentar
          </button>
        </Notice>
      )}
      {area.geoError && (
        <Notice error>
          {area.geoError}
          <button type="button" className="text-button" onClick={area.geoRetry}>
            Reintentar
          </button>
        </Notice>
      )}
    </div>
  );
}
