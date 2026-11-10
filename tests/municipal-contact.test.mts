import test from "node:test";
import assert from "node:assert/strict";
import { shouldInviteToMobileApp } from "../src/lib/mobile-app-routes.ts";
import { backendPaths } from "../src/lib/server/proxy-paths.ts";
import { submissionFor } from "../src/features/tickets/types.ts";

test("municipal contact works in mobile browsers without installing the app", () => {
  assert.equal(shouldInviteToMobileApp("/municipalidades"), false);
  assert.equal(shouldInviteToMobileApp("/municipalidades/"), false);
  assert.ok(backendPaths.test("municipal-inquiries"));
  assert.equal(backendPaths.test("municipal-inquiries/admin"), false);
});
test("retries keep the municipal receipt key until the contact changes", () => {
  const first = submissionFor(null, "contact one", () => "request-one");
  assert.equal(
    submissionFor(first, "contact one", () => "duplicate"),
    first,
  );
  assert.deepEqual(
    submissionFor(first, "contact two", () => "request-two"),
    { key: "request-two", payload: "contact two" },
  );
});
