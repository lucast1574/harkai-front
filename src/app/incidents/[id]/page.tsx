import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  publication,
  title,
  photo,
  labels,
  publicationTime,
} from "@/lib/server/publications";
import { dateLabel, reportURL } from "@/lib/contracts";
import { Comments } from "@/features/community/comments";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const i = await publication((await params).id);
  const name = title(i);
  const image = photo(i);
  const url = reportURL(i.id);
  return {
    title: name,
    description: i.description.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: name,
      description: i.description.slice(0, 200),
      url,
      locale: "es_PE",
      publishedTime: i.created_at,
      images: image ? [{ url: image, alt: name }] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: name,
      description: i.description.slice(0, 160),
      images: image ? [image] : [],
    },
  };
}
export default async function Page({
  params,
}: Props): Promise<React.JSX.Element> {
  const i = await publication((await params).id);
  const image = photo(i);
  const url = reportURL(i.id);
  const schema = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: title(i),
    articleBody: i.description,
    datePublished: i.created_at,
    url,
    mainEntityOfPage: url,
    inLanguage: "es-PE",
    image: image ? [image] : undefined,
    author: { "@type": "Organization", name: "Comunidad Harkai" },
    publisher: {
      "@type": "Organization",
      name: "Harkai",
      url: "https://panel.harkai.lat",
    },
    contentLocation: {
      "@type": "Place",
      name: [i.district, i.city, "Perú"].filter(Boolean).join(", "),
    },
  };
  const now = await publicationTime();
  const active =
    i.status === "active" &&
    now - Date.parse(i.created_at) < 3 * 3600000 &&
    (!i.expires_at || Date.parse(i.expires_at) > now);
  return (
    <article className="publication">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/comunidad" className="eyebrow">
        Comunidad / {labels[i.type] || "Reporte"}
      </Link>
      <h1>{title(i)}</h1>
      <p className="publication-meta">
        <time dateTime={i.created_at}>{dateLabel(i.created_at)}</time> ·{" "}
        {i.verified
          ? "Confirmado por vecinos"
          : "Reporte vecinal sin verificar"}
      </p>
      {image && (
        <Image
          unoptimized
          width={1200}
          height={800}
          className="publication-photo"
          src={image}
          alt={`Imagen adjunta al reporte: ${title(i)}`}
        />
      )}
      <p className="publication-body">{i.description}</p>
      <div className="publication-status">
        {active
          ? "Este reporte está visible en el mapa durante tres horas."
          : "Este punto ya no está activo en el mapa. La publicación y la conversación permanecen disponibles."}
      </div>
      <p className="publication-meta">
        Información aportada por la comunidad. No constituye una confirmación
        oficial de los hechos.
      </p>
      <Link href={`/dashboard?incident=${i.id}`} className="button">
        Ver zona en el mapa
      </Link>
      <Comments incidentId={i.id} />
    </article>
  );
}
