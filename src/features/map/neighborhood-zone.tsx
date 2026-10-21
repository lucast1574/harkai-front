"use client";
import { Select } from "@/components/ui";
import type { Area } from "@/lib/contracts";
import { ZONE_PRESETS } from "@/lib/location";
import { LocationControl } from "./location-control";

const CITIES = [
  {
    id: "lima",
    label: "Lima y Callao",
    ubigeo: "150101",
    latitude: ZONE_PRESETS[0].latitude,
    longitude: ZONE_PRESETS[0].longitude,
  },
  {
    id: "trujillo",
    label: "Trujillo",
    ubigeo: "130101",
    latitude: ZONE_PRESETS[1].latitude,
    longitude: ZONE_PRESETS[1].longitude,
  },
] as const;

export function NeighborhoodZone({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
}): React.JSX.Element {
  const isTrujillo =
    area.ubigeo?.startsWith("1301") ||
    area.geography?.province?.toLowerCase() === "trujillo";
  const activeCity = isTrujillo ? "trujillo" : "lima";

  return (
    <div className="zone-controls zone-controls-compact">
      <div className="city-switcher" role="group" aria-label="Ciudad">
        {CITIES.map((city) => {
          const active = activeCity === city.id;
          return (
            <button
              key={city.id}
              type="button"
              className={active ? "city-pill active" : "city-pill"}
              aria-pressed={active}
              onClick={() =>
                onChange({
                  ...area,
                  ubigeo: city.ubigeo,
                  latitude: city.latitude,
                  longitude: city.longitude,
                  scope: area.scope || "district",
                  district: "",
                })
              }
            >
              {city.label}
            </button>
          );
        })}
      </div>
      <Select
        label="Distrito"
        value={area.ubigeo || ""}
        disabled={area.geoPending}
        onChange={(event) => {
          const nextId = event.target.value;
          const match = area.districts?.find((d) => d.id === nextId);
          const lat = match?.lat ? Number(match.lat) : area.latitude;
          const lng = match?.lng ? Number(match.lng) : area.longitude;
          onChange({
            ...area,
            ubigeo: nextId,
            latitude: Number.isFinite(lat) ? lat : area.latitude,
            longitude: Number.isFinite(lng) ? lng : area.longitude,
            scope: "district",
            district: "",
          });
        }}
      >
        {!area.ubigeo && (
          <option value="">
            {area.geoPending ? "Ubicando distrito…" : "Selecciona un distrito"}
          </option>
        )}
        {area.districts?.map((district) => (
          <option key={district.id} value={district.id}>
            {district.name}
          </option>
        ))}
      </Select>
      <LocationControl
        point={area}
        onChange={(point) =>
          onChange({ ...area, ...point, ubigeo: undefined })
        }
      />
      {area.geoError && (
        <p className="small error" role="alert">
          {area.geoError}{" "}
          <button type="button" className="text-button" onClick={area.geoRetry}>
            Reintentar
          </button>
        </p>
      )}
    </div>
  );
}
