import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldInviteToMobileApp } from "../src/lib/mobile-app-routes.ts";
test("business registration remains available in the mobile browser", () => {
  assert.equal(shouldInviteToMobileApp("/dashboard/my-businesses"), false);
  assert.equal(shouldInviteToMobileApp("/dashboard/my-businesses/"), false);
});
test("public report articles remain readable on mobile", () => {
  for (const path of [
    "/incidents/0123456789abcdef01234567",
    "/incidents/report-slug",
    "/incidents/report-slug/",
  ])
    assert.equal(shouldInviteToMobileApp(path), false, path);
});
test("every other panel page invites mobile visitors to the app", () => {
  for (const path of [
    "/",
    "/eliminar-cuenta",
    "/incidents",
    "/incidents/123/extra",
    "/dashboard",
    "/dashboard/help",
    "/dashboard/incidents",
    "/dashboard/archive",
    "/dashboard/profile",
    "/dashboard/tickets",
    "/dashboard/tickets/admin",
    "/dashboard/incidents/reports",
    "/dashboard/businesses",
    "/dashboard/gov",
    "/dashboard/users",
    "/dashboard/pets",
    "/dashboard/history",
    "/dashboard/news",
    "/dashboard/places",
    "/dashboard/support",
  ])
    assert.equal(shouldInviteToMobileApp(path), true, path);
});

test("public district conversations, login and reporting downloads remain accessible on mobile", () => {
  for (const path of [
    "/distritos",
    "/distritos/san-borja-lima-150130",
    "/comunidad",
    "/login",
    "/dashboard/report",
  ])
    assert.equal(shouldInviteToMobileApp(path), false, path);
});
