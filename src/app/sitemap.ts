import type { MetadataRoute } from "next";
import { publications } from "@/lib/server/publications";
import { chatDistricts } from "@/lib/server/district-chats";
import { districtChatPath } from "@/lib/district-chat";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result: MetadataRoute.Sitemap = [
    { url: "https://panel.harkai.lat/comunidad" },
    { url: "https://panel.harkai.lat/distritos" },
  ];
  for (const d of await chatDistricts())
    result.push({
      url: `https://panel.harkai.lat${districtChatPath(d.id, d.district, d.province)}`,
      lastModified: d.updated_at,
    });
  let cursor = "";
  do {
    const page = await publications(cursor);
    for (const i of page.items)
      result.push({
        url: `https://panel.harkai.lat/incidents/${i.id}`,
        lastModified: i.created_at,
      });
    cursor = page.next_cursor || "";
    if (result.length > 49999) throw new Error("Sitemap requires sharding");
  } while (cursor);
  return result;
}
