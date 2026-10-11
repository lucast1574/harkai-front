import "server-only";
import { NextRequest, NextResponse } from "next/server";
import type { AuthResult } from "../contracts";
export const COOKIE_ACCESS = "harkai_access";
export const COOKIE_REFRESH = "harkai_refresh";
export function allowedOrigin(request: NextRequest): boolean {
  return (
    request.headers.get("origin") ===
    (process.env.APP_ORIGIN || "http://localhost:3000")
  );
}
export async function backend(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = process.env.API_BASE_URL || "https://api.harkai.lat";
  try {
    return await fetch(`${base}/v1/${path}`, {
      ...init,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(
        path === "media" || path.startsWith("analysis/audio") ? 45000 : 15000,
      ),
    });
  } catch {
    return Response.json({ error: { code: "unavailable" } }, { status: 503 });
  }
}
export function cookiesFor(
  response: NextResponse,
  result?: AuthResult,
): NextResponse {
  const config = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  response.cookies.set(COOKIE_ACCESS, result?.access_token || "", {
    ...config,
    maxAge: result ? result.expires_in + 60 : 0,
  });
  response.cookies.set(COOKIE_REFRESH, result?.refresh_token || "", {
    ...config,
    maxAge: result ? 30 * 86400 : 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
export function bearer(request: NextRequest): HeadersInit {
  const token = request.cookies.get(COOKIE_ACCESS)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
