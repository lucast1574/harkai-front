"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Field, Heading, Notice } from "@/components/ui";
import { googleConfigured, googleToken } from "@/lib/google-login";
export default function Login(): React.JSX.Element {
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
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
    return;
  }
  return (
    <>
      <Heading
        title={
          register ? "Tu comunidad empieza contigo" : "Bienvenido a tu zona"
        }
      >
        Una cuenta para la web y la app móvil.
      </Heading>
      <section className="panel auth-panel">
        {user && <Notice>Ya ingresaste como {user.name}.</Notice>}
        <form
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
            autoComplete="email"
            maxLength={254}
            required
          />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            autoComplete={register ? "new-password" : "current-password"}
            minLength={register ? 12 : 1}
            maxLength={72}
            hint={
              register ? "Al menos 12 caracteres (máximo 72 bytes)." : undefined
            }
            required
          />
          {error && <Notice error>{error}</Notice>}
          <button className="button" disabled={busy}>
            {busy ? "Un momento…" : register ? "Crear cuenta" : "Ingresar"}
          </button>
        </form>
        <button
          className="button secondary"
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
          Continuar con Google
        </button>
        {!googleConfigured() && (
          <small className="muted">
            Google se habilitará al completar la conexión del proyecto nuevo.
          </small>
        )}
        <button
          className="text-button"
          disabled={busy}
          onClick={() => {
            setRegister(!register);
            setError("");
          }}
        >
          {register ? "Ya tengo una cuenta" : "Crear una cuenta con mi correo"}
        </button>
      </section>
    </>
  );
}
