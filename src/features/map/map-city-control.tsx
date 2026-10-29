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
  const label = "Explorar toda la ciudad";
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={city}
      disabled={area.geoPending || !!area.geoError}
      className={`${styles.control} ${city ? styles.active : ""}`}
      onClick={() => onChange({ ...area, scope: city ? "district" : "city" })}
    >
      <Globe2 size={15} aria-hidden="true" className={styles.icon} />
      <span className={styles.label}>{label}</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </button>
  );
}
