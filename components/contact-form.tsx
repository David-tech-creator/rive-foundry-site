"use client"

import type React from "react"
import { useId, useRef, useState } from "react"
import { CONTACT_EMAIL } from "@/lib/site"

export type ContactInterest = "build" | "together" | "hiring" | "event" | "chat" | "other"

const INTERESTS: Record<"en", Array<{ value: ContactInterest; label: string }>> = {
  en: [
    { value: "build", label: "Something you are building" },
    { value: "together", label: "Working together" },
    { value: "hiring", label: "Hiring, or a next role" },
    { value: "event", label: "An event or a talk" },
    { value: "chat", label: "Just a chat" },
    { value: "other", label: "Something else" },
  ],
}

const T = {
  en: {
    name: "Name",
    email: "Email",
    about: "About",
    message: "Message",
    placeholder: "A few lines are plenty. A link is even better.",
    privacy1: "I only use this to reply. Details in the",
    privacy2: "privacy policy",
    send: "Send",
    sending: "Sending...",
    wrong: "Something went wrong.",
    retry: "Give it a moment and try again.",
    done: "Got it.",
    doneLine: "Thanks for writing. I will reply by email.",
    almost: "Almost there.",
    undelivered1: "My form can't send email right now, so this may not reach me. Please",
    undelivered2: "instead. Your message is already filled in.",
    emailMe: "email me at",
  },
}

const field =
  "w-full border border-line bg-surface/70 px-4 py-3 text-base text-text placeholder:text-muted-foreground " +
  "transition-colors duration-200 hover:border-white/20 focus:border-azure-light"

/**
 * Contact form. Posts JSON to /api/lead (unchanged contract: name, email,
 * interest, the message as `bio`, and the `company_website` honeypot).
 */
export function ContactForm({
  defaultInterest = "build",
  source = "contact",
  lang = "en",
}: {
  defaultInterest?: ContactInterest
  source?: string
  lang?: "en"
}) {
  const t = T[lang]
  const interests = INTERESTS[lang]
  const uid = useId()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [interest, setInterest] = useState<ContactInterest>(defaultInterest)
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("") // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  // the message reached the server log but no email went out: ask for an email instead
  const [undelivered, setUndelivered] = useState(false)
  const [error, setError] = useState("")
  const [errorField, setErrorField] = useState<"name" | "email" | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const errorId = `${uid}-error`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrorField(null)
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source,
          name,
          email,
          interest: INTERESTS.en.find((i) => i.value === interest)?.label ?? interest,
          bio: message,
          company_website: website,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        const msg = typeof data.error === "string" && data.error ? data.error : ""
        // validation errors (4xx with a message) point at their field; only
        // network and server errors get the "try again" hint
        if (res.status >= 400 && res.status < 500 && msg) {
          const fieldName = /email/i.test(msg) ? "email" : /name/i.test(msg) ? "name" : null
          setError(msg)
          setErrorField(fieldName)
          if (fieldName === "email") emailRef.current?.focus()
          else if (fieldName === "name") nameRef.current?.focus()
          return
        }
        throw new Error(msg || t.wrong)
      }
      if (data.delivery && data.delivery !== "sent") {
        setUndelivered(true)
        return
      }
      setIsSubmitted(true)
      setName("")
      setEmail("")
      setMessage("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.wrong
      setError(`${msg} ${t.retry}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div role="status" className="py-6">
        <p className="text-2xl text-text">{t.done}</p>
        <p className="mt-2 text-muted-foreground">{t.doneLine}</p>
      </div>
    )
  }

  if (undelivered) {
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Hello from ${name}`)}&body=${encodeURIComponent(message)}`
    return (
      <div role="status" className="py-6">
        <p className="text-2xl text-text">{t.almost}</p>
        <p className="mt-2 text-muted-foreground">
          {t.undelivered1}{" "}
          <a href={mailto} className="link-line text-text">
            {t.emailMe} {CONTACT_EMAIL}
          </a>{" "}
          {t.undelivered2}
        </p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate={false}>
      {error ? (
        <p id={errorId} role="alert" className="border border-red-400/40 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="kicker mb-2 block">
            {t.name}
          </label>
          <input
            id={`${uid}-name`}
            ref={nameRef}
            name="name"
            aria-invalid={errorField === "name" || undefined}
            aria-describedby={errorField === "name" ? errorId : undefined}
            autoComplete="name"
            className={field}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="kicker mb-2 block">
            {t.email}
          </label>
          <input
            id={`${uid}-email`}
            ref={emailRef}
            name="email"
            aria-invalid={errorField === "email" || undefined}
            aria-describedby={errorField === "email" ? errorId : undefined}
            autoComplete="email"
            className={field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${uid}-interest`} className="kicker mb-2 block">
          {t.about}
        </label>
        <select
          id={`${uid}-interest`}
          name="interest"
          className={`${field} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%238B8A92' stroke-width='1.2'/%3E%3C/svg%3E\")",
          }}
          value={interest}
          onChange={(e) => setInterest(e.target.value as ContactInterest)}
        >
          {interests.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${uid}-message`} className="kicker mb-2 block">
          {t.message}
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={4}
          className={`${field} resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.placeholder}
        />
      </div>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-company_website`}>Company website</label>
        <input
          id={`${uid}-company_website`}
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <p className="text-xs text-muted-foreground">
          {t.privacy1}{" "}
          <a href="/privacy" className="link-line">
            {t.privacy2}
          </a>
          .
        </p>
        <button type="submit" className="btn-solid disabled:opacity-60" disabled={isSubmitting}>
          {isSubmitting ? t.sending : t.send}
        </button>
      </div>
    </form>
  )
}
