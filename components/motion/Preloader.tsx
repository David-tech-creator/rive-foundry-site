"use client"

import "./motion.css"
import { useEffect, useRef, useState } from "react"
import { particleStore } from "@/components/particles/store"

export type PreloaderProps = {
  /** Images the counter waits for. Defaults to the portrait mask. */
  assets?: string[]
  /** The counter never finishes faster than this (ms). Default 900. */
  minDuration?: number
  /** Hard cap; the page is revealed after this no matter what (ms). Default 5000. */
  maxDuration?: number
  /** Small caption beside the counter. */
  label?: string
}

const DEFAULT_ASSETS = ["/portrait/david-mask.png"]

let completedOnce = false

/** Where the counter is skipped (CSS hides it from the first paint, motion.css). */
const SKIP_QUERY = "(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)"

const pad = (n: number) => String(n).padStart(3, "0")

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function waitForEngine(timeout: number) {
  return new Promise<void>((resolve) => {
    const check = () => {
      const s = particleStore.get()
      return s.mode === "static" || s.engineReady
    }
    if (check()) return resolve()
    const timer = setTimeout(finish, timeout)
    const unsub = particleStore.subscribe(() => {
      if (check()) finish()
    })
    function finish() {
      clearTimeout(timer)
      unsub()
      resolve()
    }
  })
}

/**
 * Full-screen counter 0 to 100 tied to real loading (images, fonts, the
 * particle engine), at least minDuration long. While it runs, the particle
 * field is raised above the page so the lodestar can form behind the counter;
 * when it ends, the field swirls into the portrait and the page is revealed.
 */
export function Preloader({
  assets = DEFAULT_ASSETS,
  minDuration = 900,
  maxDuration = 5000,
  label = "Mission log",
}: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)
  const [seeThrough, setSeeThrough] = useState(false)
  const assetsKey = assets.join("|")

  useEffect(() => {
    const root = document.documentElement
    const el = rootRef.current
    // once per page load: client-side navigations back to the page skip it
    if (completedOnce || window.matchMedia(SKIP_QUERY).matches) {
      particleStore.set({ preloaderMounted: false, preloaderDone: true, loadProgress: 1 })
      setGone(true)
      return
    }
    if (el) el.style.animation = "none"
    root.setAttribute("data-preloading", "")
    particleStore.set({ preloaderMounted: true, preloaderDone: false, loadProgress: 0 })

    const urls = assetsKey ? assetsKey.split("|") : []
    const tasks: Promise<unknown>[] = [
      ...urls.map(loadImage),
      document.fonts ? document.fonts.ready : Promise.resolve(),
      waitForEngine(3000),
    ]
    const total = tasks.length
    let loaded = 0
    let allDone = false
    tasks.forEach((t) =>
      t.then(
        () => {
          loaded++
          if (loaded === total) allDone = true
        },
        () => {
          loaded++
          if (loaded === total) allDone = true
        },
      ),
    )

    const unsub = particleStore.subscribe(() => {
      const s = particleStore.get()
      setSeeThrough(s.mode === "webgl" && s.engineReady)
    })

    const t0 = performance.now()
    let shown = 0
    let lastText = -1
    let raf = 0
    let finished = false
    const timers: ReturnType<typeof setTimeout>[] = []

    const finish = () => {
      if (finished) return
      finished = true
      completedOnce = true
      if (countRef.current) countRef.current.dataset.count = "100"
      el?.style.setProperty("--pl-progress", "1")
      particleStore.set({ loadProgress: 1 })
      timers.push(
        setTimeout(() => {
          particleStore.set({ preloaderDone: true })
          root.removeAttribute("data-preloading")
          setDone(true)
          timers.push(setTimeout(() => setGone(true), 800))
        }, 240),
      )
    }

    const tick = (now: number) => {
      const elapsed = now - t0
      const target = loaded / total
      shown += (target - shown) * 0.08
      const timeCap = Math.min(1, elapsed / minDuration)
      const value = Math.min(shown, timeCap, allDone ? 1 : 0.99)
      const pct = Math.round(value * 100)
      if (pct !== lastText) {
        lastText = pct
        if (countRef.current) countRef.current.dataset.count = pad(pct)
        el?.style.setProperty("--pl-progress", String(value))
        particleStore.set({ loadProgress: value })
      }
      if ((allDone && value >= 0.995 && elapsed >= minDuration) || elapsed > maxDuration) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      unsub()
      root.removeAttribute("data-preloading")
      if (!particleStore.get().preloaderDone) particleStore.set({ preloaderDone: true, preloaderMounted: false })
    }
  }, [assetsKey, minDuration, maxDuration])

  if (gone) return null
  return (
    <div
      ref={rootRef}
      className={`pl-root${seeThrough ? " pl-see-through" : ""}${done ? " pl-done" : ""}`}
      aria-hidden="true"
    >
      <noscript>
        <style>{".pl-root{display:none!important}"}</style>
      </noscript>
      {/* Digits and caption are drawn with CSS (content: attr()) so they never
          become indexable text nodes ahead of the page content. */}
      <span ref={countRef} className="pl-count" data-count="000" />
      <span className="pl-meta">
        <span className="pl-label" data-label={label} />
        <span className="pl-bar">
          <span />
        </span>
      </span>
    </div>
  )
}
