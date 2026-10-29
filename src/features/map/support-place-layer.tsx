"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Pane, useMap } from "react-leaflet";
import {
  createSupportMapIndex,
  visibleSupportGroups,
} from "@/lib/support-map-index";
import type { SupportPlace } from "../support/contracts";
import { SupportPlaceCluster } from "./support-place-cluster";
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
  const index = useMemo(
    () =>
      createSupportMapIndex(places, zoom, (place) =>
        map.project([place.latitude, place.longitude], zoom),
      ),
    [places, zoom, map],
  );
  const groups = visibleSupportGroups(
    index,
    map.project(bounds.getNorthWest(), zoom),
    map.project(bounds.getSouthEast(), zoom),
  );
  return (
    <Pane name="health-resources" style={{ zIndex: 450 }}>
      {groups.map((group) =>
        group.places.length === 1 ? (
          <SupportPlaceMarker
            key={group.places[0].id}
            place={group.places[0]}
          />
        ) : (
          <SupportPlaceCluster key={group.key} group={group} />
        ),
      )}
    </Pane>
  );
}
