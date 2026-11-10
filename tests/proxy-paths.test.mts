import assert from "node:assert/strict";
import test from "node:test";
import { backendPaths } from "../src/lib/server/proxy-paths.ts";

test("only a business owner checkout route is exposed through the web proxy", () => {
  assert.ok(backendPaths.test(`me/businesses/${"a".repeat(24)}/checkout`));
  for (const path of ["business-billing/webhook", "me/businesses/checkout", `me/businesses/${"a".repeat(24)}/checkout/admin`])
    assert.equal(backendPaths.test(path), false);
});

test("district chat supports feed, messages and replies through the web proxy", () => {
  const id = "a".repeat(24);
  for (const path of [
    "forum",
    `forum/${id}`,
    `forum/${id}/comments`,
    `forum/${id}/comments/${id}`,
  ])
    assert.ok(backendPaths.test(path), path);
});
test("chat routes do not admit arbitrary nested endpoints or malformed identifiers", () => {
  for (const path of [
    "forum/admin",
    "forum/../admin/users",
    "forum/" + "a".repeat(23),
    "forum/" + "a".repeat(24) + "/users",
    "forum/",
    "forum?ubigeo=150101",
  ])
    assert.equal(backendPaths.test(path), false, path);
});
