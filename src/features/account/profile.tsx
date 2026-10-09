"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Preferences } from "@/lib/contracts";
import { Field, Select, Heading, Notice } from "@/components/ui";
export function Profile(): React.JSX.Element {
  const { user, reload } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function save(form: FormData): Promise<void> {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const p: Preferences = {
        notifications: form.get(
          "notifications",
        ) as Preferences["notifications"],
        radius_meters: Number(form.get("radius")),
        language: form.get("language") as Preferences["language"],
        theme: form.get("theme") as Preferences["theme"],
      };
      await api("me", {
        method: "PATCH",
        body: JSON.stringify({ name: form.get("name") }),
      });
      await api("me/preferences", { method: "PUT", body: JSON.stringify(p) });
      await reload();
      setMessage("Tu perfil y preferencias quedaron guardados.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
    return;
  }
  if (!user) return <></>;
  return (
    <>
      <Heading title="Tu cuenta, a tu manera">
        Preferencias compartidas entre la web y la app móvil.
      </Heading>
      <form
        className="panel form-panel"
        key={JSON.stringify(user)}
        onSubmit={(e) => {
          e.preventDefault();
          void save(new FormData(e.currentTarget));
        }}
      >
        <Field
          label="Nombre"
          name="name"
          defaultValue={user.name}
          minLength={2}
          maxLength={80}
          required
        />
        <Field label="Correo electrónico" value={user.email} readOnly />
        <p className="muted">
          Rol:{" "}
          {user.role === "gov"
            ? "Gobierno local"
            : user.role === "admin"
              ? "Administrador"
              : "Usuario de la comunidad"}
        </p>
        <Select
          label="Qué alertas consultar"
          name="notifications"
          defaultValue={user.preferences.notifications}
        >
          <option value="all">Todas, incluidas las no verificadas</option>
          <option value="critical">Solo emergencias y seguridad</option>
          <option value="none">Desactivadas</option>
        </Select>
        <Field
          label="Radio de alertas (metros)"
          type="number"
          name="radius"
          min={100}
          max={10000}
          defaultValue={user.preferences.radius_meters}
          required
        />
        <Select
          label="Idioma preferido"
          name="language"
          defaultValue={user.preferences.language}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </Select>
        <Select
          label="Tema preferido"
          name="theme"
          defaultValue={user.preferences.theme}
        >
          <option value="system">Usar el sistema</option>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </Select>
        <p className="muted small">
          Estas preferencias se guardan en tu cuenta. Los permisos de
          notificación se administran por dispositivo.
        </p>
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
        <button className="button" disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
      <section className="panel account-privacy">
        <h2>Tu actividad y privacidad</h2>
        <a className="button secondary" href="/dashboard/history">
          Mis reportes
        </a>
        <p className="muted small">
          Consulta cómo se usan tus datos o solicita la eliminación de tu
          cuenta.
        </p>
        <div className="page-actions">
          <a className="button secondary" href="https://harkai.lat/privacidad/">
            Política de privacidad
          </a>
          <a className="text-button" href="https://harkai.lat/eliminar-cuenta/">
            Solicitar eliminación de cuenta ↗
          </a>
        </div>
      </section>
    </>
  );
}
