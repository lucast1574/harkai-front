"use client";
import { CoverageNotice } from "@/features/support/coverage-notice";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  Map,
  BarChart3,
  Users,
  Menu,
  X,
  Wallet,
  MessageCircle,
  History,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Notice } from "./ui";
const navigation = [
  {
    href: "/dashboard",
    label: "Mapa de mi zona",
    icon: Map,
    section: "EXPLORAR",
  },
  { href: "/dashboard/help", label: "Ayuda y orientación", icon: LifeBuoy },
  { href: "/dashboard/incidents", label: "Comunidad", icon: MessageCircle },
  {
    href: "/dashboard/archive",
    label: "Historial de la ciudad",
    icon: History,
  },
  {
    href: "/dashboard/gov",
    label: "Gestión municipal",
    icon: BarChart3,
    institutional: true,
    section: "GESTIÓN",
  },
  {
    href: "/dashboard/users",
    label: "Usuarios y roles",
    icon: Users,
    admin: true,
  },
  { href: "/dashboard/revenue", label: "Ganancias", icon: Wallet, admin: true },
];
export function Shell({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { user, error } = useAuth();
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  const content = (
    <>
      <Link href="/dashboard" className="brand" onClick={close}>
        <Image
          src="/icon.png"
          alt=""
          width="52"
          height="52"
          className="brand-icon"
          unoptimized
        />
        <span>
          harkai<small>El pulso de tu comunidad</small>
        </span>
      </Link>
      <nav aria-label="Navegación principal">
        {navigation
          .filter(
            (n) =>
              (!n.admin || user?.role === "admin") &&
              (!n.institutional || ["gov", "admin"].includes(user?.role || "")),
          )
          .map((n) => {
            const active =
              path === n.href ||
              (n.href === "/dashboard/incidents" &&
                path.startsWith("/dashboard/incidents/"));
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={close}
                className={active ? "nav-link active" : "nav-link"}
                aria-current={active ? "page" : undefined}
              >
                {n.section && (
                  <span className="nav-section-label">{n.section}</span>
                )}
                <n.icon size={19} />
                <span className="nav-text">{n.label}</span>
              </Link>
            );
          })}
      </nav>
      <div className="sidebar-purpose">
        <span className="live-dot" />
        <p>
          Explora tu ciudad.
          <br />
          Conversa con tu comunidad.
        </p>
      </div>
      <div className="sidebar-bottom">
        <Link
          href="/dashboard/profile"
          className={`account ${path === "/dashboard/profile" || path === "/dashboard/history" ? "active" : ""}`}
          aria-current={path === "/dashboard/profile" ? "page" : undefined}
          onClick={close}
        >
          <span className="avatar">{user?.name.slice(0, 1) || "H"}</span>
          <span>
            Mi cuenta<small>{user?.name || "Ingresar o registrarme"}</small>
          </span>
        </Link>
        <a href="https://harkai.lat" className="small-link">
          Conoce Harkai ↗
        </a>
      </div>
    </>
  );
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <aside className="sidebar">{content}</aside>
      <button
        className="menu-trigger"
        aria-label="Abrir menú lateral"
        onClick={() => dialog.current?.showModal()}
      >
        <Menu size={22} />
      </button>
      <dialog
        ref={dialog}
        className="mobile-sidebar"
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <button
          className="drawer-close"
          aria-label="Cerrar menú"
          onClick={close}
        >
          <X />
        </button>
        {content}
      </dialog>
      <main
        id="contenido"
        className={
          path === "/dashboard" ? "main-content map-content" : "main-content"
        }
      >
        {error && <Notice error>{error}</Notice>}
        {path !== "/dashboard" && <CoverageNotice />}
        {children}
      </main>
    </>
  );
}
