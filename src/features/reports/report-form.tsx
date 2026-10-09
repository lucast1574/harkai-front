"use client";
import { Select, TextArea, Heading, Notice } from "@/components/ui";
import { AudioInput } from "./audio-input";
import { ReportLocationStep } from "./report-location-step";
import { useReportForm } from "./use-report-form";
export function ReportForm(): React.JSX.Element {
  const draft = useReportForm();
  const {
    meta,
    metaError,
    step,
    setStep,
    description,
    setDescription,
    type,
    setType,
    analysis,
    setAnalysis,
    lat,
    lng,
    district,
    city,
    contact,
    shareContact,
    media,
    photoName,
    busy,
    error,
    category,
    analyze,
    publish,
  } = draft;
  return (
    <>
      <Heading title="Cuéntanos qué está pasando">
        Publica desde un lugar seguro. Tu reporte aparecerá inicialmente como no
        verificado.
      </Heading>
      <ol className="steps" aria-label="Pasos del reporte">
        {["Qué ocurrió", "Lugar y evidencia", "Revisión"].map(
          (label, index) => (
            <li
              key={label}
              aria-current={step === index ? "step" : undefined}
              className={step === index ? "current" : ""}
            >
              {index + 1}. {label}
            </li>
          ),
        )}
      </ol>
      <section className="panel form-panel">
        {metaError && <Notice error>{metaError}</Notice>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) setStep(step + 1);
            else void publish();
          }}
        >
          {step === 0 && (
            <>
              <AudioInput
                enabled={meta?.capabilities.audio === true}
                disabled={busy}
                onTranscript={(text, result) => {
                  setDescription(text);
                  setAnalysis(result);
                  if (!type && result.suggested_type)
                    setType(result.suggested_type);
                }}
              />
              <TextArea
                label="Describe lo que observaste"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setAnalysis(null);
                }}
                minLength={5}
                maxLength={2000}
                required
                placeholder="Qué ocurrió, en qué zona y cuándo. Evita datos de víctimas."
              />
              <div className="field-actions">
                <span className="muted small">
                  {description.length}/2000 caracteres
                </span>
                <button
                  className="text-button"
                  type="button"
                  disabled={busy || description.trim().length < 5}
                  onClick={() => {
                    void analyze();
                  }}
                >
                  Sugerir categoría por texto
                </button>
              </div>
              <Select
                label="Categoría del reporte"
                value={type}
                required
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Elige una categoría</option>
                {meta?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
              {analysis && (
                <Notice>
                  {analysis.reason} Confirma o cambia la categoría sugerida.
                </Notice>
              )}
              {category && (
                <ul className="advice">
                  {category.advice.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
            </>
          )}
          {step === 1 && <ReportLocationStep draft={draft} />}
          {step === 2 && (
            <>
              <h2>{category?.label}</h2>
              <p className="preserve-text">{description}</p>
              <dl className="detail-list">
                <dt>Ubicación</dt>
                <dd>
                  {lat}, {lng} · {district || city || "Ver coordenadas"}
                </dd>
                <dt>Evidencia</dt>
                <dd>{photoName || "Sin foto"}</dd>
                <dt>Estado inicial</dt>
                <dd>No verificado</dd>
                <dt>Contacto público</dt>
                <dd>{shareContact ? contact : "No se compartirá"}</dd>
              </dl>
              <label className="checkbox">
                <input type="checkbox" required />
                Revisé el texto y la ubicación. Entiendo que es un reporte
                comunitario.
              </label>
            </>
          )}
          {error && <Notice error>{error}</Notice>}
          <div className="page-actions">
            {step > 0 && (
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => setStep(step - 1)}
              >
                Atrás
              </button>
            )}
            <button
              className="button"
              disabled={
                busy ||
                !meta ||
                (step === 1 && ["pet", "place"].includes(type) && !media)
              }
            >
              {busy
                ? "Un momento…"
                : step === 2
                  ? "Publicar reporte"
                  : "Continuar"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
