import { Flame, Hospital, LifeBuoy, Shield } from "lucide-react";
import type { SupportPlace } from "./contracts";

export function placeKind(kind: SupportPlace["kind"]) {
  switch (kind) {
    case "police":
      return { label: "Comisaría", Icon: Shield };
    case "fire_station":
      return { label: "Estación de bomberos", Icon: Flame };
    case "hospital":
      return { label: "Hospital o clínica", Icon: Hospital };
    case "health_center":
      return { label: "Centro de salud", Icon: Hospital };
    default:
      return { label: "Lugar de apoyo", Icon: LifeBuoy };
  }
}
