import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema, HONEYPOT_FIELD } from "@/lib/contact-schema";

/* /api/contact — the real order intake (Stage 4.8).
   ----------------------------------------------------------------------------
   Validates the SAME zod schema as the form (lib/contact-schema), then sends
   the order to the studio inbox via Resend. Secrets stay server-only — this
   file never ships to the client, so RESEND_API_KEY / SUPABASE_SECRET_KEY are
   safe here (CLAUDE.md rule 9). The resolved success is the single trigger the
   Stage 5 CONFIRMED ticket hooks into; a 4xx/5xx must NOT read as success.

   Graceful degrade: with no RESEND_API_KEY (local/preview without creds) we log
   and return success rather than hard-fail, so the funnel + Stage 5 are never
   blocked on live mail credentials. A configured key that fails to send is a
   real 502 — the form shows an inline error and does not fire CONFIRMED. */

export const runtime = "nodejs"; // Resend SDK needs Node, not the edge runtime
export const dynamic = "force-dynamic"; // never cache an order POST

const STUDIO_INBOX = process.env.CONTACT_TO || "hi@jawad.design";
// must be a Resend-verified sender; default is a sensible studio address
const FROM = process.env.CONTACT_FROM || "Jawad Design <orders@jawad.design>";

/* Best-effort, per-instance rate limit. In Fluid/serverless this is one bucket
   per warm instance — not a global limiter, but enough to blunt a naive flood
   without a datastore. Documented as best-effort, not a security boundary. */
const WINDOW_MS = 60_000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  // evict empty buckets so transient/spoofed IPs can't leak the map unbounded
  if (recent.length === 0) hits.delete(ip);
  else hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "").trim() || "unknown";
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "Too many orders too fast — give it a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  // Honeypot: a real human leaves it empty. If filled, pretend success (200) so
  // the bot gets no signal — but never send mail.
  const honey = (body as Record<string, unknown>)?.[HONEYPOT_FIELD];
  if (typeof honey === "string" && honey.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { ok: false, error: "Check the form and try again.", fieldErrors },
      { status: 400 },
    );
  }
  const { email, message, dish } = parsed.data;

  const subject = `New order — ${dish || "a website"}`;
  const text =
    `New order via jawad.design\n\n` +
    `Course: ${dish || "(not specified)"}\n` +
    `Reply to: ${email}\n\n` +
    `What they're launching:\n${message?.trim() || "(no detail given)"}\n`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Degrade path — no creds in this env. Log so the order isn't silently lost,
    // and report success so the funnel + Stage 5 still work end-to-end.
    console.info("[contact] RESEND_API_KEY absent — order logged, not emailed:", {
      email,
      dish: dish || null,
    });
    return NextResponse.json({ ok: true, degraded: true });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: STUDIO_INBOX,
      replyTo: email,
      subject,
      text,
    });
    if (error) throw new Error(error.message || "Resend rejected the send");
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't send your order — email hi@jawad.design directly." },
      { status: 502 },
    );
  }

  // Optional, best-effort Supabase row. Never blocks or fails the order — the
  // email is the system of record; persistence is a nicety gated on creds.
  void recordOrder({ email, dish, message });

  return NextResponse.json({ ok: true });
}

async function recordOrder(row: {
  email: string;
  dish?: string;
  message?: string;
}): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return; // not configured → skip silently
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("orders").insert({
      email: row.email,
      dish: row.dish ?? null,
      message: row.message ?? null,
    });
    if (error) console.warn("[contact] supabase insert skipped:", error.message);
  } catch (err) {
    console.warn("[contact] supabase persist failed (non-fatal):", err);
  }
}
