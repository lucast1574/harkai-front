"use client";
import { divIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { businessKinds, type Business } from "../business/business-contract";
const icon = divIcon({
  className: "business-map-marker",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  html: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 10h18l-2-6H5l-2 6Zm2 0v10h14V10M9 20v-6h6v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></svg>',
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
        >
          <Popup>
            <div className="business-map-detail">
              <p>Negocio promocionado</p>
              <h2>{point.name}</h2>
              <p>{businessKinds[point.kind]}</p>
              <p>{point.description}</p>
              {point.offer && <strong>{point.offer}</strong>}
              {point.discount_code && <p>Código: {point.discount_code}</p>}
              <p>{point.address}</p>
              {point.phone && (
                <a href={`tel:${point.phone}`}>Llamar al negocio</a>
              )}
              {point.website?.startsWith("https://") && (
                <p>
                  <a
                    href={point.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visitar sitio web
                  </a>
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
