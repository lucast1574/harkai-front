import { Access } from "@/components/access";
import { TicketsPage } from "@/features/tickets/tickets-page";

export default function Page() {
  return (
    <Access>
      <TicketsPage />
    </Access>
  );
}
