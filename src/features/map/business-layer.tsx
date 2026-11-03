"use client";
import Image from "next/image";
import { useState } from "react";
import { divIcon } from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { businessKinds, type Business } from "../business/business-contract";
const icon = divIcon({
  className: "business-map-marker",
  iconSize: [44, 50],
  iconAnchor: [22, 50],
  popupAnchor: [0, -44],
  tooltipAnchor: [0, -38],
  html: '<span class="business-map-symbol"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M9 4l-1 6M15 4l1 6"/></svg></span>',
});
export function BusinessLayer({
  points,
}: {
  points: Business[];
}): React.JSX.Element {
  return (
    <>
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={icon}
          title={point.name}
          alt={`Negocio: ${point.name}`}
        >
          <Tooltip direction="top" className="business-map-tooltip">
            {point.name}
          </Tooltip>
          <Popup className="business-map-popup">
            <BusinessPreview key={point.media_id || point.id} point={point} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function BusinessPreview({ point }: { point: Business }): React.JSX.Element {
  const [failed, setFailed] = useState(false);
  if (point.media_id && !failed) {
    return (
      <Image
        className="business-map-photo"
        unoptimized
        width={320}
        height={240}
        src={`/api/backend/media/${point.media_id}`}
        alt={`Foto de ${point.name}`}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="business-map-detail">
      <span>{businessKinds[point.kind] || "Negocio local"}</span>
      <h2>{point.name}</h2>
      <p>{point.description}</p>
    </div>
  );
}
