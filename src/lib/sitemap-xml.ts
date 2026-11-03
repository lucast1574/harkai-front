export function xmlEscape(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );
}

export function sitemapXml(
  entries: { url: string; modified?: string }[],
  index = false,
): string {
  const root = index ? "sitemapindex" : "urlset";
  const tag = index ? "sitemap" : "url";
  return `<?xml version="1.0" encoding="UTF-8"?><${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(({ url, modified }) => `<${tag}><loc>${xmlEscape(url)}</loc>${modified && Number.isFinite(Date.parse(modified)) ? `<lastmod>${xmlEscape(modified)}</lastmod>` : ""}</${tag}>`).join("")}</${root}>`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
