"use client";
import { useState } from "react";
import {
  ticketDate,
  ticketStateLabel,
  type Ticket,
  type SupportState,
} from "./types";
import { useTickets } from "./use-tickets";
type Props = {
  state: SupportState;
  busy: boolean;
  dragged: Ticket | null;
  onDrag(ticket: Ticket | null): void;
  onMove(state: SupportState, id: string): Promise<void>;
  onSelect(ticket: Ticket): void;
};
export default function KanbanColumn({
  state,
  busy,
  dragged,
  onDrag,
  onMove,
  onSelect,
}: Props) {
  const [page, setPage] = useState(1),
    [over, setOver] = useState(false);
  const { data, loading, error } = useTickets(true, state, page, 0);
  const canDrop =
    !busy && !!dragged && dragged.state !== state && dragged.state !== "DONE";
  return (
    <section
      className="helpdesk-kanban-column"
      data-state={state}
      data-over={over && canDrop}
      aria-label={ticketStateLabel(state)}
      onDragOver={(event) => {
        if (canDrop) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setOver(true);
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        if (canDrop)
          void onMove(state, event.dataTransfer.getData("text/plain"));
      }}
    >
      <header>
        <h3>
          <span className="helpdesk-kanban-dot" />
          {ticketStateLabel(state)}
        </h3>
        <span className="helpdesk-kanban-total">{data ? data.total : "—"}</span>
      </header>
      {loading ? (
        <p className="helpdesk-kanban-empty" role="status">
          Cargando tickets…
        </p>
      ) : error ? (
        <p className="helpdesk-kanban-empty" role="alert">
          {error}
        </p>
      ) : (
        <>
          <div className="helpdesk-kanban-cards">
            {data?.items.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                className="helpdesk-kanban-card"
                disabled={busy}
                draggable={!busy && ticket.state !== "DONE"}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", ticket.id);
                  event.dataTransfer.effectAllowed = "move";
                  onDrag(ticket);
                }}
                onDragEnd={() => onDrag(null)}
                onClick={() => onSelect(ticket)}
              >
                <span className="helpdesk-kanban-id">
                  #{ticket.id.slice(-8).toUpperCase()}
                  {ticket.images.length > 0
                    ? ` · ${ticket.images.length} adjunto${ticket.images.length === 1 ? "" : "s"}`
                    : ""}
                </span>
                <strong>{ticket.title}</strong>
                {ticket.requester && (
                  <span className="helpdesk-kanban-person">
                    <span className="helpdesk-kanban-avatar" aria-hidden="true">
                      {ticket.requester.name.trim().slice(0, 1).toUpperCase() ||
                        "U"}
                    </span>
                    <span>
                      <b>{ticket.requester.name}</b>
                      <small>{ticket.requester.email}</small>
                    </span>
                  </span>
                )}
                <time dateTime={ticket.createdAt}>
                  {ticketDate(ticket.createdAt)}
                </time>
              </button>
            ))}
          </div>
          {!data?.items.length && (
            <p className="helpdesk-kanban-empty">Sin tickets en este estado</p>
          )}
          {data && (data.pages > 1 || page > 1) && (
            <nav
              className="helpdesk-kanban-pagination"
              aria-label={`Páginas de ${ticketStateLabel(state)}`}
            >
              <button
                type="button"
                disabled={page <= 1 || busy}
                onClick={() => setPage((value) => value - 1)}
              >
                Anterior
              </button>
              <span>
                {page} / {Math.max(page, data.pages)}
              </span>
              <button
                type="button"
                disabled={page >= data.pages || busy}
                onClick={() => setPage((value) => value + 1)}
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
