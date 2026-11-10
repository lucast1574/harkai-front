import Link from "next/link";
import { Store, Users as UsersIcon, Wallet, Building2 } from "lucide-react";
import { MunicipalInbox } from "@/features/municipal/municipal-inbox";
import { Access } from "@/components/access";
import { Heading, Notice } from "@/components/ui";
import { BusinessReview } from "@/features/business/business-review";
import { Users } from "@/features/admin/users";
import styles from "./page.module.css";

const sections = [
  { id: "municipal", label: "Municipalidades", icon: Building2 },
  { id: "businesses", label: "Negocios", icon: Store },
  { id: "users", label: "Usuarios", icon: UsersIcon },
  { id: "revenue", label: "Ganancias", icon: Wallet },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ section?: string | string[] }>;
}): Promise<React.JSX.Element> {
  const requested = (await searchParams).section;
  const section =
    sections.find((item) => item.id === requested)?.id || "businesses";
  return (
    <Access roles={["admin"]}>
      <Heading title="Administración">
        Solicitudes municipales, negocios, usuarios y ganancias en un solo
        lugar.
      </Heading>
      <nav className={styles.sections} aria-label="Secciones de administración">
        {sections.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/admin?section=${item.id}`}
            scroll={false}
            aria-current={section === item.id ? "page" : undefined}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.content}>
        {section === "municipal" && <MunicipalInbox />}
        {section === "businesses" && <BusinessReview embedded />}
        {section === "users" && <Users embedded />}
        {section === "revenue" && (
          <section className="panel">
            <h2>Ganancias</h2>
            <Notice>
              Los nuevos negocios aprobados se activan con un pago único de
              US$5 por punto, procesado por Stripe desde la web.
            </Notice>
            <p className="muted">
              El detalle de pagos, comisiones, reembolsos y depósitos se consulta
              en la cuenta de Stripe configurada para Harkai. Los negocios con
              acceso gratuito anterior conservan ese acceso.
            </p>
          </section>
        )}
      </div>
    </Access>
  );
}
