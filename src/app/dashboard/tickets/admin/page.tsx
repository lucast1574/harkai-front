import { Access } from "@/components/access";
import { TicketsPage } from "@/features/tickets/tickets-page";

export default function Page() {
  return (
    <Access roles={["admin"]}>
      <TicketsPage admin />
    </Access>
  );
}
