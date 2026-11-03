import assert from "node:assert/strict";
import test from "node:test";
import { backendPaths } from "../src/lib/server/proxy-paths.ts";

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
