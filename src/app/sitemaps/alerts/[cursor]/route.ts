import { publications } from "@/lib/server/publications";
import { PANEL } from "@/lib/public-seo";
import { sitemapXml, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cursor: string }> },
) {
  const { cursor } = await params;
  if (!/^(recent|[a-f0-9]{24})\.xml$/.test(cursor))
    return new Response(null, { status: 404 });
  const page = await publications(
    cursor === "recent.xml" ? "" : cursor.slice(0, -4),
  );
  return xmlResponse(
    sitemapXml(
      page.items
        .filter((i) => i.status !== "hidden")
        .map((i) => ({ url: `${PANEL}/incidents/${i.id}` })),
    ),
  );
  // No lastmod: the API exposes creation time, not the last edit/confirmation.
}
