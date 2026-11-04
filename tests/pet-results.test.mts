import test from "node:test";
import assert from "node:assert/strict";
import type { Incident } from "../src/lib/contracts.ts";
import { petDistance, petResults } from "../src/features/pets/pet-results.ts";

const origin = { latitude: -12.07, longitude: -77.06 };
function pet(id: string, overrides: Partial<Incident> = {}): Incident {
  return {
    id,
    type: "pet",
    description: "Gata gris con collar azul",
    ...origin,
    district: "Pueblo Libre",
    status: "active",
    verified: false,
    created_at: "2026-11-04T12:00:00Z",
    ...overrides,
  };
}
const options = {
  origin,
  radius: 2000,
  search: "",
  filter: "all" as const,
  sort: "nearby" as const,
};

test("nearby pets include a neighboring district and exclude distant or hidden reports", () => {
  const results = petResults(
    [
      pet("neighbor", {
        district: "Jesús María",
        latitude: origin.latitude + 0.005,
      }),
      pet("far", { latitude: origin.latitude + 0.025 }),
      pet("here"),
      pet("hidden", { status: "hidden" }),
      pet("other", { type: "fire" }),
    ],
    options,
  );
  assert.deepEqual(
    results.map(({ incident }) => incident.id),
    ["here", "neighbor"],
  );
  assert.equal(petDistance(origin, origin), 0);
  assert.ok(
    Math.abs(
      petDistance(origin, { ...origin, latitude: origin.latitude + 0.01 }) -
        1112,
    ) < 2,
  );
});

test("search matches accents and multiple terms while photo/contact filters use actual fields", () => {
  const items = [
    pet("photo", { media_id: "photo", district: "Jesús María" }),
    pet("contact", { contact_info: "Contacto público del autor" }),
    pet("blank", { contact_info: "  " }),
  ];
  assert.deepEqual(
    petResults(items, { ...options, search: "jesus gata" }).map(
      ({ incident }) => incident.id,
    ),
    ["photo"],
  );
  assert.deepEqual(
    petResults(items, { ...options, filter: "photo" }).map(
      ({ incident }) => incident.id,
    ),
    ["photo"],
  );
  assert.deepEqual(
    petResults(items, { ...options, filter: "contact" }).map(
      ({ incident }) => incident.id,
    ),
    ["contact"],
  );
});

test("recent sorting preserves resolved cases and does not mutate the source", () => {
  const items = [
    pet("older"),
    pet("resolved", { status: "resolved", created_at: "2026-11-04T13:00:00Z" }),
  ];
  assert.deepEqual(
    petResults(items, { ...options, sort: "recent" }).map(
      ({ incident }) => incident.id,
    ),
    ["resolved", "older"],
  );
  assert.equal(items[0].id, "older");
});
