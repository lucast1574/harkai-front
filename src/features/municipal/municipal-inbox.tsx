"use client";
import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Notice, Select } from "@/components/ui";
import TicketList from "@/features/tickets/ticket-list";
import TicketDialog from "@/features/tickets/ticket-dialog";
import {
  supportStates,
  type Ticket,
  type TicketPage,
} from "@/features/tickets/types";

export function MunicipalInbox(): React.JSX.Element {
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const result = useResource<TicketPage>(
    `admin/support/tickets?kind=municipal&page=${page}${state ? `&state=${state}` : ""}`,
  );
  return (
    <section className="panel municipal-inbox">
      <header>
        <h2>Solicitudes municipales</h2>
        <p className="muted">
          Contactos recibidos desde la web. Coordina el acuerdo y registra aquí
          el seguimiento.
        </p>
      </header>
      <div className="page-actions">
        <Select
          label="Estado"
          value={state}
          onChange={(event) => {
            setState(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          {supportStates.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
        <button
          className="button secondary"
          onClick={() => void result.reload()}
          disabled={result.loading}
        >
          Actualizar
        </button>
      </div>
      {result.error && <Notice error>{result.error}</Notice>}
      {result.loading ? (
        <Notice>Cargando solicitudes…</Notice>
      ) : (
        result.data && (
          <>
            <p className="muted small">{result.data.total} solicitudes</p>
            {result.data.items.length ? (
              <TicketList tickets={result.data.items} onSelect={setSelected} />
            ) : (
              <Notice>No hay solicitudes con este estado.</Notice>
            )}
            {result.data.pages > 1 && (
              <div className="page-actions">
                <button
                  className="button secondary"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Anterior
                </button>
                <span>
                  Página {page} de {result.data.pages}
                </span>
                <button
                  className="button secondary"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= result.data.pages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )
      )}
      {selected && (
        <TicketDialog
          ticket={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            setSelected(null);
            void result.reload();
          }}
        />
      )}
    </section>
  );
}
