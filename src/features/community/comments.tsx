"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { dateLabel, type Page } from "@/lib/contracts";
import { Notice, TextArea } from "@/components/ui";
type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  deleted_at?: string;
  can_delete: boolean;
};
export function Comments({
  incidentId,
  namespace = "incidents",
}: {
  incidentId: string;
  namespace?: "incidents" | "forum";
}): React.JSX.Element {
  const { user } = useAuth();
  return (
    <Thread
      key={`${incidentId}:${user?.id || "guest"}:${user?.role || ""}`}
      incidentId={incidentId}
      namespace={namespace}
    />
  );
}
function Thread({
  incidentId,
  namespace,
}: {
  incidentId: string;
  namespace: "incidents" | "forum";
}): React.JSX.Element {
  const { user } = useAuth();
  const [items, setItems] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState("");
  const generation = useRef(0);
  const path = `${namespace}/${incidentId}/comments`;
  const load = useCallback(
    async (next = ""): Promise<void> => {
      const version = ++generation.current;
      setLoading(true);
      setError("");
      try {
        const page = await api<Page<Comment>>(
          `${path}${next ? `?cursor=${next}` : ""}`,
        );
        if (version === generation.current) {
          setItems((old) =>
            next
              ? [
                  ...new Map(
                    [...old, ...page.items].map((c) => [c.id, c]),
                  ).values(),
                ]
              : page.items,
          );
          setCursor(page.next_cursor || "");
        }
      } catch (e) {
        if (version === generation.current) setError((e as Error).message);
      } finally {
        if (version === generation.current) setLoading(false);
      }
    },
    [path],
  );
  useEffect(() => {
    const current = generation;
    void load();
    return () => {
      ++current.current;
    };
  }, [load]);
  return (
    <section id="conversacion" className="discussion panel">
      <div className="discussion-heading">
        <span className="discussion-icon">
          <MessageCircle size={22} />
        </span>
        <div>
          <h2>
            {namespace === "forum"
              ? "Respuestas de la comunidad"
              : "La conversación de este reporte"}
          </h2>
          <p>
            Participa como vecino anónimo. Aporta contexto o comparte una
            actualización.
          </p>
        </div>
      </div>
      <div className="comments-list">
        {items.map((c) => (
          <article key={c.id} className="comment">
            <span className="comment-avatar">V</span>
            <div>
              <header>
                <strong>
                  {c.deleted_at ? "Comentario retirado" : "Vecino anónimo"}
                </strong>
                <time dateTime={c.created_at}>{dateLabel(c.created_at)}</time>
              </header>
              {!c.deleted_at && <p>{c.body}</p>}
              {c.can_delete && (
                <>
                  <button
                    className="text-button"
                    onClick={() => setRemoving(removing === c.id ? "" : c.id)}
                  >
                    <Trash2 size={12} />
                    Retirar comentario
                  </button>
                  {removing === c.id && (
                    <div className="comment-confirm">
                      <span>El texto dejará de mostrarse públicamente.</span>
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          setError("");
                          try {
                            await api(`${path}/${c.id}`, { method: "DELETE" });
                            setItems((old) =>
                              old.map((row) =>
                                row.id === c.id
                                  ? {
                                      ...row,
                                      body: "",
                                      author_name: "",
                                      can_delete: false,
                                      deleted_at: new Date().toISOString(),
                                    }
                                  : row,
                              ),
                            );
                            setRemoving("");
                          } catch (e) {
                            setError((e as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Confirmar retiro
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      {!items.length && !loading && !error && (
        <p className="discussion-empty">
          La conversación empieza aquí. Comparte información útil y respeta a
          las personas.
        </p>
      )}
      {loading && (
        <p className="muted small" role="status">
          Cargando conversación…
        </p>
      )}
      {cursor && (
        <button
          className="text-button"
          disabled={loading}
          onClick={() => void load(cursor)}
        >
          Ver más comentarios
        </button>
      )}
      {error && <Notice error>{error}</Notice>}
      {user ? (
        <form
          className="comment-compose"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const created = await api<Comment>(path, {
                method: "POST",
                body: JSON.stringify({ body: body.trim() }),
              });
              setBody("");
              ++generation.current;
              setLoading(false);
              setItems((old) => [
                ...new Map([...old, created].map((c) => [c.id, c])).values(),
              ]);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <TextArea
            label="Tu comentario"
            placeholder="¿Qué información puedes aportar?"
            minLength={2}
            maxLength={1000}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div>
            <small>
              No compartas datos personales ni acusaciones sin sustento.{" "}
              <a href="https://harkai.lat/normas-comunidad/">
                Normas de la comunidad
              </a>
            </small>
            <button
              className="button"
              disabled={busy || body.trim().length < 2}
            >
              <Send size={15} />
              {busy ? "Publicando…" : "Comentar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="discussion-login">
          <p>Explora la conversación. Para participar, ingresa a tu cuenta.</p>
          <Link className="button secondary" href="/dashboard/profile">
            Ingresar para comentar
          </Link>
        </div>
      )}
    </section>
  );
}
