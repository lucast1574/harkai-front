"use client";
import { useState } from "react";
import { MessageCircle, MapPin, Trash2, VenetianMask } from "lucide-react";
import { api } from "@/lib/api";
import { dateLabel } from "@/lib/contracts";
import { Notice } from "@/components/ui";
import { Comments } from "./comments";
import type { ForumThread } from "./forum-contracts";
import styles from "./forum.module.css";

export function ForumCard({
  thread,
  onRemoved,
}: {
  thread: ForumThread;
  onRemoved: () => Promise<void>;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <article className={styles.card}>
      <header>
        <span className={styles.avatar}>
          <VenetianMask size={18} />
        </span>
        <div>
          <strong>Vecino anónimo</strong>
          <span>
            <MapPin size={12} />
            {thread.district} ·{" "}
            <time dateTime={thread.created_at}>
              {dateLabel(thread.created_at)}
            </time>
          </span>
        </div>
      </header>
      <p className={styles.body}>{thread.body}</p>
      <footer>
        <button
          className="text-button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <MessageCircle size={15} />
          {open ? "Cerrar conversación" : "Abrir conversación"}
        </button>
        {thread.can_delete && (
          <button className="text-button" onClick={() => setConfirm(!confirm)}>
            <Trash2 size={13} />
            {confirm ? "Cancelar retiro" : "Retirar"}
          </button>
        )}
      </footer>
      {confirm && (
        <div className={styles.confirm}>
          <span>La conversación y sus respuestas dejarán de ser públicas.</span>
          <button
            className="button secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await api(`forum/${thread.id}`, { method: "DELETE" });
                await onRemoved();
              } catch (failure) {
                setError((failure as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Confirmar retiro
          </button>
        </div>
      )}
      {error && <Notice error>{error}</Notice>}
      {open && <Comments incidentId={thread.id} namespace="forum" />}
    </article>
  );
}
