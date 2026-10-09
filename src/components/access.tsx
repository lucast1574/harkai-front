"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Notice } from "./ui";
export function Access({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}): React.JSX.Element {
  const { user, loading, error, reload } = useAuth();
  if (loading) return <Notice>Cargando tu sesión…</Notice>;
  if (error)
    return (
      <Notice error>
        {error}{" "}
        <button
          onClick={() => {
            void reload();
          }}
        >
          Reintentar
        </button>
      </Notice>
    );
  if (!user)
    return (
      <section className="panel">
        <h2>Tu cuenta conecta a tu comunidad</h2>
        <p>
          Ingresa para publicar, confirmar reportes y guardar tus preferencias.
        </p>
        <Link className="button" href="/login">
          Ingresar o crear cuenta
        </Link>
      </section>
    );
  if (roles && !roles.includes(user.role))
    return (
      <Notice error>
        Esta vista requiere un rol institucional asignado por un administrador.
      </Notice>
    );
  return <>{children}</>;
}
