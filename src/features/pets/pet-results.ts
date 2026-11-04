import type { Incident } from "../../lib/contracts.ts";
import type { Point } from "../../lib/location.ts";

export type PetFilter = "all" | "photo" | "contact";
export type PetSort = "recent" | "nearby";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export function petDistance(origin: Point, target: Point): number {
  const rad = Math.PI / 180;
  const lat = (target.latitude - origin.latitude) * rad;
  const lng = (target.longitude - origin.longitude) * rad;
  const a =
    Math.sin(lat / 2) ** 2 +
    Math.cos(origin.latitude * rad) *
      Math.cos(target.latitude * rad) *
      Math.sin(lng / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

export function distanceLabel(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters / 10) * 10} m`
    : `${(meters / 1000).toLocaleString("es-PE", { maximumFractionDigits: 1 })} km`;
}

export function petResults(
  incidents: Incident[],
  options: {
    origin: Point;
    radius: number;
    search: string;
    filter: PetFilter;
    sort: PetSort;
  },
): { incident: Incident; meters: number }[] {
  const terms = normalize(options.search).trim().split(/\s+/).filter(Boolean);
  return incidents
    .filter(
      (incident) => incident.type === "pet" && incident.status !== "hidden",
    )
    .map((incident) => ({
      incident,
      meters: petDistance(options.origin, incident),
    }))
    .filter(({ incident, meters }) => {
      const text = normalize(
        `${incident.description} ${incident.district || ""} ${incident.city || ""}`,
      );
      return (
        meters <= options.radius &&
        terms.every((term) => text.includes(term)) &&
        (options.filter !== "photo" || !!incident.media_id) &&
        (options.filter !== "contact" || !!incident.contact_info?.trim())
      );
    })
    .sort((a, b) =>
      options.sort === "nearby"
        ? a.meters - b.meters ||
          Date.parse(b.incident.created_at) - Date.parse(a.incident.created_at)
        : Date.parse(b.incident.created_at) - Date.parse(a.incident.created_at),
    );
}
