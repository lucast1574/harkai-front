"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import type { GeographicDistrict } from "@/lib/contracts";

/** Keep neighbouring streets visible, while softly isolating the selected area. */
export function DistrictMask({
  geography,
}: {
  geography: GeographicDistrict;
}): React.JSX.Element {
  const map = useMap();
  const overlay = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const polygons =
      geography.geometry.type === "Polygon"
        ? [geography.geometry.coordinates]
        : geography.geometry.coordinates;
    let frame = 0;
    const draw = (): void => {
      frame = 0;
      if (!overlay.current) return;
      const size = map.getSize();
      const origin = map.containerPointToLayerPoint([0, 0]);
      Object.assign(overlay.current.style, {
        left: `${origin.x}px`,
        top: `${origin.y}px`,
        width: `${size.x}px`,
        height: `${size.y}px`,
      });
      const outside = `M-10 -10H${size.x + 10}V${size.y + 10}H-10Z`;
      const holes = polygons
        .flatMap((polygon) =>
          polygon.map(
            (ring) =>
              ring
                .map(([lng, lat], index) => {
                  const p = map.latLngToContainerPoint([lat, lng]);
                  return `${index ? "L" : "M"}${p.x} ${p.y}`;
                })
                .join("") + "Z",
          ),
        )
        .join("");
      overlay.current.style.clipPath = `path(evenodd, '${outside}${holes}')`;
    };
    const schedule = (): void => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    draw();
    map.on("move zoom resize", schedule);
    return () => {
      map.off("move zoom resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [map, geography]);
  return createPortal(
    <div ref={overlay} className="district-surroundings" aria-hidden="true" />,
    map.getPane("overlayPane")!,
  );
}
