import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest, type Env } from "./index.ts";

const id = "a49ca231-002a-48f6-8d53-e63d5cc945c4";
const brief = { name: "Test Visitor", email: "visitor@example.com", company: "Example", services: ["Technology & Web"], timeline: "", message: "We would like to discuss a new website for our studio." };
const env = (overrides: Partial<Env> = {}): Env => ({
  ASSETS: { fetch: async () => new Response("Static page", { status: 404 }) },
  BRIEF_RATE_LIMITER: { limit: async () => ({ success: true }) },
  RESEND_API_KEY: "test-only-secret",
  RESEND_FROM_EMAIL: "Sixth Route <briefs@example.com>",
  BRIEF_TO_EMAIL: "studio@example.com",
  ...overrides,
});
const request = (body: unknown = brief, headers: Record<string, string> = {}) => new Request("https://sixthroute.com/api/brief", {
  method: "POST",
  headers: { Origin: "https://sixthroute.com", "Content-Type": "application/json", "Idempotency-Key": id, ...headers },
  body: JSON.stringify(body),
});
const neverSend: typeof fetch = async () => { assert.fail("This request must never send an email"); };

test("valid briefs go to the configured inbox, with reply-to and a stable retry key", async () => {
  let calls = 0;
  const provider: typeof fetch = async (url, init) => {
    calls++;
    assert.equal(url, "https://api.resend.com/emails");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Authorization"), "Bearer test-only-secret");
    assert.equal(headers.get("Idempotency-Key"), `brief/${id}`);
    const email = JSON.parse(String(init?.body));
    assert.deepEqual(email.to, ["studio@example.com"]);
    assert.equal(email.reply_to, brief.email);
    assert.equal(email.from, "Sixth Route <briefs@example.com>");
    assert.match(email.text, /Technology & Web/);
    assert.match(email.text, /new website/);
    assert.equal(email.html, undefined);
    return Response.json({ id: "accepted-email-id" });
  };
  const response = await handleRequest(request({ ...brief, to: "attacker@example.com", from: "attacker@example.com" }), env(), provider);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, id: "accepted-email-id" });
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(calls, 1);
});

test("short descriptions return the creative field error before reaching Resend", async () => {
  const response = await handleRequest(request({ ...brief, message: "Testing" }), env(), neverSend);
  assert.equal(response.status, 422);
  const result = await response.json() as { errors: { message: string } };
  assert.match(result.errors.message, /Give us a little more to work with/);
  assert.doesNotMatch(result.errors.message, /characters|10/);
});

test("forged cross-site requests cannot trigger delivery", async () => {
  assert.equal((await handleRequest(request(brief, { Origin: "https://elsewhere.example" }), env(), neverSend)).status, 403);
  assert.equal((await handleRequest(request(brief, { "Sec-Fetch-Site": "cross-site" }), env(), neverSend)).status, 403);
});

test("rate-limited requests do not consume email quota", async () => {
  const response = await handleRequest(request(), env({ BRIEF_RATE_LIMITER: { limit: async () => ({ success: false }) } }), neverSend);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
});

test("malformed payloads and header injection are rejected", async () => {
  for (const body of [null, [], { ...brief, services: "Technology & Web" }, { ...brief, services: ["Invented service"] }, { ...brief, name: "Name\r\nBcc: attacker@example.com" }, { ...brief, company: 123 }]) {
    const response = await handleRequest(request(body), env(), neverSend);
    assert.ok(response.status === 400 || response.status === 422);
  }
  const brokenJson = new Request("https://sixthroute.com/api/brief", { method: "POST", headers: request().headers, body: "{broken" });
  assert.equal((await handleRequest(brokenJson, env(), neverSend)).status, 400);
  assert.equal((await handleRequest(request(brief, { "Content-Type": "text/plain" }), env(), neverSend)).status, 415);
});

test("oversized bodies are rejected even without a content-length header", async () => {
  const response = await handleRequest(request({ ...brief, message: "x".repeat(70000) }), env(), neverSend);
  assert.equal(response.status, 413);
});

test("missing server configuration cannot produce a false success", async () => {
  assert.equal((await handleRequest(request(), env({ RESEND_API_KEY: undefined }), neverSend)).status, 503);
  assert.equal((await handleRequest(request(), env({ BRIEF_RATE_LIMITER: { limit: async () => { throw new Error("Unavailable"); } } }), neverSend)).status, 503);
});

test("provider errors, missing acknowledgement, and connection failures never show success", async () => {
  const providers: (typeof fetch)[] = [
    async () => Response.json({ message: "Domain not verified" }, { status: 403 }),
    async () => Response.json({}),
    async () => { throw new Error("Connection lost"); },
  ];
  for (const provider of providers) {
    const response = await handleRequest(request(), env(), provider);
    assert.equal(response.status, 502);
    assert.equal((await response.json() as { ok?: boolean }).ok, undefined);
  }
});

test("page and not-found requests still use the existing asset handler", async () => {
  const response = await handleRequest(new Request("https://sixthroute.com/contact/"), env(), neverSend);
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Static page");
  assert.equal((await handleRequest(new Request("https://sixthroute.com/api/unknown"), env(), neverSend)).status, 404);
  assert.equal((await handleRequest(new Request("https://sixthroute.com/api/brief"), env(), neverSend)).status, 405);
});
