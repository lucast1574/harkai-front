"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Send, VenetianMask, LoaderCircle, X, Reply } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Notice } from "@/components/ui";
import type { ForumThread } from "./forum-contracts";
import styles from "./forum.module.css";

export function ForumCompose({
  districtId,
  district,
  onPublished,
  replyTo,
  onCancelReply,
  onReplied,
}: {
  districtId: string;
  district: string;
  onPublished: () => Promise<void>;
  replyTo: ForumThread | null;
  onCancelReply: () => void;
  onReplied: () => void;
}): React.JSX.Element {
  const { user } = useAuth();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (replyTo) {
      document.getElementById("comentar")?.scrollIntoView({ block: "nearest" });
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [replyTo]);
  const pathname = usePathname();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section id="comentar" className={styles.compose}>
      <header>
        <VenetianMask size={19} />
        <div>
          <strong>Conversa como vecino anónimo</strong>
          <p>Tu nombre y perfil no se muestran. Escribe sobre {district}.</p>
        </div>
      </header>
      {user ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (busy || !districtId || body.trim().length < 2) return;
            setBusy(true);
            setError("");
            try {
              await api(replyTo ? `forum/${replyTo.id}/comments` : "forum", {
                method: "POST",
                body: JSON.stringify({
                  body: body.trim(),
                  ...(replyTo ? {} : { district_id: districtId }),
                }),
              });
              setBody("");
              const input = form.querySelector("textarea");
              if (input) input.style.height = "auto";
              if (replyTo) onReplied();
              else await onPublished();
            } catch (failure) {
              setError((failure as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {replyTo && (
            <div className={styles.replyPreview}>
              <Reply size={18} />
              <div>
                <strong>Respondiendo a un vecino</strong>
                <p>{replyTo.body}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                disabled={busy}
                onClick={onCancelReply}
                aria-label="Cancelar respuesta"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className={styles.composerRow}>
            <div className="field">
              <textarea
                ref={inputRef}
                aria-label={`Mensaje para ${district}`}
                rows={1}
                placeholder={
                  replyTo ? "Escribe tu respuesta…" : "Escribe a tu barrio…"
                }
                value={body}
                onChange={(event) => {
                  setBody(event.target.value);
                  event.target.style.height = "auto";
                  event.target.style.height = `${Math.min(event.target.scrollHeight, 144)}px`;
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                minLength={2}
                maxLength={1000}
                required
                disabled={busy}
              />
            </div>
            <button
              type="submit"
              className={styles.sendButton}
              aria-label={busy ? "Enviando mensaje" : "Enviar mensaje"}
              title={busy ? "Enviando mensaje" : "Enviar mensaje"}
              aria-busy={busy}
              disabled={busy || !districtId || body.trim().length < 2}
            >
              {busy ? (
                <LoaderCircle size={20} className={styles.sending} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          {error && <Notice error>{error}</Notice>}
          <footer>
            <small>
              Chat público, visible en buscadores. Evita compartir datos
              personales.
            </small>
          </footer>
        </form>
      ) : (
        <div className={styles.login}>
          <p>
            Puedes leer libremente. Para participar, entra a tu cuenta; tus
            mensajes serán anónimos públicamente.
          </p>
          <Link
            className="button secondary"
            href={`/login?next=${encodeURIComponent(pathname + "#comentar")}`}
          >
            Ingresar para conversar
          </Link>
        </div>
      )}
    </section>
  );
}
