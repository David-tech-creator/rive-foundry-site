"use client"

import { useEffect, useRef, useState } from "react"
import type React from "react"

type Props = {
  src: string
  /** Lighter encode for screens under 768px. */
  small: string
  poster: string
  label: string
  width: number
  height: number
  /** Aspect of the small encode when it differs (phone films are cropped to portrait). */
  smallAspect?: string
}

/**
 * The one film that may be downloading or playing on the page. Starting another
 * film stops this one and drops its source, which aborts its download, so a slow
 * connection never fetches two films at once.
 */
let active: HTMLVideoElement | null = null

function release(v: HTMLVideoElement) {
  v.pause()
  if (v.getAttribute("src")) {
    v.removeAttribute("src")
    v.load() // aborts any download in flight; the poster shows again
  }
  if (active === v) active = null
}

type Connection = { saveData?: boolean; effectiveType?: string }

/** Poster only: reduced motion, Save-Data, or a 2G-class connection. */
function posterOnly(): boolean {
  if (typeof window === "undefined") return true
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true
  const c = (navigator as Navigator & { connection?: Connection }).connection
  return Boolean(c?.saveData || (c?.effectiveType && /(^|-)2g$/.test(c.effectiveType)))
}

/**
 * A silent looping film of the product. Nothing is fetched until it scrolls
 * into view (preload="none", no src in the HTML); it plays only while visible
 * and stops when it leaves. Under reduced motion or Save-Data it stays a still.
 */
export function ProductFilm({ src, small, poster, label, width, height, smallAspect }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<"poster" | "film">("poster")
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  // Bumped when reduced motion is switched off again, so the effect re-runs.
  const [motionEpoch, setMotionEpoch] = useState(0)

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onMotion = () => {
      if (!motion.matches) setMotionEpoch((n) => n + 1)
    }
    motion.addEventListener("change", onMotion)
    return () => motion.removeEventListener("change", onMotion)
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (posterOnly()) {
      setMode("poster")
      return
    }
    setMode("film")

    const narrow = window.matchMedia("(max-width: 767px)")
    const pick = () => (narrow.matches ? small : src)
    let visible = false

    const refused = (err: unknown) => {
      // Autoplay refused: show the real state so the button offers Play.
      // An AbortError only means release() dropped the source; ignore it.
      if ((err as DOMException)?.name !== "NotAllowedError") return
      pausedRef.current = true
      setPaused(true)
    }

    const start = () => {
      if (pausedRef.current) return
      if (active && active !== v) release(active)
      active = v
      if (!v.getAttribute("src")) v.src = pick()
      v.play().catch(refused)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
        else v.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(v)

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onMotion = () => {
      if (motion.matches) {
        release(v)
        setMode("poster")
      }
    }
    motion.addEventListener("change", onMotion)

    // A tablet rotated across 768px swaps to the encode that fits the frame.
    const onNarrow = () => {
      if (!v.getAttribute("src")) return
      const wasActive = active === v
      release(v)
      if (wasActive && visible && !pausedRef.current) start()
    }
    narrow.addEventListener("change", onNarrow)

    return () => {
      io.disconnect()
      motion.removeEventListener("change", onMotion)
      narrow.removeEventListener("change", onNarrow)
      release(v)
    }
  }, [src, small, motionEpoch])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (pausedRef.current) {
      pausedRef.current = false
      setPaused(false)
      if (active && active !== v) release(active)
      active = v
      if (!v.getAttribute("src")) v.src = window.matchMedia("(max-width: 767px)").matches ? small : src
      v.play().catch((err: unknown) => {
        if ((err as DOMException)?.name !== "NotAllowedError") return
        pausedRef.current = true
        setPaused(true)
      })
    } else {
      pausedRef.current = true
      setPaused(true)
      v.pause()
    }
  }

  // Never taller than the screen: the phone crops (388 x 720) would be 700px
  // tall on a 375px phone, and a 16:10 film overflows a phone held sideways.
  const [sw, sh] = (smallAspect ?? `${width} / ${height}`).split("/").map((n) => Number(n.trim()))
  const smallRatio = sw && sh ? sw / sh : width / height

  return (
    <div
      className="relative mx-auto max-w-[var(--film-max-sm)] overflow-hidden bg-ink [aspect-ratio:var(--film-sm)] md:max-w-[var(--film-max)] md:[aspect-ratio:var(--film)]"
      style={
        {
          "--film": `${width} / ${height}`,
          "--film-sm": smallAspect ?? `${width} / ${height}`,
          "--film-max-sm": `calc(78svh * ${smallRatio.toFixed(4)})`,
          "--film-max": `calc(90svh * ${(width / height).toFixed(4)})`,
        } as React.CSSProperties
      }
    >
      <video
        ref={ref}
        className="h-full w-full object-cover"
        poster={poster}
        width={width}
        height={height}
        muted
        playsInline
        loop
        preload="none"
        disablePictureInPicture
        aria-label={label}
      />
      {mode === "film" ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Play the film" : "Pause the film"}
          className="tap absolute bottom-3 right-3 justify-center border border-line bg-ink/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-text focus-visible:text-text"
        >
          {paused ? "Play" : "Pause"}
        </button>
      ) : null}
    </div>
  )
}
