import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect, notFound } from "next/navigation";
import { districtMessages } from "@/lib/server/district-chats";
import { districtChatPath } from "@/lib/district-chat";
import { PublicDistrictChat } from "@/features/community/public-district-chat";
import { JoinHarkai } from "@/components/join-harkai";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cursor?: string }>;
};
async function content(props: Props) {
  const { slug } = await props.params;
  const { cursor = "" } = await props.searchParams;
  const id = slug.match(/-(\d{6})$/)?.[1];
  if (!id) notFound();
  const page = await districtMessages(id, cursor);
  const first = page.items[0];
  const path = districtChatPath(id, first.district, first.province);
  if (`/distritos/${slug}` !== path)
    permanentRedirect(`${path}${cursor ? `?cursor=${cursor}` : ""}`);
  return { page, first, id, path, cursor };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { first, path, cursor } = await content(props);
  const title = `Chat de ${first.district}, ${first.province}: conversaciones de vecinos`;
  const description = `Lee qué comentan los vecinos de ${first.district}, ${first.province}, Perú. Novedades y conversaciones anónimas del distrito. Entra gratis para participar.`;
  const url = `https://panel.harkai.lat${path}${cursor ? `?cursor=${cursor}` : ""}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, type: "website", locale: "es_PE" },
    twitter: { card: "summary", title, description },
  };
}
export default async function Page(props: Props): Promise<React.JSX.Element> {
  const { page, first, id, path, cursor } = await content(props);
  const url = `https://panel.harkai.lat${path}${cursor ? `?cursor=${cursor}` : ""}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        url,
        name: `Chat de ${first.district}, ${first.province}`,
        inLanguage: "es-PE",
        mainEntity: page.items.map((item) => ({
          "@type": "DiscussionForumPosting",
          "@id": `${url}#mensaje-${item.id}`,
          url: `${url}#mensaje-${item.id}`,
          headline: item.body.slice(0, 110),
          text: item.body,
          datePublished: item.created_at,
          author: { "@type": "Person", name: "Vecino anónimo" },
          contentLocation: {
            "@type": "Place",
            name: `${item.district}, ${item.province}, Perú`,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Chats por distrito",
            item: "https://panel.harkai.lat/distritos",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: first.district,
            item: `https://panel.harkai.lat${path}`,
          },
        ],
      },
    ],
  };
  return (
    <article className="publication public-district-chat">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/distritos" className="eyebrow">
        CHATS DE VECINOS DEL PERÚ
      </Link>
      <h1>El chat de {first.district}</h1>
      <p className="publication-meta">
        {first.province}, Perú · Conversación pública y anónima
      </p>
      <p>
        Las preguntas, novedades y conversaciones de los vecinos de{" "}
        {first.district}. Puedes leer sin cuenta, estés donde estés. Para
        comentar, inicia sesión: tu nombre y foto no se muestran.
      </p>
      {cursor && <Link href={path}>Volver a los mensajes recientes</Link>}
      <PublicDistrictChat
        items={page.items}
        districtId={id}
        district={first.district}
      />
      {page.next_cursor && (
        <Link
          className="button secondary"
          href={`${path}?cursor=${page.next_cursor}`}
          rel="next"
        >
          Mensajes anteriores
        </Link>
      )}
      <JoinHarkai />
    </article>
  );
}
