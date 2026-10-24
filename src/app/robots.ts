import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/comunidad", "/incidents/", "/api/backend/media/"],
      disallow: ["/dashboard", "/api/", "/login"],
    },
    sitemap: "https://panel.harkai.lat/sitemap.xml",
  };
}
