import type { User } from "./contracts";
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(errorLabel(status, code));
  }
}
function errorLabel(status: number, code: string): string {
  if (code === "content_rejected")
    return "Edita las groserías u obscenidades antes de publicar. Tu texto se conserva para corregirlo.";
  if (code === "mobile_publication_only")
    return "Los reportes se publican desde la app móvil de Harkai.";
  if (code === "image_rejected")
    return "La foto no pasó la revisión. Elige otra evidencia.";
  return (
    (
      {
        400: "Revisa los campos y vuelve a intentarlo.",
        401: "Inicia sesión para continuar.",
        403: "Tu cuenta no tiene permiso para esta acción.",
        404: "El contenido no está disponible.",
        409: "La acción ya se realizó o el estado del reporte cambió.",
        429: "Llegaste al límite de intentos. Inténtalo más tarde.",
        503: "El servicio no está disponible por el momento.",
      } as Record<number, string>
    )[status] || "No se pudo completar la solicitud. Inténtalo otra vez."
  );
}
async function read<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(response.status, data?.error?.code || "request_failed");
  return data as T;
}
let refreshing: Promise<boolean> | undefined;
async function refreshSession(): Promise<boolean> {
  const run = async () => (await fetch("/api/session", { method: "PUT" })).ok;
  if (!refreshing) {
    refreshing = Promise.resolve(
      navigator.locks ? navigator.locks.request("harkai-session", run) : run(),
    )
      .then((value) => value)
      .finally(() => {
        refreshing = undefined;
      });
  }
  return refreshing!;
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const options = {
    ...init,
    headers: {
      ...(init.body && typeof init.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
    cache: "no-store" as RequestCache,
  };
  let response = await fetch(`/api/backend/${path}`, options);
  if (response.status === 401 && (await refreshSession()))
    response = await fetch(`/api/backend/${path}`, options);
  return read<T>(response);
}
export async function session(method = "GET", body?: unknown): Promise<User> {
  return read<User>(
    await fetch("/api/session", {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    }),
  );
}
