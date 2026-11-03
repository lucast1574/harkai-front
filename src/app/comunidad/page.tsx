import { publicMetadata, jsonLd, breadcrumb, website } from "@/lib/public-seo";
import { PublicBreadcrumbs } from "@/components/public-breadcrumbs";
import type { Metadata } from "next";
import Link from "next/link";
import { publications } from "@/lib/server/publications";
import { PublicationCard } from "@/components/publication-card";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}): Promise<Metadata> {
  const { cursor } = await searchParams;
  return publicMetadata({
    title: cursor
      ? "Alertas vecinales anteriores en Perú"
      : "Alertas vecinales y seguridad en Perú",
    description:
      "Reportes de vecinos sobre seguridad, robos, incendios, emergencias, accidentes y mascotas en Perú. Consulta el lugar, la fecha y el estado de cada alerta en Harkai.",
    path: `/comunidad${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
  });
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}): Promise<React.JSX.Element> {
  const { cursor } = await searchParams;
  const page = await publications(cursor);
  return (
    <section className="publication">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            {
              "@type": "CollectionPage",
              name: "Alertas vecinales del Perú",
              url: `https://panel.harkai.lat/comunidad${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
              isPartOf: { "@id": website["@id"] },
              mainEntity: {
                "@type": "ItemList",
                itemListElement: page.items.map((i, n) => ({
                  "@type": "ListItem",
                  position: n + 1,
                  url: `https://panel.harkai.lat/incidents/${i.id}`,
                  name: i.description.slice(0, 110),
                })),
              },
            },
            breadcrumb([
              {
                name: "Alertas vecinales",
                url: "https://panel.harkai.lat/comunidad",
              },
            ]),
          ]),
        }}
      />
      <PublicBreadcrumbs section="Alertas vecinales" href="/comunidad" />
      <p className="eyebrow">El pulso de tu comunidad</p>
      <h1>Alertas vecinales en Perú.</h1>
      <p>
        Reportes de vecinos de Perú. Una conversación que sigue, incluso cuando
        el punto deja el mapa.
      </p>
      <Link className="button secondary" href="/distritos">
        Leer los chats por distrito
      </Link>
      {cursor && <Link href="/comunidad">Volver a las alertas recientes</Link>}
      <div className="publication-feed">
        {page.items.map((i) => (
          <PublicationCard key={i.id} incident={i} />
        ))}
      </div>
      {!page.items.length && (
        <p>
          La comunidad aún no tiene publicaciones. Los reportes se crean desde
          la app de Harkai.
        </p>
      )}
      {page.next_cursor && (
        <Link href={`/comunidad?cursor=${page.next_cursor}`} rel="next">
          Publicaciones anteriores
        </Link>
      )}
    </section>
  );
}
