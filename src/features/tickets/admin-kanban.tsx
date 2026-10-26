"use client";
import { useState } from "react";
import { Alert } from "./elements";
import { Icon } from "./elements";
import { api } from "./api";
import {
  supportStates,
  ticketStateLabel,
  type Ticket,
  type SupportState,
} from "./types";
import KanbanColumn from "./kanban-column";
import TicketDialog from "./ticket-dialog";

export default function AdminKanban({ revision = 0 }: { revision?: number }) {
  const [refresh, setRefresh] = useState(0),
    [selected, setSelected] = useState<Ticket | null>(null);
  const [dragged, setDragged] = useState<Ticket | null>(null),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  function reload() {
    setSelected(null);
    setDragged(null);
    setRefresh((value) => value + 1);
  }
  async function move(state: SupportState, id: string) {
    const ticket = dragged;
    setDragged(null);
    if (
      !ticket ||
      ticket.id !== id ||
      ticket.state === state ||
      ticket.state === "DONE" ||
      busy
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/api/backend/admin/support/tickets/${ticket.id}`, "PATCH", {
        state,
        note: "",
        version: ticket.version,
      });
      setNotice(
        `Reporte movido a ${ticketStateLabel(state)}.${state === "DONE" ? " El aviso por correo quedó pendiente de envío." : ""}`,
      );
      reload();
    } catch (failure) {
      setError((failure as Error).message);
      reload();
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="helpdesk-card helpdesk-inbox helpdesk-admin-kanban"
      id="support"
      aria-label="Tickets de soporte"
    >
      <div className="helpdesk-section-head">
        <div>
          <p className="eyebrow">SOPORTE · TABLERO KANBAN</p>
          <h2>Tickets de soporte</h2>
          <p className="helpdesk-hint">
            Arrastra un ticket o ábrelo para cambiar su estado y responder al
            usuario.
          </p>
          <p className="helpdesk-hint">
            Al resolverlo, el usuario recibe un correo. Los tickets resueltos
            conservan su historial.
          </p>
        </div>
        <button className="helpdesk-refresh" onClick={reload} disabled={busy}>
          <Icon name="refresh" />
          Actualizar
        </button>
      </div>
      <Alert>{error}</Alert>
      <Alert variant="success">{notice}</Alert>
      <div className="helpdesk-kanban" aria-busy={busy}>
        {supportStates.map((state) => (
          <KanbanColumn
            key={`${state.id}:${revision}:${refresh}`}
            state={state.id}
            busy={busy}
            dragged={dragged}
            onDrag={setDragged}
            onMove={move}
            onSelect={setSelected}
          />
        ))}
      </div>
      <p className="helpdesk-kanban-keyboard">
        También puedes abrir cualquier tarjeta con Enter y cambiar el estado
        desde su detalle.
      </p>
      {selected && (
        <TicketDialog
          ticket={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            setNotice("Seguimiento guardado.");
            reload();
          }}
        />
      )}
    </section>
  );
}
