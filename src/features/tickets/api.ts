import { api as backendApi } from "@/lib/api";

export function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  return backendApi<T>(path.replace(/^\/api\/backend\//, ""), {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
