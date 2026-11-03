import type { Metadata } from "next";

export const HOME = "https://harkai.lat/";
export const PANEL = "https://panel.harkai.lat";
export const organization = {
  "@type": "Organization",
  "@id": `${HOME}#organization`,
  name: "Harkai",
  url: HOME,
  logo: `${HOME}icon.png`,
};
export const website = {
  "@type": "WebSite",
  "@id": `${PANEL}/#website`,
  name: "Harkai · Comunidad vecinal del Perú",
  url: PANEL,
  inLanguage: "es-PE",
  publisher: { "@id": organization["@id"] },
};

export function excerpt(text: string, length = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length - 1).replace(/\s+\S*$/, "")}…`;
}

export function publicMetadata({
  title,
  description,
  path,
  image,
  publishedTime,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  publishedTime?: string;
}): Metadata {
  const url = new URL(path, PANEL).href;
  const socialImage = image || `${HOME}harkai-social.png`;
  return {
    title,
    description: excerpt(description),
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: `${title} · Harkai`,
      description: excerpt(description, 200),
      url,
      siteName: "Harkai",
      locale: "es_PE",
      ...(publishedTime
        ? { type: "article" as const, publishedTime }
        : { type: "website" as const }),
      images: [{ url: socialImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Harkai`,
      description: excerpt(description),
      images: [socialImage],
    },
  };
}

export function breadcrumb(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Harkai", url: HOME }, ...items].map(
      (item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      }),
    ),
  };
}

export function jsonLd(nodes: object[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [organization, website, ...nodes],
  }).replace(/</g, "\\u003c");
}
