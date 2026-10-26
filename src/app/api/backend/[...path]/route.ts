import { NextRequest } from "next/server";
import { allowedOrigin, backend, bearer } from "@/lib/server/backend";
import { limitedBody } from "@/lib/server/body";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const paths =
  /^(publications|businesses(?:\/[a-f0-9]{24})?|me\/businesses(?:\/[a-f0-9]{24}(?:\/enabled)?)?|admin\/businesses(?:\/[a-f0-9]{24}\/moderation)?|geo\/(?:district|catalog)|support\/(?:directory|places|coverage|tickets(?:\/[a-f0-9]{24}\/images\/[0-2])?)|admin\/support\/tickets(?:\/[a-f0-9]{24})?|meta|archive\/(?:incidents|districts)|me(?:\/account-deletion-options|\/preferences|\/incidents|\/devices(?:\/[a-f0-9]{64})?)?|alerts|emergency-contacts|analysis\/(?:text|audio)|incidents(?:\/[a-f0-9]{24}(?:\/confirm|\/status|\/comments(?:\/[a-f0-9]{24})?)?)?|media(?:\/[a-f0-9]{24})?|gov\/incidents|admin\/(?:incidents|emergency-contacts|users(?:\/[a-f0-9]{24}\/role)?))$/;
async function proxy(
  request: NextRequest,
  context: Context,
): Promise<Response> {
  const path = (await context.params).path.join("/");
  if (!paths.test(path)) return new Response(null, { status: 404 });
  if (
    request.method === "POST" &&
    ["incidents", "media", "analysis/audio"].includes(path)
  )
    return Response.json(
      { error: { code: "mobile_publication_only" } },
      { status: 403 },
    );
  const write = !["GET", "HEAD"].includes(request.method);
  if (write && !allowedOrigin(request))
    return new Response(null, { status: 403 });
  let body: ArrayBuffer | undefined;
  try {
    if (write)
      body = (await limitedBody(request, 5 * 1024 * 1024))
        .buffer as ArrayBuffer;
  } catch (error) {
    return new Response(null, {
      status: error instanceof RangeError ? 413 : 400,
    });
  }
  const headers = new Headers(bearer(request));
  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const geoLat =
    request.headers.get("cf-iplatitude") ||
    request.headers.get("x-vercel-ip-latitude");
  const geoLng =
    request.headers.get("cf-iplongitude") ||
    request.headers.get("x-vercel-ip-longitude");
  const geoCity =
    request.headers.get("cf-ipcity") || request.headers.get("x-vercel-ip-city");
  if (clientIp) headers.set("x-harkai-client-ip", clientIp);
  if (geoLat) headers.set("x-geo-latitude", geoLat);
  if (geoLng) headers.set("x-geo-longitude", geoLng);
  if (geoCity) headers.set("x-geo-city", geoCity);
  if (write)
    headers.set(
      "Content-Type",
      request.headers.get("content-type") || "application/json",
    );
  const response = await backend(`${path}${request.nextUrl.search}`, {
    method: request.method,
    headers,
    body,
  });
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
