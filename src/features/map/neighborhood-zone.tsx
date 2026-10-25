"use client";
import type { Area } from "@/lib/contracts";
import { GeographySelector } from "./geography-selector";
export function NeighborhoodZone({
  area,
  onChange,
}: {
  area: Area;
  onChange: (area: Area) => void;
}): React.JSX.Element {
  return (
    <div className="zone-controls zone-controls-compact">
      <GeographySelector area={area} onChange={onChange} />
    </div>
  );
}
