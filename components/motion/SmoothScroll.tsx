"use client"

import "./motion.css"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import type Lenis from "lenis"

let instance: Lenis | null = null

/** The running Lenis instance, or null (reduced motion, not mounted yet). */
export function getLenis(): Lenis | null {
  return instance
}

/** Scroll to an element, selector or y position, smooth when Lenis runs. */
export function scrollToTarget(target: string | HTMLElement | number, offset = -80) {
  if (instance) {
    instance.scrollTo(target, { offset })
    return
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target })
    return
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset })
}

export type SmoothScrollProps = {
  /** Lenis lerp, lower = smoother. Default 0.1. */
  lerp?: number
  /** Offset applied to in-page anchor jumps (px). Default -80. */
  anchorOffset?: number
}

/**
 * Lenis smooth scrolling with in-page anchor handling. Disabled under
 * prefers-reduced-motion (native scroll, instant anchor jumps). Replaces
 * components/smooth-scroll.tsx.
 */
export function SmoothScroll({ lerp = 0.1, anchorOffset = -80 }: SmoothScrollProps) {
  const pathname = usePathname()

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    let lenis: Lenis | null = null
    let raf = 0
    let cancelled = false

    const onAnchor = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.("a")
      if (!a) return
      const href = a.getAttribute("href")
      if (!href) return
      let hash = ""
      if (href.startsWith("#")) hash = href
      else {
        try {
          const url = new URL(href, window.location.href)
          if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash) hash = url.hash
        } catch {
          return
        }
      }
      if (!hash || hash === "#") return
      let el: HTMLElement | null = null
      try {
        el = document.querySelector<HTMLElement>(decodeURIComponent(hash))
      } catch {
        el = null
      }
      if (!el) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(el, { offset: anchorOffset })
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + anchorOffset })
      history.replaceState(null, "", hash)
      // move keyboard focus to the target too (skip link, #work, #contact)
      if (!el.matches("a[href],button,input,select,textarea,[tabindex]")) el.setAttribute("tabindex", "-1")
      el.focus({ preventScroll: true })
    }
    document.addEventListener("click", onAnchor)

    const start = async () => {
      if (reduced.matches) return
      const { default: LenisCtor } = await import("lenis")
      if (cancelled) return
      lenis = new LenisCtor({ lerp, smoothWheel: true })
      instance = lenis
      const loop = (t: number) => {
        lenis?.raf(t)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      lenis?.destroy()
      lenis = null
      instance = null
    }
    const onReducedChange = () => {
      stop()
      void start()
    }
    reduced.addEventListener("change", onReducedChange)
    void start()

    return () => {
      cancelled = true
      reduced.removeEventListener("change", onReducedChange)
      document.removeEventListener("click", onAnchor)
      stop()
    }
  }, [lerp, anchorOffset])

  // new route: content height changed
  useEffect(() => {
    instance?.resize()
  }, [pathname])

  return null
}
