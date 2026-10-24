import type { MetadataRoute } from "next";
import { publications } from "@/lib/server/publications";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result: MetadataRoute.Sitemap = [
    { url: "https://panel.harkai.lat/comunidad" },
  ];
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
