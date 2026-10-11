"use client";
import dynamic from "next/dynamic";
import { Notice } from "@/components/ui";
import type { ZoneMapProps } from "./zone-map";
const Map = dynamic(() => import("./zone-map"), {
  ssr: false,
  loading: () => <Notice>Cargando el mapa…</Notice>,
});
export default function ZoneMap(props: ZoneMapProps): React.JSX.Element {
  if (!props.area.geography && props.area.geoPending)
    return (
      <div className="map-preparing" role="status">
        Preparando el mapa de tu distrito…
      </div>
    );
  if (props.area.geoError && !props.area.geography)
    return (
      <div className="map-preparing">
        Elige un distrito para mostrar su mapa.
      </div>
    );
  return <Map {...props} />;
}
