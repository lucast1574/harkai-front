"use client";
import { useCallback, useSyncExternalStore } from "react";
import { divIcon, latLngBounds } from "leaflet";
import { Marker, Pane, Tooltip, useMap } from "react-leaflet";
import type { SupportPlace } from "../support/contracts";
import { SupportPlaceMarker } from "./support-place-marker";

export function SupportPlaceLayer({
  places,
}: {
  places: SupportPlace[];
}): React.JSX.Element {
  const map = useMap();
  const subscribe = useCallback(
    (listener: () => void) => {
      map.on("moveend zoomend resize", listener);
      return () => {
        map.off("moveend zoomend resize", listener);
      };
    },
    [map],
  );
  const snapshot = useCallback(
    () => `${map.getZoom()}:${map.getBounds().toBBoxString()}`,
    [map],
  );
  useSyncExternalStore(subscribe, snapshot, snapshot);
  const bounds = map.getBounds().pad(0.2);
  const zoom = map.getZoom();
  const groups = new Map<string, SupportPlace[]>();
  for (const place of places) {
    if (!bounds.contains([place.latitude, place.longitude])) continue;
    const pixel = map.project([place.latitude, place.longitude], zoom);
    const key =
      zoom >= 16
        ? place.id
        : `${Math.floor(pixel.x / 96)}:${Math.floor(pixel.y / 96)}`;
    const group = groups.get(key) || [];
    group.push(place);
    groups.set(key, group);
  }
  return (
    <Pane name="health-resources" style={{ zIndex: 450 }}>
      {[...groups.entries()].map(([key, group]) => {
        if (group.length === 1)
          return <SupportPlaceMarker key={key} place={group[0]} />;
        const center: [number, number] = [
          group.reduce((total, place) => total + place.latitude, 0) /
            group.length,
          group.reduce((total, place) => total + place.longitude, 0) /
            group.length,
        ];
        const icon = divIcon({
          className: "medical-marker",
          html: '<span class="medical-symbol medical-group" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" fill="white"/></svg></span>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return (
          <Marker
            key={key}
            position={center}
            icon={icon}
            alt={`${group.length} lugares de salud. Acercar para verlos`}
            title={`${group.length} lugares de salud. Acercar para verlos`}
            eventHandlers={{
              click: () =>
                map.fitBounds(
                  latLngBounds(
                    group.map(
                      (place) =>
                        [place.latitude, place.longitude] as [number, number],
                    ),
                  ),
                  { maxZoom: 17, padding: [40, 40] },
                ),
            }}
          >
            <Tooltip pane="tooltipPane">
              {group.length} lugares de salud · acerca el mapa para verlos
            </Tooltip>
          </Marker>
        );
      })}
    </Pane>
  );
}
