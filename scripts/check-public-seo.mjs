// Read-only audit against a running build. Never creates reports or messages.
import assert from "node:assert/strict";
const base = process.argv[2] || "http://localhost:3101";
const agent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
async function read(path) {
  const response = await fetch(`${base}${path}`, { headers: { "User-Agent": agent } });
  assert.equal(response.status, 200, path);
  return response.text();
}
const paths = new Set(["/distritos", "/comunidad"]);
for (const path of [...paths]) {
  const html = await read(path);
  for (const match of html.matchAll(/href="(\/(?:incidents|distritos)\/[^"?]+)"/g)) paths.add(match[1]);
}
for (const path of paths) {
  const html = await read(path);
  assert.match(html, /<h1[ >]/, path);
  assert.match(html, /rel="canonical"/, path);
  assert.match(html, /https:\/\/harkai.lat\//, path);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  assert.ok(schemas.length, path);
  assert.ok(schemas.some((s) => s["@graph"].some((n) => n["@type"] === "BreadcrumbList")), path);
  console.log(`PASS server HTML, canonical, JSON-LD: ${path}`);
}
const index = await read("/sitemap.xml");
assert.match(index, /<sitemapindex/);
for (const match of index.matchAll(/<loc>(.*?)<\/loc>/g)) {
  const path = new URL(match[1]).pathname;
  const xml = await read(path);
  assert.match(xml, /<urlset/);
  console.log(`PASS sitemap: ${path}`);
}
for (const path of ["/incidents/not-an-id", "/distritos/not-a-district", "/sitemaps/alerts/invalid.xml", "/comunidad?cursor=invalid"]) {
  const response = await fetch(`${base}${path}`, { headers: { "User-Agent": "Twitterbot" } });
  const html = await response.text();
  // Next can stream a not-found response; those must include noindex.
  assert.ok(response.status === 404 || /name="robots" content="noindex"/.test(html), path);
  console.log(`PASS invalid route excluded: ${path}`);
}
