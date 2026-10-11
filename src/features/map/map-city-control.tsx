"use client";
import { Building2 } from "lucide-react";
import type { Area } from "@/lib/contracts";
import styles from "./map-city-control.module.css";

export function MapCityControl({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
}): React.JSX.Element {
  const city = area.scope === "city";
  return (
    <div className={styles.control}>
      <Building2 size={16} aria-hidden="true" />
      <span>Explorar toda la ciudad</span>
      <button
        type="button"
        role="switch"
        aria-label="Explorar toda la ciudad"
        aria-checked={city}
        disabled={area.geoPending || !!area.geoError}
        onClick={() => onChange({ ...area, scope: city ? "district" : "city" })}
      >
        <span />
      </button>
    </div>
  );
}
