import { Icon } from "./elements";
import { ticketStateLabel, ticketDate, type Ticket } from "./types";

export default function TicketList({
  tickets,
  selectedID,
  onSelect,
}: {
  tickets: Ticket[];
  selectedID?: string;
  onSelect: (ticket: Ticket) => void;
}) {
  return (
    <ul className="helpdesk-list">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <button
            type="button"
            aria-pressed={selectedID === ticket.id}
            onClick={() => onSelect(ticket)}
          >
            <span className="helpdesk-state" data-state={ticket.state}>
              {ticketStateLabel(ticket.state)}
            </span>
            <strong>{ticket.title}</strong>
            {ticket.requester && <span>{ticket.requester.name}</span>}
            <time dateTime={ticket.createdAt}>
              {ticketDate(ticket.createdAt)}
            </time>
            {ticket.images.length > 0 && (
              <small>
                <Icon name="image" />
                {ticket.images.length}{" "}
                {ticket.images.length === 1 ? "captura" : "capturas"}
              </small>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
