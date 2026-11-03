"use client";
import Image from "next/image";
import { useRef } from "react";
import { api } from "@/lib/api";

export function BusinessPhoto({
  id,
  busy,
  onChange,
  onBusy,
  onError,
}: {
  id?: string;
  busy: boolean;
  onChange: (id: string) => void;
  onBusy: (busy: boolean) => void;
  onError: (message: string) => void;
}): React.JSX.Element {
  const input = useRef<HTMLInputElement>(null);
  async function upload(file?: File): Promise<void> {
    if (!file || busy) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      onError("Elige una imagen JPG, PNG o WebP de hasta 5 MB.");
      return;
    }
    onBusy(true);
    onError("");
    try {
      const result = await api<{ id: string }>("media", {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });
      onChange(result.id);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      onBusy(false);
    }
  }
  return (
    <div className="business-photo">
      {id && (
        <>
          <Image
            unoptimized
            src={`/api/backend/media/${id}`}
            alt="Foto de tu negocio"
            width={280}
            height={160}
          />
          <button type="button" disabled={busy} onClick={() => onChange("")}>
            Quitar foto
          </button>
        </>
      )}
      <div className="field">
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {id ? "Cambiar foto" : "Añadir foto (opcional)"}
        </button>
        <input
          ref={input}
          hidden
          aria-label="Foto de tu negocio"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p className="muted">
        Fachada, logo o una foto de lo que ofreces. Hasta 5 MB.
      </p>
    </div>
  );
}
