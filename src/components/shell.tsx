"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  Map,
  BarChart3,
  ShieldCheck,
  Users,
  Plus,
  Heart,
  MapPin,
  Newspaper,
  Settings,
  LogIn,
  LogOut,
  Menu,
  X,
  Wallet,
  MessageCircle,
  History,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Notice } from "./ui";
const navigation = [
  { href: "/dashboard", label: "Mi zona", icon: Map },
  { href: "/dashboard/incidents", label: "Reportes", icon: ShieldCheck },
  { href: "/dashboard/report", label: "Crear reporte", icon: Plus },
  { href: "/dashboard/pets", label: "Mascotas", icon: Heart },
  { href: "/dashboard/places", label: "Lugares de ayuda", icon: MapPin },
  { href: "/dashboard/news", label: "Actualidad", icon: Newspaper },
  { href: "/dashboard/analytics", label: "Panorama", icon: BarChart3 },
  { href: "/dashboard/history", label: "Mis reportes", icon: History },
  { href: "/dashboard/help", label: "Ayuda", icon: MessageCircle },
  { href: "/dashboard/profile", label: "Mi cuenta", icon: Settings },
  {
    href: "/dashboard/gov",
    label: "Municipalidad",
    icon: Map,
    institutional: true,
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
  const { user, logout, error } = useAuth();
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [logoutError, setLogoutError] = useState("");
  const close = () => dialog.current?.close();
  const content = (
    <>
      <Link href="/dashboard" className="brand" onClick={close}>
        <span className="brand-symbol">H</span>
        <span>
          harkai<small>El pulso de tu comunidad</small>
        </span>
      </Link>
      <div className="sidebar-label">EXPLORA TU ZONA</div>
      <nav aria-label="Navegación principal">
        {navigation
          .filter(
            (n) =>
              (!n.admin || user?.role === "admin") &&
              (!n.institutional || ["gov", "admin"].includes(user?.role || "")),
          )
          .map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={close}
              className={path === n.href ? "nav-link active" : "nav-link"}
              aria-current={path === n.href ? "page" : undefined}
            >
              <n.icon size={19} />
              {n.label}
            </Link>
          ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="account">
          <span className="avatar">{user?.name.slice(0, 1) || "H"}</span>
          <span>
            {user?.name || "Explora libremente"}
            <small>
              {user?.role === "gov"
                ? "Gobierno local"
                : user?.role === "admin"
                  ? "Administración"
                  : "Comunidad"}
            </small>
          </span>
        </div>
        {user ? (
          <button
            className="text-button"
            onClick={async () => {
              try {
                await logout();
                close();
              } catch (e) {
                setLogoutError((e as Error).message);
              }
            }}
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        ) : (
          <Link href="/login" onClick={close} className="text-button">
            <LogIn size={17} />
            Ingresar o crear cuenta
          </Link>
        )}
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
      <main id="contenido" className="main-content">
        {(error || logoutError) && (
          <Notice error>{error || logoutError}</Notice>
        )}
        {children}
      </main>
    </>
  );
}
