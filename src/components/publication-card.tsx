import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CarFront,
  CheckCircle2,
  Flame,
  HeartPulse,
  MapPin,
  MessageCircle,
  PawPrint,
  ShieldAlert,
} from "lucide-react";
import { dateLabel, type Incident } from "@/lib/contracts";
import { labels, photo } from "@/lib/server/publications";

export function PublicationCard({
  incident: i,
}: {
  incident: Incident;
}): React.JSX.Element {
  const Icon =
    i.type === "fire"
      ? Flame
      : i.type === "emergency"
        ? HeartPulse
        : i.type === "crash"
          ? CarFront
          : i.type === "pet"
            ? PawPrint
            : ShieldAlert;
  const headline =
    i.description.trim().split("\n")[0] || labels[i.type] || "Reporte vecinal";
  const extra = i.description.trim().slice(headline.length).trim();
  const location = [i.district, i.city].filter(Boolean).join(", ") || "Perú";
  const image = photo(i);
  return (
    <article>
      <Link
        href={`/incidents/${i.id}`}
        className="publication-card"
        aria-label={`Ver reporte: ${headline}. ${location}`}
      >
        <div className="publication-card-top">
          <span className="publication-category">
            <Icon size={18} aria-hidden="true" />
            {labels[i.type] || "Reporte vecinal"}
          </span>
          <span
            className={`publication-verification ${i.verified ? "confirmed" : ""}`}
          >
            {i.verified && <CheckCircle2 size={14} aria-hidden="true" />}
            {i.verified ? "Confirmado por vecinos" : "Sin verificar"}
          </span>
        </div>
        {image && (
          <Image
            src={image}
            width={900}
            height={460}
            alt="Foto adjunta al reporte"
            className="publication-card-photo"
            unoptimized
          />
        )}
        <h2>{headline}</h2>
        <p className="publication-card-location">
          <MapPin size={15} aria-hidden="true" />
          {location}
        </p>
        {extra && <p className="publication-card-excerpt">{extra}</p>}
        <div className="publication-card-bottom">
          <time dateTime={i.created_at}>{dateLabel(i.created_at)}</time>
          <span className="publication-card-action">
            <MessageCircle size={16} aria-hidden="true" />
            Ver reporte y conversación
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
