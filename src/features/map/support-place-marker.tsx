"use client";
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
      <Popup>
        <strong>{place.name}</strong>
        <p>{place.classification || "Salud y ayuda"} · Lugar permanente</p>
        {place.institution && (
          <p>
            {place.institution}
            {place.category && ` · Categoría ${place.category}`}
          </p>
        )}
        <p>No es una alerta. Consulta disponibilidad antes de acudir.</p>
        <p>
          {place.address} · {place.district}
        </p>
        {place.phone && (
          <p>
            <a href={`tel:${place.phone}`}>Contacto: {place.phone}</a>
          </p>
        )}
        <a href={place.source_url} target="_blank" rel="noopener noreferrer">
          Consultar fuente institucional
        </a>
      </Popup>
    </Marker>
  );
}
