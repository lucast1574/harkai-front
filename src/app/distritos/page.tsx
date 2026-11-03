import type { Metadata } from "next";
import Link from "next/link";
import { chatDistricts } from "@/lib/server/district-chats";
import { districtChatPath } from "@/lib/district-chat";
import { JoinHarkai } from "@/components/join-harkai";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Chats de vecinos por distrito del Perú",
  description:
    "Lee las conversaciones públicas de vecinos de los distritos del Perú. Novedades, preguntas y vida de barrio en Harkai.",
  alternates: { canonical: "https://panel.harkai.lat/distritos" },
};
export default async function Page(): Promise<React.JSX.Element> {
  const items = await chatDistricts();
  return (
    <section className="publication">
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
