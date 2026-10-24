import type { Metadata } from "next";
import Link from "next/link";
import { publications, title } from "@/lib/server/publications";
import { dateLabel } from "@/lib/contracts";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Reportes de la comunidad en Perú",
  description:
    "Lo que comparten los vecinos en Perú: alertas locales, mascotas, emergencias y conversaciones de la comunidad.",
  alternates: { canonical: "https://panel.harkai.lat/comunidad" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}): Promise<React.JSX.Element> {
  const { cursor } = await searchParams;
  const page = await publications(cursor);
  return (
    <section className="publication">
      <p className="eyebrow">El pulso de tu comunidad</p>
      <h1>Lo que pasa cerca queda aquí.</h1>
      <p>
        Reportes de vecinos de Perú. Una conversación que sigue, incluso cuando
        el punto deja el mapa.
      </p>
      <div className="publication-feed">
        {page.items.map((i) => (
          <article key={i.id}>
            <p className="publication-meta">
              <time dateTime={i.created_at}>{dateLabel(i.created_at)}</time> ·{" "}
              {i.verified ? "Confirmado por vecinos" : "Sin verificar"}
            </p>
            <h2>
              <Link href={`/incidents/${i.id}`}>{title(i)}</Link>
            </h2>
            <p>{i.description.slice(0, 240)}</p>
            <Link href={`/incidents/${i.id}`}>Leer y conversar</Link>
          </article>
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
