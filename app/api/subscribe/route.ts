import { NextResponse } from "next/server"
import { makeToken } from "@/lib/subscribe"
import { SITE_URL } from "@/lib/site"

/**
 * Frontier newsletter sign-up. Sends one confirmation email and stores nothing:
 * the reader becomes a contact in Resend only by clicking the link
 * (app/api/subscribe/confirm). Needs RESEND_API_KEY, NEWSLETTER_FROM,
 * NEWSLETTER_REPLY_TO and NEWSLETTER_SECRET.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > RATE_LIMIT
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 })

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : ""
  // the hidden field: only bots fill it in, and they get a quiet success
  if (typeof body?.company === "string" && body.company) return NextResponse.json({ ok: true })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "That email address does not look right." }, { status: 400 })

  const key = process.env.RESEND_API_KEY
  const secret = process.env.NEWSLETTER_SECRET
  const from = process.env.NEWSLETTER_FROM
  if (!key || !secret || !from) {
    console.error("SUBSCRIBE_NOT_CONFIGURED")
    return NextResponse.json({ error: "Sign-up is not open yet. Try the RSS feed for now." }, { status: 503 })
  }

  const link = `${SITE_URL}/api/subscribe/confirm?token=${encodeURIComponent(makeToken(email, secret))}`
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: process.env.NEWSLETTER_REPLY_TO,
      subject: "One click and you are in",
      text: `Hi,\n\nSomeone, hopefully you, asked to get Frontier by email: what changed at the AI labs and what I would do with it.\n\nConfirm here:\n${link}\n\nIf it was not you, ignore this and you will not hear from me again.\n\nDavid`,
    }),
  })
  if (!res.ok) {
    console.error("SUBSCRIBE_EMAIL_FAILED", res.status, (await res.text()).slice(0, 300))
    return NextResponse.json({ error: "That did not work. Try again in a moment." }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
