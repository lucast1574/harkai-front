"use client";
import Link from "next/link";
import { useState } from "react";
import { LifeBuoy, PhoneCall, Sparkles, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { Analysis } from "@/lib/contracts";
import { Notice, TextArea } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { QuickGuidance } from "./quick-guidance";
import { DistrictDirectory } from "../support/district-directory";

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
  }

  return (
    <div className="help-shell">
      <header className="account-hero">
        <div className="account-hero-copy">
          <div className="account-badge">
            <LifeBuoy size={14} />
            <span>AYUDA Y ORIENTACIÓN</span>
          </div>
          <h1>Primeros pasos y contactos oficiales</h1>
          <p>
            Encuentra recomendaciones claras según la situación y comunícate con
            las líneas de emergencia de tu ciudad y distrito.
          </p>
        </div>
        <div className="help-emergency-pills" aria-label="Líneas de emergencia rápida">
          <a href="tel:105" className="emergency-pill">
            <PhoneCall size={14} />
            <span>Policía</span>
            <strong>105</strong>
          </a>
          <a href="tel:116" className="emergency-pill">
            <PhoneCall size={14} />
            <span>Bomberos</span>
            <strong>116</strong>
          </a>
          <a href="tel:106" className="emergency-pill">
            <PhoneCall size={14} />
            <span>SAMU</span>
            <strong>106</strong>
          </a>
        </div>
      </header>

      <QuickGuidance />

      <div className="help-grid">
        <DistrictDirectory />

        <div className="help-side-stack">
          <section className="panel help-consult-card">
            <div className="help-card-head">
              <span className="account-benefit-icon">
                <Sparkles size={18} />
              </span>
              <div>
                <span className="eyebrow">ASISTENTE DE ORIENTACIÓN</span>
                <h2>Describe lo que ocurre</h2>
              </div>
            </div>
            <p className="muted small">
              Recibe recomendaciones inmediatas basadas en el tipo de incidente.
              Esta consulta es informativa y no genera un reporte público.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void ask();
              }}
            >
              <TextArea
                label="¿Qué está ocurriendo?"
                placeholder="Ej. Recibí un mensaje sospechoso pidiendo dinero en mi negocio…"
                minLength={5}
                maxLength={2000}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <div className="help-consult-footer">
                <button className="button" disabled={busy || !user}>
                  {busy ? "Consultando…" : "Ver recomendaciones"}
                </button>
                {!user && (
                  <span className="muted small">
                    <Link href="/dashboard/profile" className="legal-link">
                      Inicia sesión
                    </Link>{" "}
                    para usar el asistente.
                  </span>
                )}
              </div>
            </form>
            {error && <Notice error>{error}</Notice>}
            {analysis && (
              <div className="help-analysis-result">
                <strong>{analysis.reason}</strong>
                <ul className="advice">
                  {analysis.advice.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="panel help-faq">
            <div className="help-card-head">
              <span className="account-benefit-icon">
                <HelpCircle size={18} />
              </span>
              <div>
                <span className="eyebrow">PREGUNTAS FRECUENTES</span>
                <h2>Usa Harkai con claridad</h2>
              </div>
            </div>
            <details>
              <summary>¿Cómo se confirma un reporte?</summary>
              <p>
                Se publica como no verificado. Una persona distinta de quien lo
                publicó puede confirmarlo si conoce el hecho directamente.
              </p>
            </details>
            <details>
              <summary>¿Dónde puedo publicar una alerta?</summary>
              <p>
                Desde la app móvil con ubicación y evidencia en tiempo real. En
                el panel web puedes explorar el mapa, conversar y confirmar.
              </p>
            </details>
            <details>
              <summary>¿Por qué desaparece una alerta del mapa?</summary>
              <p>
                Las alertas activas tienen una vigencia temporal. Al vencer o
                resolverse pasan al{" "}
                <Link href="/dashboard/archive" className="legal-link">
                  historial de la ciudad
                </Link>
                .
              </p>
            </details>
            <details>
              <summary>¿Qué debo evitar al comentar?</summary>
              <p>
                Aporta contexto útil sin exponer identidades de víctimas,
                teléfonos privados ni acusaciones personales.
              </p>
            </details>
          </section>
        </div>
      </div>
    </div>
  );
}
