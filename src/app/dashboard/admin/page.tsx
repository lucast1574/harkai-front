import Link from "next/link";
import { Store, Users as UsersIcon, Wallet } from "lucide-react";
import { Access } from "@/components/access";
import { Heading, Notice } from "@/components/ui";
import { BusinessReview } from "@/features/business/business-review";
import { Users } from "@/features/admin/users";
import styles from "./page.module.css";

const sections = [
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
        Negocios, usuarios y ganancias en un solo lugar.
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
        {section === "businesses" && <BusinessReview embedded />}
        {section === "users" && <Users embedded />}
        {section === "revenue" && (
          <section className="panel">
            <h2>Ganancias</h2>
            <Notice>
              El registro de negocios es gratuito por ahora. No hay cobros
              activos.
            </Notice>
            <p className="muted">
              Los ingresos estarán disponibles cuando se habiliten los pagos con
              Stripe.
            </p>
          </section>
        )}
      </div>
    </Access>
  );
}
