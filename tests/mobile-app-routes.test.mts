import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldInviteToMobileApp } from "../src/lib/mobile-app-routes.ts";
test("public report articles remain readable on mobile", () => {
  for (const path of ["/incidents/0123456789abcdef01234567", "/incidents/report-slug", "/incidents/report-slug/"]) assert.equal(shouldInviteToMobileApp(path), false, path);
});
test("every other panel page invites mobile visitors to the app", () => {
  for (const path of ["/", "/login", "/comunidad", "/eliminar-cuenta", "/incidents", "/incidents/123/extra", "/dashboard", "/dashboard/help", "/dashboard/incidents", "/dashboard/archive", "/dashboard/profile", "/dashboard/tickets", "/dashboard/tickets/admin", "/dashboard/incidents/reports", "/dashboard/businesses", "/dashboard/gov", "/dashboard/users", "/dashboard/pets", "/dashboard/report", "/dashboard/history", "/dashboard/news", "/dashboard/places", "/dashboard/support"]) assert.equal(shouldInviteToMobileApp(path), true, path);
});
