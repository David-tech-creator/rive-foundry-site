import { NextResponse } from "next/server"
import { SITE_URL } from "@/lib/site"

/**
 * Lead capture for the contact forms (home page and /rive-foundry).
 *
 * Delivery is best-effort and layered:
 *  1. Always writes a structured `LEAD` line to the server log, so a submission
 *     is never lost even when no provider is configured (visible in Vercel logs).
 *  2. Emails the lead via Resend when RESEND_API_KEY is set.
 *
 * Set RESEND_API_KEY (and optionally LEAD_TO_EMAIL / LEAD_FROM_EMAIL) in the
 * Vercel project to turn on email delivery.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_FIELD = 2000
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000

/** Per-instance best-effort throttle. Not a substitute for a WAF, but it stops naive spam. */
const hits = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > RATE_LIMIT
}

function clean(v: unknown) {
  return typeof v === "string" ? v.trim().slice(0, MAX_FIELD) : ""
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function sendEmail(subject: string, lines: string[], replyTo: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return "not-configured"

  const to = process.env.LEAD_TO_EMAIL
  if (!to) {
    console.warn("LEAD_TO_EMAIL not set: lead captured in logs only")
    return "no-recipient"
  }
  // Resend's shared sender works without domain verification but only delivers
  // to the Resend account owner. Set LEAD_FROM_EMAIL once rive-foundry.com is
  // verified in Resend to send from the brand domain.
  const from = process.env.LEAD_FROM_EMAIL || "rive-foundry.com <onboarding@resend.dev>"

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text: lines.join("\n"),
    }),
  })

  if (!res.ok) {
    console.error("LEAD_EMAIL_FAILED", res.status, (await res.text()).slice(0, 300))
    return "failed"
  }
  return "sent"
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many submissions. Try again shortly." }, { status: 429 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 })
  }

  // Honeypot: a hidden field only a bot fills in. Answer 200 so it learns nothing.
  if (clean(payload.company_website)) {
    return NextResponse.json({ ok: true })
  }

  const source = clean(payload.source) || "contact"
  const email = clean(payload.email)
  const name = clean(payload.name)

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 })
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 })
  }

  const fields: Array<[string, string]> = [
    ["Name", name],
    ["Email", email],
    ["Interest", clean(payload.interest)],
    ["Role", clean(payload.role)],
    ["Company", clean(payload.company)],
    ["LinkedIn", clean(payload.linkedin)],
    ["About", clean(payload.bio)],
  ].filter(([, v]) => v) as Array<[string, string]>

  const lines = [
    `New ${source} submission from ${SITE_URL}`,
    "",
    ...fields.map(([k, v]) => `${k}: ${v}`),
    "",
    `Received: ${new Date().toISOString()}`,
  ]

  // Structured log line, greppable in Vercel logs and parseable by a drain.
  console.log("LEAD", JSON.stringify({ source, ...Object.fromEntries(fields) }))

  const delivery = await sendEmail(`New ${source} message from ${name}`, lines, email)

  return NextResponse.json({ ok: true, delivery })
}
