import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Double opt-in for the Frontier newsletter. A confirmation link carries the
 * email and an expiry, signed, so nothing is stored until the reader clicks it.
 */

const TTL_MS = 7 * 24 * 60 * 60 * 1000

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

export function makeToken(email: string, secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: now + TTL_MS })).toString("base64url")
  return `${payload}.${sign(payload, secret)}`
}

/** The email in a valid, unexpired token; null otherwise. */
export function readToken(token: string, secret: string, now = Date.now()): string | null {
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null
  const want = Buffer.from(sign(payload, secret))
  const got = Buffer.from(sig)
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString())
    return typeof e === "string" && typeof x === "number" && x > now ? e : null
  } catch {
    return null
  }
}
