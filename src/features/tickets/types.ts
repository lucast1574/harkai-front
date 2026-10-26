export const supportStates = [
  { id: "OPEN", label: "Por atender" },
  { id: "IN_PROGRESS", label: "En atención" },
  { id: "WAITING", label: "En espera" },
  { id: "DONE", label: "Resuelto" },
] as const;
export type SupportState = (typeof supportStates)[number]["id"];
export type Ticket = {
  id: string;
  title: string;
  description: string;
  state: SupportState;
  version: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  history: { state: SupportState; note?: string; at: string }[];
  requester?: { name: string; email: string };
};
export type TicketPage = {
  items: Ticket[];
  total: number;
  page: number;
  pages: number;
};
export const ticketStateLabel = (state: string) =>
  supportStates.find((item) => item.id === state)?.label ?? state;
export const ticketDate = (raw: string) =>
  new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(raw));
export type Screenshot = { name: string; data: string };
export function submissionFor(
  previous: { key: string; payload: string } | null,
  payload: string,
  newID: () => string,
) {
  return previous?.payload === payload ? previous : { key: newID(), payload };
}
