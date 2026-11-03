import type { Metadata } from "next";
import { AuthForm } from "@/features/account/auth-form";
export const metadata: Metadata = {
  title: "Ingresa a Harkai",
  robots: { index: false, follow: true },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}): Promise<React.JSX.Element> {
  const { next } = await searchParams;
  const target =
    next &&
    /^\/(?:distritos(?:\/[-a-z0-9]+)?|incidents\/[a-f0-9]{24}|dashboard(?:\/[-a-z0-9]+)*)(?:#[a-z0-9-]+)?$/.test(
      next,
    )
      ? next
      : "/dashboard/profile";
  return (
    <section className="publication">
      <h1>Vuelve a la conversación.</h1>
      <p>
        Ingresa o crea tu cuenta gratis. Tus mensajes aparecen como vecino
        anónimo.
      </p>
      <AuthForm redirectTo={target} />
    </section>
  );
}
