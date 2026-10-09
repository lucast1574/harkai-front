export type Point = { latitude: number; longitude: number };
export type LocatedPoint = Point & { accuracy: number };
type LocationServices = {
  secure: boolean;
  geolocation?: Pick<Geolocation, "getCurrentPosition">;
};
export function locationError(code: number): string {
  if (code === 1)
    return "El navegador bloqueó la ubicación. Puedes habilitarla en los permisos del sitio o elegir una zona en el mapa.";
  if (code === 3)
    return "La ubicación tardó demasiado. En una PC puedes elegir tu zona directamente en el mapa.";
  return "El equipo no pudo determinar su ubicación. Elige una zona en el mapa para continuar.";
}
export async function locate(
  services: LocationServices = {
    secure: window.isSecureContext,
    geolocation: navigator.geolocation,
  },
): Promise<LocatedPoint> {
  if (!services.secure)
    throw new Error(
      "Abre Harkai por HTTPS para usar tu ubicación, o elige una zona en el mapa.",
    );
  if (!services.geolocation)
    throw new Error(
      "Este navegador no ofrece ubicación. Elige una zona en el mapa.",
    );
  return new Promise((resolve, reject) => {
    services.geolocation!.getCurrentPosition(
      ({ coords }) => {
        if (
          !Number.isFinite(coords.latitude) ||
          !Number.isFinite(coords.longitude) ||
          Math.abs(coords.latitude) > 90 ||
          Math.abs(coords.longitude) > 180
        )
          return reject(new Error(locationError(2)));
        return resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
      },
      (error) => reject(new Error(locationError(error.code))),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 },
    );
  });
}
