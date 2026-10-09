import { NextRequest, NextResponse } from "next/server";
import {
  allowedOrigin,
  backend,
  bearer,
  COOKIE_REFRESH,
  cookiesFor,
} from "@/lib/server/backend";
import type { AuthResult } from "@/lib/contracts";
import { limitedBody } from "@/lib/server/body";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest): Promise<Response> {
  const response = await backend("me", { headers: bearer(request) });
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
export async function POST(request: NextRequest): Promise<Response> {
  if (!allowedOrigin(request)) return new Response(null, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 8192)
    return new Response(null, { status: 413 });
  let input: {
    mode?: string;
    email?: string;
    password?: string;
    name?: string;
    id_token?: string;
  };
  try {
    input = JSON.parse(
      new TextDecoder().decode(await limitedBody(request, 8192)),
    );
  } catch (error) {
    return new Response(null, {
      status: error instanceof RangeError ? 413 : 400,
    });
  }
  if (!["login", "register", "google"].includes(input.mode || ""))
    return new Response(null, { status: 400 });
  const { mode, ...credentials } = input;
  const response = await backend(`auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (!response.ok) return NextResponse.json(data, { status: response.status });
  const auth = data as AuthResult;
  return cookiesFor(NextResponse.json(auth.user), auth);
}
export async function PUT(request: NextRequest): Promise<Response> {
  if (!allowedOrigin(request)) return new Response(null, { status: 403 });
  const current = await backend("me", { headers: bearer(request) });
  if (current.ok) return current;
  if (current.status !== 401) return current;
  const token = request.cookies.get(COOKIE_REFRESH)?.value;
  if (!token) return cookiesFor(new NextResponse(null, { status: 401 }));
  const response = await backend("auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
  });
  if (!response.ok)
    return response.status === 401
      ? cookiesFor(new NextResponse(null, { status: 401 }))
      : response;
  const auth = (await response.json()) as AuthResult;
  return cookiesFor(NextResponse.json(auth.user), auth);
}
export async function DELETE(request: NextRequest): Promise<Response> {
  if (!allowedOrigin(request)) return new Response(null, { status: 403 });
  const response = await backend("auth/logout", {
    method: "POST",
    headers: bearer(request),
  });
  if (!response.ok && response.status !== 401) return response;
  return cookiesFor(new NextResponse(null, { status: 204 }));
}
