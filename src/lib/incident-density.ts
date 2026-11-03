export const incidentColors: Record<string, string> = {
  crime: "#7e22ce",
  theft: "#7e22ce",
  extortion: "#7e22ce",
  kidnapping: "#7e22ce",
  violence: "#7e22ce",
  homicide: "#7e22ce",
  fire: "#ea580c",
  emergency: "#dc3545",
  crash: "#2563eb",
  pet: "#795548",
  place: "#25865b",
};
export function incidentColor(type: string): string {
  return incidentColors[type] || "#547f96";
}
export type DensityPoint = { x: number; y: number; type: string };
export type DensitySpot = DensityPoint & {
  count: number;
  radius: number;
  opacity: number;
  color: string;
};
/** Absolute sample counts, never normalize a lone report to maximum intensity. */
export function densitySpots(
  points: DensityPoint[],
  cellSize = 24,
): DensitySpot[] {
  const cells = new Map<string, DensityPoint & { count: number }>();
  for (const p of points) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    const key = `${p.type}:${Math.floor(p.x / cellSize)}:${Math.floor(p.y / cellSize)}`;
    const c = cells.get(key);
    if (c) {
      c.x += p.x;
      c.y += p.y;
      c.count++;
    } else cells.set(key, { ...p, count: 1 });
  }
  return [...cells.values()].map((c) => ({
    ...c,
    x: c.x / c.count,
    y: c.y / c.count,
    color: incidentColor(c.type),
    radius: Math.min(42, 13 + 5 * Math.sqrt(c.count - 1)),
    opacity: Math.min(0.85, 0.48 + 0.08 * Math.log2(c.count)),
  }));
}
