import { NextRequest } from "next/server";
import { allowedOrigin, backend, bearer } from "@/lib/server/backend";
import { limitedBody } from "@/lib/server/body";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const paths =
  /^(meta|me(?:\/preferences|\/incidents)?|alerts|emergency-contacts|analysis\/(?:text|audio)|incidents(?:\/[a-f0-9]{24}(?:\/confirm|\/status)?)?|media(?:\/[a-f0-9]{24})?|gov\/incidents|admin\/(?:incidents|emergency-contacts|users(?:\/[a-f0-9]{24}\/role)?))$/;
async function proxy(
  request: NextRequest,
  context: Context,
): Promise<Response> {
  const path = (await context.params).path.join("/");
  if (!paths.test(path)) return new Response(null, { status: 404 });
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
