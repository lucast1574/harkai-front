"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Send, VenetianMask, LoaderCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Notice } from "@/components/ui";
import styles from "./forum.module.css";

export function ForumCompose({
  districtId,
  district,
  onPublished,
}: {
  districtId: string;
  district: string;
  onPublished: () => Promise<void>;
}): React.JSX.Element {
  const { user } = useAuth();
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
              await api("forum", {
                method: "POST",
                body: JSON.stringify({
                  body: body.trim(),
                  district_id: districtId,
                }),
              });
              setBody("");
              const input = form.querySelector("textarea");
              if (input) input.style.height = "auto";
              await onPublished();
            } catch (failure) {
              setError((failure as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className={styles.composerRow}>
            <div className="field">
              <textarea
                aria-label={`Mensaje para ${district}`}
                rows={1}
                placeholder="Escribe a tu barrio…"
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
