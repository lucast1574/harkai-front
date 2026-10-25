"use client";
import { useEffect } from "react";
import { DomUtil } from "leaflet";
import { useMap } from "react-leaflet";
import type { Incident } from "@/lib/contracts";
import { densitySpots } from "@/lib/incident-density";

export function IncidentHeatLayer({
  incidents,
}: {
  incidents: Incident[];
}): null {
  const map = useMap();
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "incident-heat-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    map.getPane("overlayPane")?.appendChild(canvas);
    let frame = 0;
    const draw = (): void => {
      const size = map.getSize(),
        margin = 48;
      const width = size.x + margin * 2,
        height = size.y + margin * 2;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      DomUtil.setPosition(
        canvas,
        map.containerPointToLayerPoint([-margin, -margin]),
      );
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      const projected = incidents
        .filter(
          (i) =>
            Number.isFinite(i.latitude) &&
            Number.isFinite(i.longitude) &&
            Math.abs(i.latitude) <= 85 &&
            Math.abs(i.longitude) <= 180,
        )
        .map((i) => {
          const p = map.latLngToContainerPoint([i.latitude, i.longitude]);
          return { x: p.x + margin, y: p.y + margin, type: i.type };
        })
        .filter((p) => p.x >= 0 && p.y >= 0 && p.x <= width && p.y <= height);
      for (const p of densitySpots(projected)) {
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius,
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.25, p.color);
        gradient.addColorStop(1, `${p.color}00`);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = gradient;
        ctx.fillRect(
          p.x - p.radius,
          p.y - p.radius,
          p.radius * 2,
          p.radius * 2,
        );
      }
      canvas.style.visibility = "visible";
    };
    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    const hide = (): void => {
      canvas.style.visibility = "hidden";
    };
    map.on("moveend zoomend resize viewreset", schedule);
    map.on("zoomstart", hide);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      map.off("moveend zoomend resize viewreset", schedule);
      map.off("zoomstart", hide);
      canvas.remove();
    };
  }, [map, incidents]);
  return null;
}
