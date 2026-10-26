"use client";
import { useRef, useState, type FormEvent } from "react";
import { ActionButton } from "./elements";
import { Alert } from "./elements";
import { Icon } from "./elements";
import { Photo } from "./elements";
import { api } from "./api";
import { submissionFor, type Screenshot, type Ticket } from "./types";
import { prepareScreenshot } from "./screenshots";

export default function TicketComposer({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [title, setTitle] = useState(""),
    [description, setDescription] = useState("");
  const [images, setImages] = useState<Screenshot[]>([]);
  const [busy, setBusy] = useState(false),
    [preparing, setPreparing] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const submission = useRef<{ key: string; payload: string } | null>(null),
    sending = useRef(false);
  async function attach(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    if (images.length + files.length > 3) {
      setError("Puedes adjuntar hasta tres capturas.");
      return;
    }
    setPreparing(true);
    try {
      const prepared = await Promise.all(
        Array.from(files).map(prepareScreenshot),
      );
      setImages((previous) => [...previous, ...prepared]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPreparing(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending.current || preparing) return;
    sending.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const fields = {
      title: title.trim(),
      description: description.trim(),
      images: images.map((img) => img.data),
    };
    submission.current = submissionFor(
      submission.current,
      JSON.stringify(fields),
      () => crypto.randomUUID(),
    );
    try {
      await api<Ticket>("/api/backend/support/tickets", "POST", {
        ...fields,
        requestId: submission.current.key,
      });
      setTitle("");
      setDescription("");
      setImages([]);
      submission.current = null;
      setNotice("Reporte recibido. Puedes seguir su estado en Mis reportes.");
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  return (
    <form
      className="helpdesk-card helpdesk-composer"
      onSubmit={submit}
      aria-busy={busy}
    >
      <div className="helpdesk-section-head">
        <div>
          <p className="eyebrow">CUÉNTANOS QUÉ OCURRIÓ</p>
          <h2>Reportar un problema</h2>
        </div>
        <Icon name="ticket" />
      </div>
      <Alert>{error}</Alert>
      <Alert variant="success">{notice}</Alert>
      <fieldset disabled={busy}>
        <label>
          Asunto
          <input
            required
            minLength={3}
            maxLength={140}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Por ejemplo: no puedo abrir una sección"
          />
        </label>
        <label>
          Descripción
          <textarea
            required
            minLength={10}
            maxLength={10000}
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="¿Qué intentabas hacer? ¿Qué ocurrió? Cuéntanos los pasos para poder revisarlo."
          />
        </label>
        <div className="helpdesk-attachment-heading">
          <span>
            Capturas de pantalla <small>Opcional · hasta 3</small>
          </span>
          <label className="helpdesk-upload">
            <Icon name="image" />
            <span>{preparing ? "Preparando…" : "Adjuntar capturas"}</span>
            <input
              type="file"
              aria-label="Adjuntar capturas"
              accept="image/png,image/jpeg,image/webp"
              multiple
              disabled={preparing || images.length >= 3}
              onChange={(event) => {
                void attach(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="helpdesk-hint">
          Las capturas se optimizan antes de enviarlas. Evita incluir
          contraseñas o información personal de otras personas.
        </p>
        {images.length > 0 && (
          <div className="helpdesk-previews">
            {images.map((image, index) => (
              <div key={`${image.name}-${index}`}>
                <Photo
                  src={image.data}
                  alt={`Captura ${index + 1}: ${image.name}`}
                />
                <button
                  type="button"
                  aria-label={`Quitar captura ${index + 1}`}
                  onClick={() =>
                    setImages((previous) =>
                      previous.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Icon name="close" />
                </button>
                <span>{image.name}</span>
              </div>
            ))}
          </div>
        )}
        <ActionButton type="submit" disabled={busy || preparing}>
          {busy ? "Enviando reporte…" : "Enviar reporte"}
          <Icon name="arrow" />
        </ActionButton>
      </fieldset>
    </form>
  );
}
