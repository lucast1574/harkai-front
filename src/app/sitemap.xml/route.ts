import { publications } from "@/lib/server/publications";
import { PANEL } from "@/lib/public-seo";
import { sitemapXml, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";
// Each alert sitemap contains one API page (100 URLs), rather than one XML
// file that fails at 50,000 entries. Cursor boundaries survive new reports.
export async function GET() {
  const entries = [{ url: `${PANEL}/sitemaps/districts.xml` }];
  const seen = new Set<string>();
  let cursor = "";
  do {
    if (seen.has(cursor)) throw new Error("Repeated publication cursor");
    seen.add(cursor);
    const page = await publications(cursor);
    if (page.items.length)
      entries.push({
        url: `${PANEL}/sitemaps/alerts/${cursor || "recent"}.xml`,
      });
    cursor = page.next_cursor || "";
  } while (cursor);
  return xmlResponse(sitemapXml(entries, true));
}
