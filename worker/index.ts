import { parseBrief } from "../src/lib/brief.ts";

type RateLimiter = { limit(input: { key: string }): Promise<{ success: boolean }> };
export type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  BRIEF_RATE_LIMITER: RateLimiter;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  BRIEF_TO_EMAIL?: string;
};

const MAX_BODY_BYTES = 64 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DELIVERY_ERROR = "Your brief couldn’t find its way to us just yet. Please try again in a moment.";
const json = (body: object, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Empty body");
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("Body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function handleRequest(request: Request, env: Env, sendEmail: typeof fetch = fetch): Promise<Response> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
  if (url.pathname !== "/api/brief") return json({ error: "This route doesn’t lead anywhere." }, 404);
  if (request.method !== "POST") return json({ error: "Send your brief using the form." }, 405, { Allow: "POST" });
  if (request.headers.get("Origin") !== url.origin || request.headers.get("Sec-Fetch-Site") === "cross-site") {
    return json({ error: "Please send your brief from the Sixth Route website." }, 403);
  }
  if (request.headers.get("Content-Type")?.split(";")[0].trim() !== "application/json") {
    return json({ error: "We couldn’t read that brief. Please try the form again." }, 415);
  }
  const requestId = request.headers.get("Idempotency-Key") ?? "";
  if (!UUID.test(requestId)) return json({ error: "Please refresh the page and send your brief again." }, 400);
  if (!env.BRIEF_RATE_LIMITER) return json({ error: DELIVERY_ERROR }, 503);
  const ip = request.headers.get("CF-Connecting-IP") ?? "local";
  const { success } = await env.BRIEF_RATE_LIMITER.limit({ key: `${url.hostname}:brief:${ip}` });
  if (!success) return json({ error: "Let’s give that a moment. Please try sending your brief again in a minute." }, 429, { "Retry-After": "60" });

  let input: unknown;
  try { input = await readBody(request); }
  catch (error) {
    return json({ error: error instanceof RangeError ? "Share the highlights for now, and we’ll get into the details together." : "We couldn’t read that brief. Please try again." }, error instanceof RangeError ? 413 : 400);
  }
  const parsed = parseBrief(input);
  if (!parsed) return json({ error: "Something in the brief looks out of place. Please check your details and try again." }, 400);
  if (Object.keys(parsed.errors).length) return json({ errors: parsed.errors }, 422);
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.BRIEF_TO_EMAIL) return json({ error: DELIVERY_ERROR }, 503);

  const { brief } = parsed;
  const lines = [
    "A new brief has arrived at Sixth Route.", "",
    `Name: ${brief.name}`, `Email: ${brief.email}`,
    `Business / website: ${brief.company || "Not provided"}`,
    `Services: ${brief.services.join(", ") || "Let’s discuss"}`,
    `Timeline: ${brief.timeline || "Let’s discuss"}`,
    "", "Project brief", "─────────────", brief.message,
  ];
  try {
    const response = await sendEmail("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `brief/${requestId}`,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [env.BRIEF_TO_EMAIL],
        reply_to: brief.email,
        subject: `New project brief — ${brief.name}`,
        text: lines.join("\n"),
      }),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json() as { id?: string };
    if (!response.ok || typeof result.id !== "string" || !result.id) {
      console.error("Resend did not accept the brief", { status: response.status });
      return json({ error: DELIVERY_ERROR }, 502);
    }
    return json({ ok: true, id: result.id });
  } catch {
    // No form contents, addresses or credentials are written to logs.
    console.error("Brief delivery request failed");
    return json({ error: DELIVERY_ERROR }, 502);
  }
}

export default { fetch: (request: Request, env: Env) => handleRequest(request, env) };
