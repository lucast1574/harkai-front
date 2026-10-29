import test from "node:test";
import assert from "node:assert/strict";
import {
  createSupportMapIndex,
  visibleSupportGroups,
} from "../src/lib/support-map-index.ts";
import type { SupportPlace } from "../src/features/support/contracts.ts";

function place(
  id: string,
  kind: SupportPlace["kind"],
  x: number,
  y: number,
): SupportPlace {
  return {
    id,
    kind,
    latitude: y,
    longitude: x,
    name: id,
    address: "",
    district: "",
    source_url: "",
    location_source_url: "",
    reviewed_at: "",
    city: "lima",
  };
}
const project = (p: SupportPlace) => ({ x: p.longitude, y: p.latitude });

test("panning reuses complete groups and their coordinates without reprojecting places", () => {
  let projections = 0;
  const places = [
    place("a", "hospital", 80, 10),
    place("b", "hospital", 90, 10),
    place("c", "police", 90, 10),
    place("d", "hospital", 900, 10),
  ];
  const index = createSupportMapIndex(places, 14, (p) => {
    projections++;
    return project(p);
  });
  const first = visibleSupportGroups(index, { x: 0, y: 0 }, { x: 85, y: 50 });
  const second = visibleSupportGroups(index, { x: 10, y: 0 }, { x: 95, y: 50 });
  assert.equal(first.length, 2);
  assert.equal(first[0], second[0]);
  assert.equal(first[0].position, second[0].position);
  assert.equal(first[0].places.length, 2);
  assert.deepEqual(first[0].position, [10, 85]);
  assert.equal(projections, places.length);
  assert.ok(!first.some((g) => g.places.some((p) => p.id === "d")));
});

test("zooming in exposes each place and replacing the data removes stale places", () => {
  const places = [
    place("a", "hospital", 10, 10),
    place("b", "hospital", 11, 10),
  ];
  const bounds = [
    { x: 0, y: 0 },
    { x: 50, y: 50 },
  ] as const;
  assert.equal(
    visibleSupportGroups(createSupportMapIndex(places, 14, project), ...bounds)
      .length,
    1,
  );
  assert.equal(
    visibleSupportGroups(createSupportMapIndex(places, 16, project), ...bounds)
      .length,
    2,
  );
  assert.deepEqual(
    visibleSupportGroups(createSupportMapIndex([], 16, project), ...bounds),
    [],
  );
});

test("negative pixel cells work and invalid coordinates cannot enter the map index", () => {
  const index = createSupportMapIndex(
    [
      place("a", "fire_station", -10, -10),
      place("invalid", "hospital", NaN, 10),
    ],
    14,
    project,
  );
  const groups = visibleSupportGroups(
    index,
    { x: -50, y: -50 },
    { x: 0, y: 0 },
  );
  assert.equal(groups.length, 1);
  assert.equal(groups[0].places[0].id, "a");
});
