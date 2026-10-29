"use client";
import Image from "next/image";
import { useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { Marker, Popup } from "react-leaflet";
import { supportPlaceIcon } from "./map-icons";
import { placeKind } from "../support/place-kind";
import type { SupportPlace } from "../support/contracts";
export function SupportPlaceMarker({
  place,
}: {
  place: SupportPlace;
}): React.JSX.Element {
  return (
    <Marker
      position={[place.latitude, place.longitude]}
      icon={supportPlaceIcon(place.kind)}
      alt={`${placeKind(place.kind).label}: ${place.name}`}
      title={`${placeKind(place.kind).label}: ${place.name}`}
      zIndexOffset={200}
    >
      <Popup pane="popupPane" className="health-place-popup">
        <div className="health-place-card">
          <span className="health-place-kind">
            {placeKind(place.kind).label}
          </span>
          <strong>{place.name}</strong>
          {place.photo_urls?.[0] && (
            <PlacePhoto
              key={place.photo_urls[0]}
              src={place.photo_urls[0]}
              name={place.name}
            />
          )}
          <p>
            <MapPin size={14} aria-hidden="true" />
            <span>
              {place.address} · {place.district}
            </span>
          </p>
          {place.phone && (
            <div className="health-place-actions">
              {place.phone && (
                <a href={`tel:${place.phone}`}>
                  <Phone size={14} aria-hidden="true" />
                  Llamar
                </a>
              )}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

function PlacePhoto({
  src,
  name,
}: {
  src: string;
  name: string;
}): React.JSX.Element | null {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Image
      className="health-place-photo"
      src={src}
      alt={`Foto de ${name}`}
      width={560}
      height={320}
      sizes="280px"
      onError={() => setFailed(true)}
    />
  );
}
