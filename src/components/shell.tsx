"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  Map,
  BarChart3,
  Users,
  Plus,
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
  { href: "/dashboard", label: "Mapa de mi zona", icon: Map },
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
      <Link href="/dashboard/report" className="sidebar-create" onClick={close}>
        <Plus size={17} /> Crear reporte
      </Link>
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
              {n.href === "/dashboard" && (
                <span className="nav-section-label">EXPLORAR</span>
              )}
              {n.href === "/dashboard/archive" && (
                <span className="nav-section-label">TU ESPACIO</span>
              )}
              {n.href === "/dashboard/gov" && (
                <span className="nav-section-label">GESTIÓN</span>
              )}
              <n.icon size={19} />
              <span className="nav-text">{n.label}</span>
            </Link>
          ))}
      </nav>
      <div className="sidebar-bottom">
        <Link href="/dashboard/profile" className="account" onClick={close}>
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
        </Link>
        <Link href="/dashboard/help" onClick={close} className="text-button">
          <MessageCircle size={16} /> Ayuda y orientación
        </Link>
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
      <main
        id="contenido"
        className={
          path === "/dashboard" ? "main-content map-content" : "main-content"
        }
      >
        {(error || logoutError) && (
          <Notice error>{error || logoutError}</Notice>
        )}
        {children}
      </main>
    </>
  );
}
