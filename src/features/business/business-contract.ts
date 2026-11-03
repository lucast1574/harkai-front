export const businessKinds: Record<string, string> = {
  restaurant: "Restaurante",
  health: "Salud y odontología",
  shop: "Tienda",
  service: "Servicios",
  other: "Otro negocio",
};
export type BusinessDraft = {
  name: string;
  description: string;
  kind: string;
  address: string;
  phone: string;
  website: string;
  offer: string;
  discount_code: string;
  latitude: number;
  longitude: number;
  media_id?: string;
  subtype?: string;
  city?: string;
  district?: string;
};
export type Business = BusinessDraft & {
  id: string;
  moderation: string;
  enabled: boolean;
  payment_mode: string;
  billing_status: string;
};
export const emptyBusiness: BusinessDraft = {
  name: "",
  description: "",
  kind: "restaurant",
  address: "",
  phone: "",
  website: "",
  offer: "",
  discount_code: "",
  latitude: -12.0464,
  longitude: -77.0428,
};
export function businessStatus(point: Business): string {
  if (!point.enabled) return "Pausado";
  if (point.moderation === "rejected") return "Necesita cambios";
  if (point.moderation !== "approved") return "En revisión";
  return point.billing_status === "active"
    ? "Aprobado"
    : "Pendiente de activación";
}
