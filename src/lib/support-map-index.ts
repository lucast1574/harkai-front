import type { SupportPlace } from "../features/support/contracts";

type Pixel = { x: number; y: number };
export type SupportMapGroup = {
  key: string;
  places: SupportPlace[];
  position: [number, number];
};
export type SupportMapIndex = Map<string, SupportMapGroup[]>;
const CELL_SIZE = 96;

// Rebuild only when data or zoom changes. Panning queries the existing cells,
// preserving group membership and positions even at the viewport edges.
export function createSupportMapIndex(
  places: SupportPlace[],
  zoom: number,
  project: (place: SupportPlace) => Pixel,
): SupportMapIndex {
  const cells = new Map<string, Map<string, SupportMapGroup>>();
  for (const place of places) {
    if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude))
      continue;
    const pixel = project(place);
    const cellKey = `${Math.floor(pixel.x / CELL_SIZE)}:${Math.floor(pixel.y / CELL_SIZE)}`;
    let cell = cells.get(cellKey);
    if (!cell) cells.set(cellKey, (cell = new Map()));
    const key = zoom >= 16 ? place.id : `${place.kind}:${cellKey}`;
    let group = cell.get(key);
    if (!group) {
      group = { key, places: [], position: [0, 0] };
      cell.set(key, group);
    }
    group.places.push(place);
    group.position[0] += place.latitude;
    group.position[1] += place.longitude;
  }
  const index: SupportMapIndex = new Map();
  for (const [key, cell] of cells) {
    const groups = [...cell.values()];
    for (const group of groups) {
      group.position[0] /= group.places.length;
      group.position[1] /= group.places.length;
    }
    index.set(key, groups);
  }
  return index;
}

export function visibleSupportGroups(
  index: SupportMapIndex,
  northwest: Pixel,
  southeast: Pixel,
): SupportMapGroup[] {
  const groups: SupportMapGroup[] = [];
  for (
    let x = Math.floor(northwest.x / CELL_SIZE);
    x <= Math.floor(southeast.x / CELL_SIZE);
    x++
  ) {
    for (
      let y = Math.floor(northwest.y / CELL_SIZE);
      y <= Math.floor(southeast.y / CELL_SIZE);
      y++
    ) {
      const cell = index.get(`${x}:${y}`);
      if (cell) groups.push(...cell);
    }
  }
  return groups;
}
