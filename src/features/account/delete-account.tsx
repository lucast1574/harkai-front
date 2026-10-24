"use client";
import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useResource } from "@/lib/use-resource";
import { api } from "@/lib/api";
import { googleToken } from "@/lib/google-login";
import { Field, Notice } from "@/components/ui";
export function DeleteAccount(): React.JSX.Element {
  const { user, logout, loading } = useAuth();
  const options = useResource<{ password: boolean; google: boolean }>(
    user ? "me/account-deletion-options" : null,
  );
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function remove(google = false): Promise<void> {
    if (
      !user ||
      busy ||
      !checked ||
      confirmation.trim().toLowerCase() !== user.email.toLowerCase()
    )
      return;
    setBusy(true);
    setError("");
    try {
      const token = google ? await googleToken() : undefined;
      await api("me", {
        method: "DELETE",
        body: JSON.stringify({
          confirmation,
          password: google ? undefined : password,
          google_id_token: token,
        }),
      });
      setPassword("");
      setDone(true);
      await logout();
    } catch (e) {
      setPassword("");
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <section className="publication">
        <ShieldAlert size={36} />
        <h1>Tu eliminación está en proceso</h1>
        <p>
          El acceso a tu cuenta queda bloqueado. Retiraremos las sesiones,
          dispositivos, puntos, publicaciones, comentarios y fotos vinculados a
          ella. El proceso continúa aunque cierres esta página.
        </p>
        <Link href="https://harkai.lat/">Volver a Harkai</Link>
      </section>
    );
  const ready =
    checked &&
    !!user &&
    confirmation.trim().toLowerCase() === user.email.toLowerCase();
  return (
    <section className="publication">
      <p className="eyebrow">Tu cuenta y tus datos</p>
      <h1>Eliminar tu cuenta</h1>
      <p>
        Esta acción es permanente. Se retirarán tu cuenta, sesiones y
        dispositivos, tus puntos de negocio y el contenido que publicaste,
        incluidas las fotos. Las copias compartidas fuera de Harkai y las cachés
        de buscadores pueden tardar en actualizarse.
      </p>
      <p>
        El acceso se bloquea al confirmar. El borrado se procesa en segundo
        plano y se reintenta si algún servicio está temporalmente indisponible.
      </p>
      <p>
        <Link href="https://harkai.lat/privacidad/">
          Cómo tratamos tus datos
        </Link>
      </p>
      {loading ? (
        <p>Cargando tu sesión…</p>
      ) : !user ? (
        <Notice>
          Inicia sesión con la cuenta que quieres eliminar.{" "}
          <Link href="/login">Ingresar</Link>
        </Notice>
      ) : (
        <form
          className="panel"
          style={{ padding: 24, marginTop: 24 }}
          onSubmit={(e) => {
            e.preventDefault();
            void remove();
          }}
        >
          <p>
            Cuenta: <strong>{user.email}</strong>
          </p>
          <Field
            label="Escribe tu correo para confirmar"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="email"
            disabled={busy}
          />
          {options.data?.password && (
            <Field
              label="Vuelve a introducir tu contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={busy}
            />
          )}
          <label
            style={{
              display: "flex",
              gap: 12,
              alignItems: "start",
              margin: "20px 0",
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              disabled={busy}
            />
            <span>
              Entiendo que la cuenta y su contenido se eliminarán de forma
              permanente.
            </span>
          </label>
          {(error || options.error) && (
            <Notice error>{error || options.error}</Notice>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {options.data?.password && (
              <button
                className="button"
                style={{ background: "#b9434c", color: "white" }}
                disabled={!ready || busy || !password}
                type="submit"
              >
                <Trash2 size={18} />
                {busy ? "Procesando…" : "Eliminar definitivamente"}
              </button>
            )}
            {options.data?.google && (
              <button
                type="button"
                className="button secondary"
                disabled={!ready || busy}
                onClick={() => void remove(true)}
              >
                Confirmar con Google y eliminar
              </button>
            )}
            <Link href="/dashboard/profile" className="button secondary">
              Volver a mi cuenta
            </Link>
          </div>
        </form>
      )}
      <p className="publication-meta">
        Si ya no puedes acceder, utiliza el contacto de privacidad publicado en
        la landing para solicitar ayuda y acreditar la titularidad.
      </p>
    </section>
  );
}
