import { NextResponse } from "next/server"
import { FRONTIER } from "@/lib/frontier"
import { SITE_URL } from "@/lib/site"
import { readToken } from "@/lib/subscribe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const back = (state: string) => NextResponse.redirect(`${SITE_URL}${FRONTIER.path}?subscribed=${state}`, 303)

/** The link in the confirmation email: adds the reader to the Frontier segment in Resend. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  const key = process.env.RESEND_API_KEY
  const secret = process.env.NEWSLETTER_SECRET
  const segment = process.env.NEWSLETTER_SEGMENT_ID
  if (!key || !secret || !segment) return back("error")
  const email = readToken(token, secret)
  if (!email) return back("expired")

  const res = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ email, unsubscribed: false, segments: [{ id: segment }] }),
  })
  // someone who is already a contact has confirmed before
  if (!res.ok && res.status !== 409) {
    console.error("SUBSCRIBE_CONFIRM_FAILED", res.status, (await res.text()).slice(0, 300))
    return back("error")
  }
  return back("yes")
}
