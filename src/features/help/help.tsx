"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useResource } from "@/lib/use-resource";
import type { Analysis } from "@/lib/contracts";
import { Heading, Notice, TextArea, Field } from "@/components/ui";
import { useAuth } from "@/lib/auth";
export function Help(): React.JSX.Element {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [city, setCity] = useState("lima");
  const [queryCity, setQueryCity] = useState("lima");
  const contacts = useResource<{ numbers: Record<string, string> }>(
    `emergency-contacts?country=PE&city=${encodeURIComponent(queryCity)}`,
  );
  async function ask(): Promise<void> {
    setBusy(true);
    setError("");
    try {
      setAnalysis(
        await api<Analysis>("analysis/text", {
          method: "POST",
          body: JSON.stringify({ text }),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
    return;
  }
  return (
    <>
      <Heading title="Ayuda cuando la necesitas">
        Orientación por reglas y contactos publicados por la administración.
      </Heading>
      <div className="two-columns">
        <section className="panel">
          <h2>Orientación sobre un reporte</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask();
            }}
          >
            <TextArea
              label="¿Qué está ocurriendo?"
              minLength={5}
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <button className="button" disabled={busy || !user}>
              {busy ? "Consultando…" : "Ver recomendaciones"}
            </button>
            {!user && (
              <p className="muted">
                Ingresa para consultar la orientación por texto.
              </p>
            )}
          </form>
          {error && <Notice error>{error}</Notice>}
          {analysis && (
            <>
              <p>{analysis.reason}</p>
              <ul className="advice">
                {analysis.advice.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="muted small">
                La orientación no confirma un hecho ni contacta a emergencias.
              </p>
            </>
          )}
        </section>
        <section className="panel">
          <h2>Contactos de ayuda</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQueryCity(city);
            }}
          >
            <Field
              label="Ciudad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              minLength={2}
            />
            <button className="button secondary">Consultar contactos</button>
          </form>
          {contacts.loading ? (
            <Notice>Consultando contactos…</Notice>
          ) : contacts.data ? (
            Object.entries(contacts.data.numbers).map(([name, number]) => (
              <a
                key={name}
                className="contact-link"
                href={`tel:${number.replace(/[^+0-9]/g, "")}`}
              >
                <span>
                  {{
                    police: "Policía",
                    medical: "Emergencias médicas",
                    firefighters: "Bomberos",
                    municipal: "Municipalidad",
                  }[name] || name}
                </span>
                <strong>{number}</strong>
              </a>
            ))
          ) : (
            <p className="muted">
              No hay un directorio disponible para esta ciudad. Si hay peligro
              inmediato, busca el canal oficial de emergencias de tu zona.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
