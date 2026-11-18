"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { getLenis } from "@/components/motion"
import { particleStore, useParticlesMode } from "@/components/particles"

/** How long the portrait takes to become the dotted bust, in ms. */
const SUIT_UP_MS = 1900
/** Matches the fade in globals.css. */
const FADE_MS = 900
/** Give up on a connection that cannot start the film. */
const STALL_MS = 9000
const FILM_WIDTH = 1920
const CHARCOAL = [31, 30, 34]
const SPACE = [5, 7, 11]

type Phase = "idle" | "suiting" | "film" | "leaving"

/**
 * Tall screens would crop the wide film to a sliver, so they get a camera move
 * over it instead. t: film seconds; w: film pixels across the screen; x, y: film
 * point held at the screen point (0.5, at). Until `HOLD` it sits on the dotted
 * bust, sized and placed where the particle field draws it.
 */
const TALL_CAMERA = [
  { t: 3.3, w: 860, x: 1385, y: 540, at: 0.46 },
  { t: 7, w: 900, x: 1300, y: 540, at: 0.46 },
  { t: 12.4, w: 1320, x: 1160, y: 500, at: 0.46 },
  { t: 13.34, w: 1320, x: 1160, y: 500, at: 0.46 },
  // cut: the locked-off drift to the hull
  { t: 13.35, w: 1500, x: 790, y: 640, at: 0.46 },
  { t: 21.85, w: 1150, x: 840, y: 640, at: 0.46 },
  // cut: the close-up on the drill
  { t: 21.86, w: 1040, x: 880, y: 540, at: 0.46 },
  { t: 31.8, w: 1040, x: 880, y: 540, at: 0.46 },
  { t: 40.4, w: 1400, x: 1000, y: 600, at: 0.46 },
  { t: 47.4, w: 1620, x: 1080, y: 640, at: 0.46 },
]

const HOLD = 0.5
/** The bust in the film's first frame, in film pixels. */
const FILM_BUST = { top: 70, bottom: 1060, x: 1402 }

const ease = (t: number) => t * t * (3 - 2 * t)

/** The camera stop that lays the film's bust over the particle bust. */
function openingStop(vw: number, vh: number) {
  const box = particleStore.get().bustBox ?? { top: vh * 0.1, bottom: vh * 0.48, centerX: vw / 2 }
  const unit = (box.bottom - box.top) / (FILM_BUST.bottom - FILM_BUST.top)
  const y = (FILM_BUST.top + FILM_BUST.bottom) / 2
  return { t: HOLD, w: vw / unit, x: FILM_BUST.x + (vw / 2 - box.centerX) / unit, y, at: (box.top + box.bottom) / 2 / vh }
}

function cameraAt(time: number, opening: ReturnType<typeof openingStop>) {
  if (time <= HOLD) return opening
  const stops = [opening, ...TALL_CAMERA]
  const next = stops.findIndex((k) => k.t > time)
  if (next < 0) return stops[stops.length - 1]
  const a = stops[next - 1]
  const b = stops[next]
  const m = ease((time - a.t) / (b.t - a.t))
  const mix = (p: number, q: number) => p + (q - p) * m
  return { t: time, w: mix(a.w, b.w), x: mix(a.x, b.x), y: mix(a.y, b.y), at: mix(a.at, b.at) }
}

/**
 * Easter egg: click the portrait and the field morphs into the dotted astronaut
 * bust, which the film then picks up from its exact first frame: the dots turn
 * real and the astronaut goes on a spacewalk to build its ship. Only with the
 * particle field running, since the film starts from it. The video files load
 * on the click, so the page pays nothing for them.
 */
export function AstronautFilm() {
  const mode = useParticlesMode()
  const [phase, setPhase] = useState<Phase>("idle")
  const [src, setSrc] = useState("/film/astronaut.mp4")
  const [tall, setTall] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const timer = useRef<number | undefined>(undefined)

  const end = useCallback(() => {
    setPhase("leaving")
    particleStore.set({ suitUp: false })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setPhase("idle")
      getLenis()?.start()
      trigger.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions)
    }, FADE_MS)
  }, [])

  function start() {
    if (phase !== "idle") return
    const isTall = window.innerWidth / window.innerHeight < 1.1
    setTall(isTall)
    setSrc(isTall || window.innerWidth < 900 ? "/film/astronaut-phone.mp4" : "/film/astronaut.mp4")
    setPhase("suiting")
    getLenis()?.stop()
    particleStore.set({ suitUp: true })
    // iOS only buffers once asked to play, so this cannot wait for canplay
    timer.current = window.setTimeout(() => {
      video.current?.play().catch(end)
      timer.current = window.setTimeout(end, STALL_MS)
    }, SUIT_UP_MS)
  }

  function rolling() {
    window.clearTimeout(timer.current)
    setPhase("film")
    close.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (phase === "idle") return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") end()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase, end])

  // the camera runs on its own clock, resynced to the film: currentTime steps
  // too coarsely on phones to drive a slow move
  useEffect(() => {
    if (!tall || phase === "idle") return
    const el = video.current
    const box = stage.current
    if (!el || !box) return
    let raf = 0
    let clock = 0
    let last = performance.now()
    const place = (now: number) => {
      raf = requestAnimationFrame(place)
      if (!el.paused) clock += (now - last) / 1000
      last = now
      if (Math.abs(clock - el.currentTime) > 0.25) clock = el.currentTime
      const vw = box.clientWidth
      const vh = box.clientHeight
      const cam = cameraAt(clock, openingStop(vw, vh))
      const scale = FILM_WIDTH / cam.w
      const unit = (scale * vw) / FILM_WIDTH
      el.style.transform = `translate3d(${vw / 2 - unit * cam.x}px, ${vh * cam.at - unit * cam.y}px, 0) scale(${scale})`
      const m = ease(Math.min(1, clock / 2.5))
      box.style.backgroundColor = `rgb(${CHARCOAL.map((c, i) => Math.round(c + (SPACE[i] - c) * m)).join(",")})`
    }
    place(last)
    return () => cancelAnimationFrame(raf)
  }, [tall, phase])

  useEffect(
    () => () => {
      window.clearTimeout(timer.current)
      particleStore.set({ suitUp: false })
    },
    [],
  )

  if (mode !== "webgl") return null

  return (
    <>
      <button ref={trigger} type="button" className="astro-hit" aria-label="Suit up: play a short film of the astronaut" onClick={start} />
      {phase !== "idle" &&
        createPortal(
          <div
            ref={stage}
            className="astro-film"
            data-phase={phase}
            data-tall={tall || undefined}
            role="dialog"
            aria-modal="true"
            aria-label="A short silent film of an astronaut building a spaceship"
          >
            <video ref={video} src={src} muted playsInline preload="auto" onPlaying={rolling} onEnded={end} onError={end} />
            <button ref={close} type="button" className="btn" onClick={end}>
              Back to Earth
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}
