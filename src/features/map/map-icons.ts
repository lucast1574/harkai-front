import { divIcon } from "leaflet";
export const medicalIcon = divIcon({
  className: "medical-marker",
  html: '<span class="medical-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" fill="white"/></svg></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});
export const userIcon = divIcon({
  className: "user-location-marker",
  html: '<span class="user-location-symbol" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#267eff" stroke="white" stroke-width="4"/><circle cx="16" cy="16" r="4" fill="white"/></svg></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});
