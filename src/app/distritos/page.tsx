import {
  publicMetadata,
  jsonLd,
  breadcrumb,
  website,
  PANEL,
} from "@/lib/public-seo";
import { PublicBreadcrumbs } from "@/components/public-breadcrumbs";
import type { Metadata } from "next";
import Link from "next/link";
import { chatDistricts } from "@/lib/server/district-chats";
import { districtChatPath } from "@/lib/district-chat";
import { JoinHarkai } from "@/components/join-harkai";
export const dynamic = "force-dynamic";
export const metadata: Metadata = publicMetadata({
  title: "Chats vecinales por distrito del Perú",
  description:
    "Descubre qué comentan los vecinos de tu distrito en Harkai. Conversaciones públicas sobre novedades, seguridad y vida de barrio en Perú. Lee sin iniciar sesión.",
  path: "/distritos",
});
export default async function Page(): Promise<React.JSX.Element> {
  const items = await chatDistricts();
  return (
    <section className="publication">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            {
              "@type": "CollectionPage",
              name: "Chats vecinales por distrito del Perú",
              url: `${PANEL}/distritos`,
              isPartOf: { "@id": website["@id"] },
              mainEntity: {
                "@type": "ItemList",
                itemListElement: items.map((d, n) => ({
                  "@type": "ListItem",
                  position: n + 1,
                  name: `${d.district}, ${d.province}`,
                  url: `${PANEL}${districtChatPath(d.id, d.district, d.province)}`,
                })),
              },
            },
            breadcrumb([
              { name: "Chats por distrito", url: `${PANEL}/distritos` },
            ]),
          ]),
        }}
      />
      <PublicBreadcrumbs section="Chats por distrito" href="/distritos" />
      <span className="eyebrow">CONVERSACIONES VECINALES</span>
      <h1>Un chat para cada distrito.</h1>
      <p>
        Lee lo que comparten los vecinos. Cada distrito aparece aquí cuando
        empieza su primera conversación.
      </p>
      <div className="district-chat-directory">
        {items.map((d) => (
          <Link
            key={d.id}
            href={districtChatPath(d.id, d.district, d.province)}
          >
            <h2>{d.district}</h2>
            <p>
              {d.province} · {d.messages}{" "}
              {d.messages === 1 ? "mensaje" : "mensajes"}
            </p>
            <span>Ver conversación →</span>
          </Link>
        ))}
      </div>
      {!items.length && (
        <p>
          Las primeras conversaciones empiezan contigo.{" "}
          <Link href="/dashboard/incidents">Ir al chat de mi distrito</Link>
        </p>
      )}
      <JoinHarkai />
    </section>
  );
}
