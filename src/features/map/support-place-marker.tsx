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
        <p>Centro de salud / ayuda · Directorio institucional</p>
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
