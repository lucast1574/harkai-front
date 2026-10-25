"use client";
import { Globe2 } from "lucide-react";
import type { Area } from "@/lib/contracts";
import styles from "./map-city-control.module.css";

export function MapCityControl({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
}): React.JSX.Element {
  const city = area.scope !== "district" && !!area.scope;
  return (
    <button
      type="button"
      role="switch"
      aria-label="Explorar toda la provincia"
      aria-checked={city}
      disabled={area.geoPending || !!area.geoError}
      className={`${styles.control} ${city ? styles.active : ""}`}
      onClick={() =>
        onChange({ ...area, scope: city ? "district" : "province" })
      }
    >
      <Globe2 size={15} aria-hidden="true" className={styles.icon} />
      <span className={styles.label}>Explorar toda la provincia</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </button>
  );
}
