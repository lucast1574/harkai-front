"use client";
import Image from "next/image";
import { memo, useMemo, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { Marker, Popup } from "react-leaflet";
import { supportPlaceIcon } from "./map-icons";
import { placeKind } from "../support/place-kind";
import type { SupportPlace } from "../support/contracts";
export const SupportPlaceMarker = memo(function SupportPlaceMarker({
  place,
}: {
  place: SupportPlace;
}): React.JSX.Element {
  // A new position array makes React Leaflet move the marker and update its
  // popup, which can pan the map and trigger another viewport render.
  const position = useMemo<[number, number]>(
    () => [place.latitude, place.longitude],
    [place.latitude, place.longitude],
  );
  return (
    <Marker
      position={position}
      icon={supportPlaceIcon(place.kind)}
      alt={`${placeKind(place.kind).label}: ${place.name}`}
      title={`${placeKind(place.kind).label}: ${place.name}`}
      zIndexOffset={200}
    >
      <Popup
        pane="popupPane"
        className="health-place-popup"
        maxWidth={260}
        autoPanPaddingTopLeft={[16, 64]}
        autoPanPaddingBottomRight={[52, 72]}
      >
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
});

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
