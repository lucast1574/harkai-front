export type Point = { latitude: number; longitude: number };
export type LocatedPoint = Point & { accuracy: number };
type LocationServices = {
  secure: boolean;
  geolocation?: Pick<Geolocation, "getCurrentPosition">;
};
type LocateOptions = { signal?: AbortSignal; timeoutMs?: number };
export function validPoint(point: Point): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 85 &&
    Math.abs(point.longitude) <= 180
  );
}
export function locationError(code: number): string {
  if (code === 1)
    return "El navegador bloqueó la ubicación. Puedes habilitarla en los permisos del sitio o elegir una zona en el mapa.";
  if (code === 3)
    return "La ubicación tardó demasiado. Elige una ciudad o ajusta tu zona directamente en el mapa.";
  return "El equipo no pudo determinar su ubicación. Elige una zona en el mapa para continuar.";
}
export async function locate(
  services: LocationServices = {
    secure: window.isSecureContext,
    geolocation: navigator.geolocation,
  },
  { signal, timeoutMs = 12000 }: LocateOptions = {},
): Promise<LocatedPoint> {
  if (!services.secure)
    throw new Error(
      "Abre Harkai por HTTPS para usar tu ubicación, o elige una zona en el mapa.",
    );
  if (!services.geolocation)
    throw new Error(
      "Este navegador no ofrece ubicación. Elige una zona en el mapa.",
    );
  if (signal?.aborted)
    throw new DOMException("Búsqueda cancelada", "AbortError");
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (point?: LocatedPoint, error?: Error): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve(point!);
    };
    const abort = (): void =>
      finish(undefined, new DOMException("Búsqueda cancelada", "AbortError"));
    // Browser timeout excludes the permission prompt. Bound the entire interaction too.
    const timer = setTimeout(
      () => finish(undefined, new Error(locationError(3))),
      timeoutMs,
    );
    signal?.addEventListener("abort", abort, { once: true });
    try {
      services.geolocation!.getCurrentPosition(
        ({ coords }) => {
          const point = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          };
          if (
            !validPoint(point) ||
            !Number.isFinite(point.accuracy) ||
            point.accuracy < 0
          )
            return finish(undefined, new Error(locationError(2)));
          finish(point);
        },
        (error) => finish(undefined, new Error(locationError(error.code))),
        {
          enableHighAccuracy: false,
          timeout: Math.min(10000, timeoutMs),
          maximumAge: 30000,
        },
      );
    } catch {
      finish(undefined, new Error(locationError(2)));
    }
  });
}
export const ZONE_PRESETS = [
  { label: "Lima", latitude: -12.0464, longitude: -77.0428 },
  { label: "Trujillo", latitude: -8.1116, longitude: -79.0287 },
];
