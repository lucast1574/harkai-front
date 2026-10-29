import { divIcon } from "leaflet";
export const medicalIcon = divIcon({
  className: "medical-marker",
  html: '<span class="medical-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" fill="white"/></svg></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -10],
});
export const userIcon = divIcon({
  className: "user-location-marker",
  html: '<span class="user-location-symbol" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#267eff" stroke="white" stroke-width="4"/><circle cx="16" cy="16" r="4" fill="white"/></svg></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});

const emergencyPaths = {
  police:
    "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Zm0 4 5 2v4c0 2-3 5-5 6-2-1-5-4-5-6V8Z",
  fire_station:
    "M13 2c1 6-4 6-2 11-2-1-3-3-3-5-4 4-5 7-3 11 3 5 12 5 15-1 3-6-2-11-7-16Z",
};
const emergencyIcons = Object.fromEntries(
  Object.entries(emergencyPaths).map(([kind, path]) => [
    kind,
    divIcon({
      className: `medical-marker ${kind}-marker`,
      html: `<span class="medical-symbol ${kind}-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${path}" fill="white"/></svg></span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -10],
    }),
  ]),
);
export function supportPlaceIcon(kind: string) {
  return emergencyIcons[kind] || medicalIcon;
}
