"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Analysis } from "@/lib/contracts";
import { Field, Notice } from "@/components/ui";
export function AudioInput({
  enabled,
  disabled,
  onTranscript,
}: {
  enabled: boolean;
  disabled: boolean;
  onTranscript: (text: string, analysis: Analysis) => void;
}): React.JSX.Element {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function transcribe(file?: File): Promise<void> {
    if (!file) return;
    setError("");
    const type =
      file.type ||
      {
        wav: "audio/wav",
        mp3: "audio/mpeg",
        m4a: "audio/mp4",
        ogg: "audio/ogg",
        webm: "audio/webm",
      }[file.name.split(".").pop()?.toLowerCase() || ""];
    if (
      file.size > 4 * 1024 * 1024 ||
      !type ||
      ![
        "audio/wav",
        "audio/x-wav",
        "audio/mpeg",
        "audio/mp4",
        "audio/ogg",
        "audio/webm",
      ].includes(type)
    ) {
      setError(
        "Elige un audio WAV, MP3, M4A, OGG o WEBM de hasta 4 MB y 60 segundos.",
      );
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ text: string; analysis: Analysis }>(
        "analysis/audio",
        { method: "POST", headers: { "Content-Type": type }, body: file },
      );
      onTranscript(result.text, result.analysis);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="audio-input">
      <Field
        label="Describir con un audio (opcional)"
        type="file"
        accept="audio/wav,audio/mpeg,audio/mp4,audio/ogg,audio/webm,.wav,.mp3,.m4a,.ogg,.webm"
        disabled={disabled || busy || !enabled}
        hint={
          busy
            ? "Transcribiendo…"
            : enabled
              ? "Hasta 60 segundos y 4 MB. Revisa y corrige la transcripción antes de publicar."
              : "La transcripción local está pendiente de habilitarse."
        }
        onChange={(e) => {
          void transcribe(e.target.files?.[0]);
        }}
      />
      {error && <Notice error>{error}</Notice>}
    </div>
  );
}
