"use client";
import { shouldInviteToMobileApp } from "@/lib/mobile-app-routes";
import { MobileAppInvitation, useMobileScreen } from "./mobile-app-invitation";
import { CoverageNotice } from "@/features/support/coverage-notice";
import Link from "next/link";
import { Brand } from "./brand";
import { UserAvatar } from "./user-avatar";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  Map,
  Megaphone,
  BarChart3,
  Settings2,
  Menu,
  X,
  Store,
  MessageCircle,
  History,
  LifeBuoy,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Notice } from "./ui";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  utility?: boolean;
  admin?: boolean;
  institutional?: boolean;
  section?: string;
};
const navigation: NavigationItem[] = [
  {
    href: "/dashboard/tickets",
    label: "Soporte técnico",
    icon: Ticket,
    utility: true,
  },
  {
    href: "/dashboard",
    label: "Mapa de mi zona",
    icon: Map,
    section: "EXPLORAR",
  },
  { href: "/dashboard/report", label: "Reportar", icon: Megaphone },
  { href: "/dashboard/my-businesses", label: "Ponte en el mapa", icon: Store },
  {
    href: "/dashboard/help",
    label: "Ayuda y orientación",
    icon: LifeBuoy,
    utility: true,
  },
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
    href: "/dashboard/admin",
    label: "Administración",
    icon: Settings2,
    admin: true,
  },
];

export function Shell({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { user, error, reload } = useAuth();
  const path = usePathname();
  const mobile = useMobileScreen();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  if (shouldInviteToMobileApp(path)) {
    if (mobile === null) return <main aria-busy="true" />;
    if (mobile) return <MobileAppInvitation />;
  }
  if (
    path.startsWith("/incidents/") ||
    path === "/comunidad" ||
    path === "/login" ||
    path === "/distritos" ||
    path.startsWith("/distritos/") ||
    path === "/eliminar-cuenta"
  )
    return (
      <>
        <header className="publication-header">
          <Brand />
          <nav aria-label="Navegación pública">
            <a href="https://harkai.lat/">Inicio</a>
            <Link href="/comunidad">Alertas</Link>
            <Link href="/distritos">Chats por distrito</Link>
            <Link href="/dashboard">Mapa</Link>
            <Link href={user ? "/dashboard/profile" : "/login"}>
              {user ? "Mi cuenta" : "Ingresar"}
            </Link>
          </nav>
        </header>
        <main>{children}</main>
      </>
    );
  const renderLinks = (items: typeof navigation) =>
    items
      .filter(
        (n) =>
          (!n.admin || user?.role === "admin") &&
          (!n.institutional || user?.role === "gov" || user?.role === "admin"),
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
            <span className="nav-icon">
              <n.icon size={20} />
            </span>
            <span className="nav-text">{n.label}</span>
          </Link>
        );
      });
  const content = (
    <>
      <Brand onClick={close} />
      <nav aria-label="Navegación principal">
        {renderLinks(navigation.filter((n) => !user || !n.utility))}
      </nav>
      <div className="sidebar-purpose">
        <span className="live-dot" />
        <p>Red vecinal en todo el Perú.</p>
      </div>
      <div className="sidebar-bottom">
        {user && (
          <nav aria-label="Soporte y asistencia">
            {renderLinks(navigation.filter((n) => n.utility && !n.admin))}
          </nav>
        )}
        <Link
          href="/dashboard/profile"
          className={`account ${path === "/dashboard/profile" || path === "/dashboard/history" ? "active" : ""}`}
          aria-current={path === "/dashboard/profile" ? "page" : undefined}
          onClick={close}
        >
          <UserAvatar user={user} />
          <span>
            Mi cuenta<small>{user?.name || "Ingresar o registrarme"}</small>
          </span>
        </Link>
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
        {error && (
          <Notice error={!user}>
            <strong>No pudimos actualizar tu sesión.</strong> {error}{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => void reload()}
            >
              Reintentar
            </button>
          </Notice>
        )}
        {path !== "/dashboard" && <CoverageNotice />}
        {children}
      </main>
    </>
  );
}
