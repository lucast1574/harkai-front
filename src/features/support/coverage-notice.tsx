"use client";
import { MapPin } from "lucide-react";
import { useUserLocation } from "@/lib/use-area";
import { useResource } from "@/lib/use-resource";
import styles from "./coverage-notice.module.css";
export function CoverageNotice(): React.JSX.Element | null {
  const point = useUserLocation();
  const coverage = useResource<{ covered: boolean }>(
    point && point.accuracy <= 2000
      ? `support/coverage?lat=${point.latitude}&lng=${point.longitude}`
      : null,
  );
  if (
    !point ||
    coverage.loading ||
    coverage.data?.covered !== false ||
    coverage.error
  )
    return null;
  return (
    <section
      className={styles.notice}
      role="status"
      aria-label="Cobertura de Harkai"
    >
      <MapPin size={21} aria-hidden="true" />
      <div>
        <strong>Tu ciudad aún no tiene cobertura</strong>
        <p>Estamos trabajando para llevar Harkai a todo el Perú.</p>
        <small>
          Por ahora puedes explorar Lima, Callao y Trujillo. Los números
          nacionales de ayuda siguen disponibles.
        </small>
      </div>
    </section>
  );
}
