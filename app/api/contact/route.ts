import { LIMITS, validateContact } from "@/lib/contact";

/* POST /api/contact: validates the form again, drops obvious bots quietly, limits
   how often one address can send, and emails the message through Resend's REST API.
   Needs RESEND_API_KEY, CONTACT_TO and CONTACT_FROM (see .env.example). With
   RESEND_API_KEY=dry-run the message is logged instead of sent, for local testing. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 2000; // a person takes longer than this to fill in the form
const hits = new Map<string, number[]>(); // best effort: per server instance, not shared between them

// `fallback: true` tells the form to point the visitor at the email address.
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // never grow without bound
  return false;
}

// Control characters (newlines in particular) must never reach an email header.
const oneLine = (s: string, max: number) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "That request was not valid." }, 400);
  }
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : "");

  // Honeypot filled, or the form was "completed" faster than a person can: pretend it worked.
  const elapsed = typeof body.elapsed === "number" ? body.elapsed : Infinity;
  if (str("website") || elapsed < MIN_FILL_MS) return json({ ok: true });

  const fields = { name: str("name"), email: str("email"), message: str("message") };
  const errors = validateContact(fields);
  if (Object.keys(errors).length) return json({ error: "Please check the highlighted fields.", errors }, 422);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (limited(ip)) return json({ error: "Too many messages from this connection. Please try again later, or email me at", fallback: true }, 429);

  const name = oneLine(fields.name, LIMITS.name);
  const email = oneLine(fields.email, LIMITS.email);
  const message = fields.message.trim().slice(0, LIMITS.message);
  const text = `From: ${name} <${email}>\n\n${message}\n`;

  const key = process.env.RESEND_API_KEY;
  if (key === "dry-run") {
    console.log(`[contact dry-run]\n${text}`);
    return json({ ok: true });
  }
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    console.error("Contact form is not configured: set RESEND_API_KEY and CONTACT_TO.");
    return json({ error: "The contact form is not set up yet. You can reach me at", fallback: true }, 503);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "NICK.ODE <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`Resend rejected the message (${res.status}): ${(await res.text()).slice(0, 300)}`);
      return json({ error: "I could not send that just now. You can reach me at", fallback: true }, 502);
    }
  } catch (e) {
    console.error("Could not reach Resend:", e instanceof Error ? e.message : e);
    return json({ error: "I could not send that just now. You can reach me at", fallback: true }, 502);
  }
  return json({ ok: true });
}
