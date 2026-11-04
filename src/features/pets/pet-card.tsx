"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, PawPrint, Phone } from "lucide-react";
import { dateLabel, type Incident } from "@/lib/contracts";
import { Verification } from "../reports/report-card";
import { distanceLabel } from "./pet-results";
import styles from "./pets.module.css";

export function PetCard({
  incident,
  meters,
}: {
  incident: Incident;
  meters: number;
}): React.JSX.Element {
  const [failedPhoto, setFailedPhoto] = useState("");
  const hasPhoto = incident.media_id && failedPhoto !== incident.media_id;
  return (
    <article className={styles.card}>
      <Link className={styles.caseLink} href={`/incidents/${incident.id}`}>
        <div className={styles.photo}>
          {hasPhoto ? (
            <Image
              src={`/api/backend/media/${incident.media_id}`}
              alt="Foto compartida en el aviso de esta mascota"
              fill
              sizes="(min-width: 1400px) 28vw, (min-width: 1000px) 40vw, 85vw"
              unoptimized
              onError={() => setFailedPhoto(incident.media_id!)}
            />
          ) : (
            <div className={styles.noPhoto}>
              <PawPrint size={40} strokeWidth={1.3} aria-hidden="true" />
              <span>
                {failedPhoto ? "Foto no disponible" : "Aviso sin foto"}
              </span>
            </div>
          )}
          <span className={styles.distance}>
            <MapPin size={13} aria-hidden="true" /> A {distanceLabel(meters)}
          </span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            <span>
              {incident.status === "resolved"
                ? "Caso resuelto"
                : "Aviso de mascota"}
            </span>
            {incident.contact_info && (
              <span title="El autor compartió un contacto">
                <Phone size={13} aria-label="Con contacto" />
              </span>
            )}
          </div>
          <h2>{incident.description}</h2>
          <p className={styles.location}>
            <MapPin size={14} aria-hidden="true" />
            {incident.district || incident.city || "Ubicación en el aviso"}
          </p>
          <time dateTime={incident.created_at}>
            {dateLabel(incident.created_at)}
          </time>
          <div className={styles.cardFooter}>
            <Verification incident={incident} />
            <span className={styles.viewCase}>
              Ver caso <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
