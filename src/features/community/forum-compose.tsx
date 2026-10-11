"use client";
import Link from "next/link";
import { useState } from "react";
import { Send, VenetianMask } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Notice, TextArea } from "@/components/ui";
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
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className={styles.compose}>
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
              await onPublished();
            } catch (failure) {
              setError((failure as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <TextArea
            label="¿Qué quieres conversar con tus vecinos?"
            placeholder="Una pregunta, una novedad o algo que ayude a tu barrio…"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            minLength={2}
            maxLength={1000}
            required
            disabled={busy}
          />
          {error && <Notice error>{error}</Notice>}
          <footer>
            <small>
              Sin insultos ni obscenidades. Evita compartir datos que te
              identifiquen.
            </small>
            <button
              className="button"
              disabled={busy || !districtId || body.trim().length < 2}
            >
              <Send size={14} />
              {busy ? "Publicando…" : "Publicar conversación"}
            </button>
          </footer>
        </form>
      ) : (
        <div className={styles.login}>
          <p>
            Puedes leer libremente. Para participar, entra a tu cuenta; tus
            mensajes serán anónimos públicamente.
          </p>
          <Link className="button secondary" href="/dashboard/profile">
            Ingresar para conversar
          </Link>
        </div>
      )}
    </section>
  );
}
