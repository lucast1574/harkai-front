import { test } from "node:test";
import assert from "node:assert/strict";
import { publicMetadata, jsonLd, breadcrumb, excerpt } from "../src/lib/public-seo.ts";
import { sitemapXml } from "../src/lib/sitemap-xml.ts";

test("public pagination stays self-canonical and share cards have a fallback", () => {
  const meta = publicMetadata({ title: "Chat de Lima", description: "Conversaciones públicas", path: "/distritos/lima-lima-150101?cursor=abc" });
  assert.equal(meta.alternates?.canonical, "https://panel.harkai.lat/distritos/lima-lima-150101?cursor=abc");
  assert.equal(meta.twitter?.card, "summary_large_image");
  assert.match(JSON.stringify(meta.openGraph), /harkai-social.png/);
});
test("UGC cannot escape JSON-LD scripts and anonymous authors remain anonymous", () => {
  const value = jsonLd([{ "@type": "DiscussionForumPosting", text: '</script><script>alert("x")</script>', author: { "@type": "Person", name: "Vecino anónimo" } }]);
  assert.ok(!value.includes("<"));
  assert.equal(JSON.parse(value)["@graph"][2].text, '</script><script>alert("x")</script>');
});
test("breadcrumbs lead back to the main Harkai website", () => {
  const items = breadcrumb([{ name: "Alertas", url: "https://panel.harkai.lat/comunidad" }]).itemListElement;
  assert.equal(items[0].item, "https://harkai.lat/");
  assert.equal(items[1].position, 2);
});
test("sitemaps escape XML and omit invalid or invented modification dates", () => {
  const xml = sitemapXml([{ url: 'https://panel.harkai.lat/a?x=1&y="2"', modified: "invalid" }]);
  assert.match(xml, /&amp;y=&quot;2&quot;/);
  assert.ok(!xml.includes("lastmod"));
  assert.match(sitemapXml([{ url: "https://panel.harkai.lat/sitemaps/districts.xml" }], true), /<sitemapindex/);
});
test("descriptions collapse whitespace and respect snippet length", () => {
  assert.equal(excerpt("  Alerta\n en   Lima  "), "Alerta en Lima");
  assert.ok(excerpt("Vecinos de Lima ".repeat(30)).length <= 160);
});
