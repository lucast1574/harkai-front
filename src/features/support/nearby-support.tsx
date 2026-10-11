"use client";
import { HeartPulse } from "lucide-react";
import { useUserLocation } from "@/lib/use-area";
import type { SupportPlace } from "./contracts";
import styles from "./nearby-support.module.css";
function distance(lat: number, lon: number, place: SupportPlace): number {
  const radians = Math.PI / 180;
  const a =
    Math.sin(((place.latitude - lat) * radians) / 2) ** 2 +
    Math.cos(lat * radians) *
      Math.cos(place.latitude * radians) *
      Math.sin(((place.longitude - lon) * radians) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function NearbySupport({
  places,
}: {
  places: SupportPlace[];
}): React.JSX.Element | null {
  const point = useUserLocation();
  if (!point || (point.accuracy ?? 1000) > 150) return null;
  const nearby = places
    .map((place) => ({
      place,
      meters: distance(point.latitude, point.longitude, place),
    }))
    .filter((item) => item.meters <= 500)
    .sort((a, b) => a.meters - b.meters);
  if (!nearby.length) return null;
  const { place, meters } = nearby[0];
  return (
    <section
      className={styles.card}
      aria-label="Salud cerca de tu ubicación"
      role="status"
    >
      <HeartPulse size={20} aria-hidden="true" />
      <div>
        <strong>Tienes salud cerca</strong>
        <p>
          {place.name} · aprox. {Math.round(meters)} m
        </p>
        <small>
          {nearby.length} {nearby.length === 1 ? "lugar" : "lugares"} a menos de
          500 m. Son puntos permanentes, no alertas.
        </small>
        {place.phone && (
          <a href={`tel:${place.phone}`}>Llamar al establecimiento</a>
        )}
      </div>
    </section>
  );
}
