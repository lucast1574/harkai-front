import { test } from "node:test";
import assert from "node:assert/strict";
import { mobileAppPaths } from "../src/lib/mobile-app-routes.ts";
test("only the six requested pages invite mobile visitors to the app", () => {
  assert.deepEqual([...mobileAppPaths].sort(), ["/dashboard", "/dashboard/help", "/dashboard/incidents", "/dashboard/archive", "/dashboard/profile", "/dashboard/tickets"].sort());
  for (const route of ["/login", "/comunidad", "/eliminar-cuenta", "/incidents/123", "/dashboard/tickets/admin", "/dashboard/incidents/reports", "/dashboard/businesses", "/dashboard/gov", "/dashboard/users", "/dashboard/pets", "/dashboard/report", "/dashboard/history", "/dashboard/news", "/dashboard/places", "/dashboard/support"]) assert.equal(mobileAppPaths.has(route), false, route);
});
