"use client";
import Link from "next/link";
import type { Incident, Category } from "@/lib/contracts";
import { dateLabel } from "@/lib/contracts";
export function Verification({
  incident,
}: {
  incident: Incident;
}): React.JSX.Element {
  return (
    <span className={incident.verified ? "status confirmed" : "status pending"}>
      {incident.verified ? "Confirmado por la comunidad" : "No verificado"}
    </span>
  );
}
export function ReportCard({
  incident,
  categories,
}: {
  incident: Incident;
  categories: Category[];
}): React.JSX.Element {
  const category = categories.find((c) => c.id === incident.type);
  return (
    <Link href={`/incidents/${incident.id}`} className="report-card">
      <div className="report-card-head">
        <span className="category-label">
          {category?.label || incident.type}
        </span>
        <span className="muted small">{dateLabel(incident.created_at)}</span>
      </div>
      <p>{incident.description}</p>
      <div className="report-card-footer">
        <Verification incident={incident} />
        <span className="muted small">
          {incident.district || incident.city || "Ubicación en el mapa"} ↗
        </span>
      </div>
    </Link>
  );
}
