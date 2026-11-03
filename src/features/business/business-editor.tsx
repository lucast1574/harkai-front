"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Store } from "lucide-react";
import { Select } from "@/components/select";
import { Notice } from "@/components/ui";
import { api } from "@/lib/api";
import { locate } from "@/lib/location";
import { BusinessPhoto } from "./business-photo";
import {
  businessKinds,
  emptyBusiness,
  type Business,
  type BusinessDraft,
} from "./business-contract";
const PointMap = dynamic(() => import("@/features/map/point-map"), {
  ssr: false,
  loading: () => <p>Cargando mapa…</p>,
});

export function BusinessEditor({
  point,
  onSaved,
  onCancel,
}: {
  point?: Business;
  onSaved: (point: Business) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const [draft, setDraft] = useState<BusinessDraft>({
    ...emptyBusiness,
    ...point,
  });
  const [step, setStep] = useState(0);
  const [located, setLocated] = useState(!!point);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  function change(key: keyof BusinessDraft, value: string): void {
    setDraft((old) => ({ ...old, [key]: value }));
  }
  function move(next: number): void {
    setStep(next);
    setError("");
    heading.current?.focus();
  }
  async function gps(): Promise<void> {
    setBusy(true);
    setError("");
    try {
      const p = await locate();
      setDraft((old) => ({
        ...old,
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      setLocated(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (lock.current || busy) return;
    if (step === 1 && !located) {
      setError("Confirma la ubicación de tu negocio en el mapa.");
      return;
    }
    if (step < 2) {
      move(step + 1);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await api<Business>(
        `me/businesses${point ? `/${point.id}` : ""}`,
        {
          method: point ? "PUT" : "POST",
          body: JSON.stringify({
            name: draft.name.trim(),
            description: draft.description.trim(),
            kind: draft.kind,
            address: draft.address.trim(),
            phone: draft.phone.trim(),
            website: draft.website.trim(),
            offer: draft.offer.trim(),
            discount_code: draft.discount_code.trim().toUpperCase(),
            latitude: draft.latitude,
            longitude: draft.longitude,
            radius_meters: 500,
            media_id: draft.media_id,
            subtype: draft.subtype,
            city: draft.city,
            district: draft.district,
          }),
        },
      );
      onSaved(saved);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <form
      className="business-flow"
      data-step={step}
      onSubmit={submit}
      aria-busy={busy}
    >
      <div className="business-progress" aria-label={`Paso ${step + 1} de 3`}>
        {["Negocio", "Ubicación", "Revisión"].map((label, i) => (
          <span
            key={label}
            aria-current={step === i ? "step" : undefined}
            className={i <= step ? "complete" : ""}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="business-form-layout">
        <section className="business-form-main">
          <h2 ref={heading} tabIndex={-1}>
            {
              [
                "Cuéntanos de tu negocio",
                "Marca la entrada de tu negocio",
                "Revisa y envía gratis",
              ][step]
            }
          </h2>
          <p>
            {
              [
                "Solo lo esencial para que tus vecinos te conozcan.",
                "Usa tu ubicación si estás allí, o mueve el mapa hasta tu local.",
                "Puedes añadir una oferta. No necesitas pagar ni añadir una tarjeta.",
              ][step]
            }
          </p>
          <fieldset disabled={busy}>
            {step === 0 && (
              <>
                <label className="field">
                  Nombre del negocio
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={draft.name}
                    onChange={(e) => change("name", e.target.value)}
                    placeholder="Como aparece en tu local"
                  />
                </label>
                <Select
                  label="Tipo de negocio"
                  value={draft.kind}
                  onChange={(e) => change("kind", e.target.value)}
                >
                  {Object.entries(businessKinds).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <label className="field">
                  Qué ofreces
                  <textarea
                    required
                    minLength={5}
                    maxLength={2000}
                    rows={3}
                    value={draft.description}
                    onChange={(e) => change("description", e.target.value)}
                    placeholder="Cuenta qué pueden encontrar o hacer aquí"
                  />
                </label>
                <BusinessPhoto
                  id={draft.media_id}
                  busy={busy}
                  onChange={(id) => change("media_id", id)}
                  onBusy={setBusy}
                  onError={setError}
                />
                <details>
                  <summary>Contacto y más detalles (opcional)</summary>
                  <label className="field">
                    Dirección
                    <input
                      maxLength={300}
                      value={draft.address}
                      onChange={(e) => change("address", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Teléfono
                    <input
                      type="tel"
                      pattern="[+0-9 ()\-]*"
                      maxLength={30}
                      value={draft.phone}
                      onChange={(e) => change("phone", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Sitio web
                    <input
                      type="url"
                      pattern="https://.+"
                      maxLength={300}
                      placeholder="https://"
                      value={draft.website}
                      onChange={(e) => change("website", e.target.value)}
                    />
                  </label>
                </details>
              </>
            )}
            {step === 1 && (
              <>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => void gps()}
                >
                  <Navigation size={18} />
                  Usar mi ubicación
                </button>
                <PointMap
                  point={draft}
                  onChange={(p) => {
                    setDraft((old) => ({ ...old, ...p }));
                    setLocated(false);
                  }}
                />
                <label className="business-confirm">
                  <input
                    type="checkbox"
                    checked={located}
                    onChange={(e) => setLocated(e.target.checked)}
                  />
                  El punto está en la entrada de mi negocio
                </label>
              </>
            )}
            {step === 2 && (
              <>
                <label className="field">
                  Oferta para vecinos (opcional)
                  <textarea
                    maxLength={160}
                    rows={2}
                    placeholder="Por ejemplo: 15 % en tu primera visita"
                    value={draft.offer}
                    onChange={(e) => change("offer", e.target.value)}
                  />
                </label>
                <label className="field">
                  Código de descuento (opcional)
                  <input
                    maxLength={32}
                    pattern="[A-Za-z0-9_\-]+"
                    placeholder="VECINOS15"
                    value={draft.discount_code}
                    onChange={(e) => change("discount_code", e.target.value)}
                  />
                </label>
                <p>
                  Revisaremos tu negocio antes de publicarlo. Podrás consultar
                  su estado y editarlo desde aquí.
                </p>
              </>
            )}
          </fieldset>
          {error && (
            <div role="alert">
              <Notice error>{error}</Notice>
            </div>
          )}
          <div className="business-actions">
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => (step ? move(step - 1) : onCancel())}
            >
              {step ? "Volver" : "Cancelar"}
            </button>
            <button className="button" disabled={busy}>
              {busy
                ? "Un momento…"
                : step === 2
                  ? "Enviar a revisión gratis"
                  : "Continuar"}
            </button>
          </div>
        </section>
        <aside className="business-preview">
          <Store size={28} />
          <p className="business-preview-label">Así te conocerán</p>
          <h3>{draft.name || "Tu negocio, cerca de ellos"}</h3>
          <p>{businessKinds[draft.kind]}</p>
          <p>
            {draft.description ||
              "Lo que ofreces tendrá un lugar en el mapa de tu comunidad."}
          </p>
          {draft.offer && <blockquote>{draft.offer}</blockquote>}
          {draft.discount_code && (
            <strong>{draft.discount_code.toUpperCase()}</strong>
          )}
          <p>
            <MapPin size={16} />{" "}
            {draft.address || "La ubicación que elijas en el mapa"}
          </p>
          <div className="business-reach">
            <strong>Descubrimiento cercano</strong>
            <p>
              Los avisos dependen de la cercanía y de los permisos de ubicación
              y notificaciones de cada persona. Se muestran como promociones,
              separados de las alertas de seguridad.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
