import { test } from "node:test";
import assert from "node:assert/strict";
import { districtChatPath } from "../src/lib/district-chat.ts";
test("public district URLs normalize accents and preserve geographic identity", () => {
 assert.equal(districtChatPath("130111", "Víctor Larco Herrera", "Trujillo"), "/distritos/victor-larco-herrera-trujillo-130111");
 assert.notEqual(districtChatPath("150101", "Lima", "Lima"), districtChatPath("150102", "Lima", "Lima"));
 assert.equal(districtChatPath("150140", "Santa María del Mar", "Lima"), "/distritos/santa-maria-del-mar-lima-150140");
});
