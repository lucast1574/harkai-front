export type SupportContact = {
  label: string;
  phone: string;
  scope: "nacional" | "distrital";
  source_url: string;
  reviewed_at: string;
};
export type SupportDistrict = {
  country: string;
  city: string;
  district: string;
  contacts: SupportContact[];
};
export type SupportPlace = {
  id: string;
  name: string;
  kind: "hospital" | "health_center" | "support";
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  institution?: string;
  classification?: string;
  category?: string;
  registry_id?: string;
  source_updated_at?: string;
  source_url: string;
  location_source_url: string;
  reviewed_at: string;
};
export const SUPPORT_CITIES = {
  lima: { label: "Lima y Callao", latitude: -12.0464, longitude: -77.0428 },
  trujillo: { label: "Trujillo", latitude: -8.1116, longitude: -79.0287 },
};
