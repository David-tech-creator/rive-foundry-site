"use client"

import type React from "react"
import { useEffect, useId, useState } from "react"
import Link from "next/link"

const CONFIRMED: Record<string, string> = {
  yes: "You are in. The next post lands in your inbox.",
  expired: "That link has expired. Sign up again and I will send a new one.",
  error: "That did not work. Try again in a moment.",
}

/** The Frontier newsletter sign-up: one email field, confirmed by a link. */
export function SubscribeForm() {
  const id = useId()
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const done = new URLSearchParams(window.location.search).get("subscribed")
    if (done && CONFIRMED[done]) {
      setMessage(CONFIRMED[done])
      setState(done === "yes" ? "sent" : "error")
    }
  }, [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState("sending")
    const data = new FormData(e.currentTarget)
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: data.get("email"), company: data.get("company") }),
    }).catch(() => null)
    const body = await res?.json().catch(() => null)
    if (res?.ok) {
      setState("sent")
      setMessage("Check your inbox and click the link to confirm.")
    } else {
      setState("error")
      setMessage(body?.error ?? "That did not work. Try again in a moment.")
    }
  }

  return (
    <div className="mt-8 max-w-md">
      {state === "sent" ? (
        <p role="status" className="text-lg text-text">
          {message}
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor={id} className="sr-only">
            Your email address
          </label>
          <input
            id={id}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-none border-b border-line bg-transparent py-3 text-lg text-text placeholder:text-muted-foreground focus:border-azure-light"
          />
          {/* left empty by people; bots fill it in */}
          <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <button type="submit" className="btn-solid disabled:opacity-60" disabled={state === "sending"}>
            {state === "sending" ? "Sending" : "Get it by email"}
          </button>
        </form>
      )}
      {state === "error" ? (
        <p role="alert" className="mt-3 text-[15px] text-muted-foreground">
          {message}
        </p>
      ) : null}
      {state === "sent" ? null : (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          One email per post, confirmed by you, gone with one click.{" "}
          <Link href="/privacy" className="link-quiet text-text">
            Privacy
          </Link>
        </p>
      )}
    </div>
  )
}
