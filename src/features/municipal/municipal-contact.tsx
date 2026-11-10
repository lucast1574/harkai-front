"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Field, Notice, TextArea } from "@/components/ui";
import { api } from "@/lib/api";
import { submissionFor } from "@/features/tickets/types";

export function MunicipalContact(): React.JSX.Element {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [received, setReceived] = useState(false);
  const submitting = useRef(false);
  const previous = useRef<{ key: string; payload: string } | null>(null);
  async function send(form: HTMLFormElement): Promise<void> {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    const data = new FormData(form);
    const values = {
      municipality: String(data.get("municipality") || "").trim(),
      name: String(data.get("name") || "").trim(),
      role: String(data.get("role") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      message: String(data.get("message") || "").trim(),
      consent: data.get("consent") === "on",
    };
    previous.current = submissionFor(
      previous.current,
      JSON.stringify(values),
      () => crypto.randomUUID(),
    );
    try {
      await api("municipal-inquiries", {
        method: "POST",
        body: JSON.stringify({ ...values, requestId: previous.current.key }),
      });
      setReceived(true);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="municipal-contact">
      <header className="municipal-intro">
        <p className="eyebrow">HARKAI PARA MUNICIPALIDADES</p>
        <h1>Conversemos sobre tu distrito.</h1>
        <p>
          Cuéntanos qué necesita tu equipo. Coordinaremos una conversación para
          definir el acceso institucional a Harkai.
        </p>
        <div className="municipal-agreement">
          <h2>Un acuerdo a la medida de tu municipio.</h2>
          <p>
            El alcance, los usuarios y la vigencia se coordinan directamente
            contigo. Enviar esta solicitud no genera un cobro ni activa una
            cuenta municipal.
          </p>
          <Link href="https://harkai.lat/">
            Conocer Harkai <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>
      {received ? (
        <div className="panel municipal-received" role="status">
          <CheckCircle2 size={36} aria-hidden="true" />
          <h2>Recibimos tu solicitud.</h2>
          <p>
            Nuestro equipo revisará tu mensaje y te contactará al correo que
            indicaste.
          </p>
          <Link className="button secondary" href="https://harkai.lat/">
            Volver a Harkai
          </Link>
        </div>
      ) : (
        <form
          className="panel municipal-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send(event.currentTarget);
          }}
          aria-busy={busy}
        >
          <h2>Solicitar contacto</h2>
          <p className="muted small">
            No necesitas crear una cuenta para escribirnos.
          </p>
          <fieldset disabled={busy}>
            <Field
              label="Municipalidad"
              name="municipality"
              autoComplete="organization"
              required
              minLength={3}
              maxLength={120}
              placeholder="Nombre de tu municipalidad"
            />
            <div className="municipal-fields">
              <Field
                label="Nombre de contacto"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
              />
              <Field
                label="Cargo o área"
                name="role"
                autoComplete="organization-title"
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div className="municipal-fields">
              <Field
                label="Correo de contacto"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
              <Field
                label="Teléfono (opcional)"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
              />
            </div>
            <TextArea
              label="¿Qué necesita tu equipo?"
              name="message"
              required
              minLength={10}
              maxLength={3000}
              placeholder="Cuéntanos qué zona atienden, quiénes usarían el acceso y qué les gustaría conocer."
            />
            <label className="municipal-consent">
              <input type="checkbox" name="consent" required />
              <span>
                Autorizo a Harkai a usar estos datos para atender mi solicitud y
                contactarme.{" "}
                <a href="https://harkai.lat/privacidad/">
                  Política de privacidad
                </a>
                .
              </span>
            </label>
            {error && (
              <Notice error>
                {error} Tu mensaje se conserva para que puedas reintentarlo.
              </Notice>
            )}
            <button className="button" type="submit">
              {busy ? "Enviando…" : "Enviar solicitud"}
              <ArrowUpRight size={18} aria-hidden="true" />
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
