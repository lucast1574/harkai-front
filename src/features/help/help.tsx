"use client";
import Link from "next/link";
import { QuickGuidance } from "./quick-guidance";
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
        Encuentra primeros pasos, contactos y orientación para lo que está
        pasando. Si hay peligro inmediato, contacta a emergencias desde un lugar
        seguro.
      </Heading>
      <QuickGuidance />
      <div className="two-columns help-tools">
        <section className="panel">
          <span className="eyebrow">TU SITUACIÓN</span>
          <h2>Cuéntanos qué ocurre</h2>
          <p className="muted small">
            Te orientamos con reglas. Esta consulta no crea un reporte ni avisa
            a emergencias.
          </p>
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
                <Link href="/dashboard/profile">Entra en Mi cuenta</Link> para
                consultar la orientación por texto.
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
          <span className="eyebrow">CANALES DE ATENCIÓN</span>
          <h2>Contactos de ayuda</h2>
          <p className="muted small">
            Directorio publicado por la administración para la ciudad que
            consultes.
          </p>
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
          ) : contacts.error ? (
            <Notice>
              No pudimos cargar un directorio para esta ciudad. Prueba otra
              ciudad o consulta los canales oficiales de tu localidad.
            </Notice>
          ) : contacts.data && Object.keys(contacts.data.numbers).length > 0 ? (
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
      <section className="panel help-faq">
        <h2>Usa Harkai con claridad</h2>
        <details>
          <summary>¿Cómo se confirma un reporte?</summary>
          <p>
            Se publica como no verificado. Una persona distinta de quien lo
            publicó puede confirmarlo. Revisa la información y confirma solo si
            conoces el hecho.
          </p>
        </details>
        <details>
          <summary>¿Dónde puedo publicar?</summary>
          <p>
            Desde la app móvil. En la web puedes explorar el mapa, conversar,
            confirmar reportes y administrar tu cuenta.
          </p>
        </details>
        <details>
          <summary>¿Por qué desaparece una alerta del mapa?</summary>
          <p>
            Las alertas activas tienen una duración. Los reportes vencidos o
            resueltos permanecen en el historial de la ciudad; los retirados por
            moderación dejan de ser públicos.
          </p>
          <Link href="/dashboard/archive" className="text-button">
            Explorar el historial ↗
          </Link>
        </details>
        <details>
          <summary>¿Qué debo evitar al comentar?</summary>
          <p>
            Aporta contexto sin publicar identidades de víctimas, teléfonos,
            direcciones privadas o acusaciones personales.
          </p>
          <a
            className="text-button"
            href="https://harkai.lat/normas-comunidad/"
          >
            Leer las normas de la comunidad ↗
          </a>
        </details>
      </section>
    </>
  );
}
