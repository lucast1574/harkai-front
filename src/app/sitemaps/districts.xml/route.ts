import { chatDistricts } from "@/lib/server/district-chats";
import { districtChatPath } from "@/lib/district-chat";
import { PANEL } from "@/lib/public-seo";
import { sitemapXml, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";
export async function GET() {
  const districts = await chatDistricts();
  return xmlResponse(
    sitemapXml([
      { url: `${PANEL}/comunidad` },
      { url: `${PANEL}/distritos` },
      ...districts.map((d) => ({
        url: `${PANEL}${districtChatPath(d.id, d.district, d.province)}`,
        modified: d.updated_at,
      })),
    ]),
  );
}
