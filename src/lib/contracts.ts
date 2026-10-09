export type Role = "user" | "gov" | "admin";
export type Preferences = {
  notifications: "all" | "critical" | "none";
  radius_meters: number;
  language: "es" | "en";
  theme: "system" | "light" | "dark";
};
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  preferences: Preferences;
  created_at: string;
};
export type Incident = {
  id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  status: "active" | "resolved" | "hidden";
  verified: boolean;
  viewer_is_author?: boolean;
  verification?: string;
  created_at: string;
  expires_at?: string;
  media_id?: string;
  contact_info?: string;
  district?: string;
  city?: string;
};
export type Page<T> = { items: T[]; next_cursor?: string };
export type Category = {
  id: string;
  label: string;
  group: string;
  critical: boolean;
  advice: string[];
};
export type Meta = {
  categories: Category[];
  capabilities: Record<string, boolean>;
};
export type Analysis = {
  suggested_type?: string;
  candidates: string[];
  requires_confirmation: boolean;
  reason: string;
  advice: string[];
};
export type AuthResult = {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
};
export type Area = {
  district?: string;
  before?: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: string;
  after: string;
};
export const LIMA: Area = {
  latitude: -12.0464,
  longitude: -77.0428,
  radius: 5000,
  type: "",
  after: "",
};
export function areaQuery(area: Area): string {
  const q = new URLSearchParams({
    lat: String(area.latitude),
    lng: String(area.longitude),
    radius_meters: String(area.radius),
    limit: "100",
  });
  if (area.district) q.set("district", area.district);
  if (area.before) q.set("before", new Date(area.before).toISOString());
  if (area.type) q.set("type", area.type);
  if (area.after) q.set("after", new Date(area.after).toISOString());
  return q.toString();
}
export function reportURL(id: string): string {
  return `https://panel.harkai.lat/incidents/${encodeURIComponent(id)}`;
}
export function dateLabel(date: string): string {
  return new Date(date).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
