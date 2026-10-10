"use client";
import type { Area } from "@/lib/contracts";
export function ScopeToggle({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
}): React.JSX.Element {
  const city = area.scope === "city";
  return (
    <div className="scope-toggle">
      <div>
        <strong>Explorar toda la ciudad</strong>
        <span>
          {city
            ? `Todos los distritos de ${area.geography?.province || "la ciudad"}`
            : "Solo el distrito seleccionado"}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-label="Explorar toda la ciudad"
        aria-checked={city}
        onClick={() => onChange({ ...area, scope: city ? "district" : "city" })}
      >
        <span />
      </button>
    </div>
  );
}
