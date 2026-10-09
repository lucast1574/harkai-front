"use client";
import { Field, Notice } from "@/components/ui";
import { useReportForm } from "./use-report-form";
type Draft = ReturnType<typeof useReportForm>;
export function ReportLocationStep({
  draft,
}: {
  draft: Draft;
}): React.JSX.Element {
  const {
    lat,
    setLat,
    lng,
    setLng,
    district,
    setDistrict,
    city,
    setCity,
    type,
    contact,
    setContact,
    shareContact,
    setShareContact,
    busy,
    meta,
    media,
    photoName,
    photo,
    setError,
  } = draft;
  return (
    <>
      <button
        type="button"
        className="button secondary"
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              setLat(String(p.coords.latitude));
              setLng(String(p.coords.longitude));
              setError("");
            },
            () =>
              setError(
                "No pudimos obtener tu ubicación. Ingresa el punto manualmente.",
              ),
            { timeout: 10000 },
          );
        }}
      >
        Ubicarme aquí
      </button>
      <div className="two-columns">
        <Field
          label="Latitud del hecho"
          type="number"
          value={lat}
          step="any"
          min={-90}
          max={90}
          required
          onChange={(e) => setLat(e.target.value)}
        />
        <Field
          label="Longitud del hecho"
          type="number"
          value={lng}
          step="any"
          min={-180}
          max={180}
          required
          onChange={(e) => setLng(e.target.value)}
        />
        <Field
          label="Distrito (opcional)"
          maxLength={100}
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        />
        <Field
          label="Ciudad (opcional)"
          maxLength={100}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <Field
        label="Foto de evidencia"
        type="file"
        accept="image/jpeg,image/png"
        disabled={busy || !meta?.capabilities.media}
        hint="JPG o PNG · hasta 5 MB · se revisa antes de publicarse."
        onChange={(e) => {
          void photo(e.target.files?.[0]);
        }}
      />
      {photoName && <Notice>Foto recibida: {photoName}</Notice>}
      <Field
        label={
          type === "pet" || type === "place"
            ? "Contacto (necesario para este reporte)"
            : "Contacto (opcional)"
        }
        value={contact}
        minLength={type === "pet" || type === "place" ? 6 : undefined}
        maxLength={40}
        required={type === "pet" || type === "place"}
        onChange={(e) => setContact(e.target.value)}
      />
      <label className="checkbox">
        <input
          type="checkbox"
          checked={shareContact}
          onChange={(e) => setShareContact(e.target.checked)}
        />
        Acepto mostrar este contacto públicamente
      </label>
      {(type === "pet" || type === "place") && !media && (
        <Notice>
          Para mascotas y lugares de ayuda se necesita una foto aprobada.
        </Notice>
      )}
    </>
  );
}
