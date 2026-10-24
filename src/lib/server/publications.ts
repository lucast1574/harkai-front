import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { backend } from "./backend";
import type { Incident, Page } from "../contracts";
export const publication = cache(async (id: string): Promise<Incident> => {
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  const response = await backend(`incidents/${id}`);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("No se pudo cargar la publicación");
  return response.json();
});
export async function publications(cursor = ""): Promise<Page<Incident>> {
  const response = await backend(
    `publications?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
  );
  if (!response.ok) throw new Error("No se pudo cargar la comunidad");
  return response.json();
}
export const labels: Record<string, string> = {
  theft: "Robo",
  extortion: "Extorsión",
  kidnapping: "Secuestro",
  violence: "Violencia",
  homicide: "Homicidio",
  fire: "Incendio",
  emergency: "Emergencia",
  crash: "Accidente",
  pet: "Mascota perdida o encontrada",
  place: "Lugar de ayuda",
};
export function title(i: Incident): string {
  return `${labels[i.type] || "Reporte vecinal"} en ${[i.district, i.city].filter(Boolean).join(", ") || "Perú"}`;
}
export function photo(i: Incident): string | undefined {
  return i.media_id
    ? `https://panel.harkai.lat/api/backend/media/${i.media_id}`
    : undefined;
}

export async function publicationTime(): Promise<number> {
  return Date.now();
}
