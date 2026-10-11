"use client";
import Link from "next/link";
import { QuickGuidance } from "./quick-guidance";
import { useState } from "react";
import { api } from "@/lib/api";
import { DistrictDirectory } from "../support/district-directory";
import type { Analysis } from "@/lib/contracts";
import { Heading, Notice, TextArea } from "@/components/ui";
import { useAuth } from "@/lib/auth";
export function Help(): React.JSX.Element {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
        <DistrictDirectory />
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
