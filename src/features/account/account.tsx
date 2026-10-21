"use client";
import Link from "next/link";
import {
  MessageCircle,
  Bell,
  ShieldCheck,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { Notice } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "./auth-form";
import { Profile } from "./profile";
import { MobileReporting } from "./mobile-reporting";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Conversación vecinal en tiempo real",
    description:
      "Comenta los avisos de tu distrito, aporta contexto útil y mantente al tanto desde la web o tu celular.",
  },
  {
    icon: ShieldCheck,
    title: "Confirmación comunitaria",
    description:
      "Valida los reportes que presencies en tu zona para ayudar a tus vecinos a distinguir alertas reales.",
  },
  {
    icon: Bell,
    title: "Alertas según tu radio y prioridad",
    description:
      "Elige qué tipo de avisos quieres seguir y personaliza el radio de cobertura en metros alrededor tuyo.",
  },
];

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
    <div className="account-shell">
      <header className="account-hero">
        <div className="account-hero-copy">
          <span className="account-badge">
            <MapPin size={13} />
            CUENTA UNIFICADA WEB + MÓVIL
          </span>
          <h1>Tu comunidad empieza contigo.</h1>
          <p>
            Explora el mapa libremente o conecta tu cuenta para participar,
            confirmar reportes cercanos y configurar tus alertas en Lima, Callao
            y Trujillo.
          </p>
        </div>
        <Link className="account-map-pill" href="/dashboard">
          <span>Ir al mapa en vivo</span>
          <ArrowUpRight size={16} />
        </Link>
      </header>

      <div className="account-entry">
        <AuthForm />
        <div className="account-showcase">
          <section className="panel account-benefits-card">
            <span className="eyebrow">PARTICIPACIÓN VECINAL</span>
            <h2>Entérate, conversa y aporta contexto en tu zona.</h2>
            <div className="account-benefit-list">
              {FEATURES.map((item) => (
                <article key={item.title} className="account-benefit-item">
                  <span className="account-benefit-icon">
                    <item.icon size={19} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <MobileReporting />
        </div>
      </div>
    </div>
  );
}
