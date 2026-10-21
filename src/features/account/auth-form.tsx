"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Field, Notice } from "@/components/ui";
import { googleConfigured, googleToken } from "@/lib/google-login";

function GoogleLogo(): React.JSX.Element {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="google-icon"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.86c2.26-2.09 3.56-5.17 3.56-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.98c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.6H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.4l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l3.98 3.09c.95-2.85 3.6-4.94 6.73-4.94z"
      />
    </svg>
  );
}

export function AuthForm(): React.JSX.Element {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const router = useRouter();

  async function submit(input: {
    mode: string;
    email?: string;
    password?: string;
    name?: string;
    id_token?: string;
  }): Promise<void> {
    setBusy(true);
    setError("");
    try {
      await login(input);
      router.push("/dashboard/profile");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <div className="auth-tabs" role="tablist" aria-label="Modo de acceso">
        <button
          type="button"
          role="tab"
          aria-selected={!register}
          className={!register ? "auth-tab active" : "auth-tab"}
          disabled={busy}
          onClick={() => {
            setRegister(false);
            setError("");
          }}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={register}
          className={register ? "auth-tab active" : "auth-tab"}
          disabled={busy}
          onClick={() => {
            setRegister(true);
            setError("");
          }}
        >
          Crear cuenta
        </button>
      </div>

      <div className="auth-header">
        <h2>{register ? "Crea tu cuenta en Harkai" : "Bienvenido de vuelta"}</h2>
        <p>
          {register
            ? "Usa una sola cuenta para participar en la web y publicar desde la app móvil."
            : "Ingresa para comentar reportes, confirmar avisos y sincronizar tus alertas."}
        </p>
      </div>

      {user && <Notice>Ya ingresaste como {user.name}.</Notice>}

      <button
        type="button"
        className="google-button"
        disabled={busy || !googleConfigured()}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await submit({ mode: "google", id_token: await googleToken() });
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        }}
      >
        <span className="google-badge">
          <GoogleLogo />
        </span>
        <span>Continuar con Google</span>
      </button>

      <div className="auth-divider">
        <span>o continúa con tu correo</span>
      </div>

      <form
        className="auth-form-fields"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          void submit({
            mode: register ? "register" : "login",
            email: String(data.get("email")),
            password: String(data.get("password")),
            ...(register ? { name: String(data.get("name")) } : {}),
          });
        }}
      >
        {register && (
          <Field
            label="Tu nombre"
            name="name"
            placeholder="Ej. Lucas Santillán"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
          />
        )}
        <Field
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          maxLength={254}
          required
        />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          placeholder={register ? "Mínimo 12 caracteres" : "••••••••••••"}
          autoComplete={register ? "new-password" : "current-password"}
          minLength={register ? 12 : 1}
          maxLength={72}
          hint={
            register ? "Usa al menos 12 caracteres para proteger tu cuenta." : undefined
          }
          required
        />
        {error && <Notice error>{error}</Notice>}
        <button className="button auth-submit" disabled={busy}>
          <span>{busy ? "Un momento…" : register ? "Crear mi cuenta" : "Ingresar a Harkai"}</span>
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="auth-legal">
        Al continuar aceptas los{" "}
        <a className="legal-link" href="https://harkai.lat/terminos/">
          términos
        </a>
        , la{" "}
        <a className="legal-link" href="https://harkai.lat/privacidad/">
          política de privacidad
        </a>{" "}
        y las{" "}
        <a className="legal-link" href="https://harkai.lat/normas-comunidad/">
          normas de la comunidad
        </a>
        .
      </p>
    </section>
  );
}
