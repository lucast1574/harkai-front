"use client";
import { useState } from "react";
import Link from "next/link";
import { Heading } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import TicketComposer from "./ticket-composer";
import SupportBoard from "./support-board";

export function TicketsPage({ admin = false }: { admin?: boolean }) {
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);
  return (
    <div className="helpdesk-page">
      <Heading
        eyebrow="SOPORTE TÉCNICO · HARKAI"
        title={admin ? "Tickets de usuarios" : "Estamos para ayudarte"}
      >
        {admin
          ? "Revisa los fallos reportados, responde y actualiza su estado. El usuario recibirá un correo cuando resuelvas su ticket."
          : "Cuéntanos qué falló en la app y consulta aquí el seguimiento del equipo."}
      </Heading>
      <p className="helpdesk-intro">
        Este espacio atiende fallos de Harkai. Para una emergencia, utiliza los
        contactos de <Link href="/dashboard/help">Ayuda y orientación</Link>.
      </p>
      {!admin && user?.role === "admin" && (
        <div className="page-actions">
          <Link className="button secondary" href="/dashboard/tickets/admin">
            Abrir bandeja administrativa
          </Link>
        </div>
      )}
      {!admin && (
        <TicketComposer onCreated={() => setRevision((value) => value + 1)} />
      )}
      <SupportBoard key={revision} admin={admin} revision={revision} />
    </div>
  );
}
