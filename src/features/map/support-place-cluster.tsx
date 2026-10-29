"use client";
import { memo, useCallback } from "react";
import { latLngBounds } from "leaflet";
import { Marker, Tooltip, useMap } from "react-leaflet";
import type { SupportMapGroup } from "@/lib/support-map-index";
import { supportPlaceIcon } from "./map-icons";
import { placeKind } from "../support/place-kind";

export const SupportPlaceCluster = memo(function SupportPlaceCluster({
  group,
}: {
  group: SupportMapGroup;
}): React.JSX.Element {
  const map = useMap();
  const label = placeKind(group.places[0].kind).label;
  const expand = useCallback(() => {
    map.fitBounds(
      latLngBounds(
        group.places.map((place) => [place.latitude, place.longitude]),
      ),
      { maxZoom: 17, padding: [40, 40] },
    );
  }, [group, map]);
  return (
    <Marker
      position={group.position}
      icon={supportPlaceIcon(group.places[0].kind)}
      alt={`${group.places.length} · ${label}. Acercar para verlos`}
      title={`${group.places.length} · ${label}. Acercar para verlos`}
      eventHandlers={{ click: expand }}
    >
      <Tooltip pane="tooltipPane">
        {group.places.length} · {label} · acerca el mapa para verlos
      </Tooltip>
    </Marker>
  );
});
