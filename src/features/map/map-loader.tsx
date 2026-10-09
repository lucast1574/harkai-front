"use client";
import dynamic from "next/dynamic";
import { Notice } from "@/components/ui";
const ZoneMap = dynamic(() => import("./zone-map"), {
  ssr: false,
  loading: () => <Notice>Cargando el mapa…</Notice>,
});
export default ZoneMap;
