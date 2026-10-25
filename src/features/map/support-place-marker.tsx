"use client";
import { MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Marker, Popup } from "react-leaflet";
import { medicalIcon } from "./map-icons";
import type { SupportPlace } from "../support/contracts";
export function SupportPlaceMarker({
  place,
}: {
  place: SupportPlace;
}): React.JSX.Element {
  return (
    <Marker
      position={[place.latitude, place.longitude]}
      icon={medicalIcon}
      alt={`Salud y ayuda: ${place.name}`}
      title={`Salud y ayuda: ${place.name}`}
      zIndexOffset={200}
    >
      <Popup className="health-place-popup">
        <div className="health-place-card">
          <span className="health-place-kind">
            {place.kind === "hospital"
              ? "Hospital o clínica"
              : "Centro de salud"}
          </span>
          <strong>{place.name}</strong>
          <p>
            <MapPin size={14} aria-hidden="true" />
            <span>
              {place.address} · {place.district}
            </span>
          </p>
          <div className="health-place-actions">
            {place.phone && (
              <a href={`tel:${place.phone}`}>
                <Phone size={14} aria-hidden="true" />
                Llamar
              </a>
            )}
            <a
              href={place.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver fuente
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
