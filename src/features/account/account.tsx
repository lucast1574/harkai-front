"use client";
import Link from "next/link";
import { MessageCircle, Bell, ShieldCheck } from "lucide-react";
import { Heading, Notice } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "./auth-form";
import { Profile } from "./profile";
import { MobileReporting } from "./mobile-reporting";
export function Account(): React.JSX.Element {
  const { user, loading, error, reload } = useAuth();
  if (loading) return <Notice>Cargando tu cuenta…</Notice>;
  if (error)
    return (
      <Notice error>
        {error}{" "}
        <button className="text-button" onClick={() => void reload()}>
          Reintentar
        </button>
      </Notice>
    );
  if (user) return <Profile key={user.id} />;
  return (
    <>
      <Heading
        eyebrow="TU ESPACIO EN HARKAI"
        title="Tu comunidad empieza contigo."
      >
        Una cuenta para la web y el móvil. Explora libremente o ingresa para
        participar.
      </Heading>
      <div className="account-entry">
        <AuthForm />
        <section className="account-welcome">
          <span className="eyebrow">MÁS CERCA DE TU ZONA</span>
          <h2>
            Entérate. Conversa.
            <br />
            Aporta contexto.
          </h2>
          <ul>
            <li>
              <MessageCircle size={20} />
              <span>
                <strong>Una conversación compartida</strong>Comenta los reportes
                desde web y móvil.
              </span>
            </li>
            <li>
              <ShieldCheck size={20} />
              <span>
                <strong>Confirma lo que conoces</strong>Otra persona puede
                confirmar un reporte.
              </span>
            </li>
            <li>
              <Bell size={20} />
              <span>
                <strong>Alertas según tus preferencias</strong>Elige tu zona,
                radio y notificaciones.
              </span>
            </li>
          </ul>
          <Link className="text-button" href="/dashboard">
            Seguir explorando el mapa ↗
          </Link>
        </section>
      </div>
      <MobileReporting />
    </>
  );
}
