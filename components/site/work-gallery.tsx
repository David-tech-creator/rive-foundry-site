"use client"

import "./work-gallery.css"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, type ReactNode } from "react"
import { setGraphFocus, setHoveredNode } from "@/components/particles/store"
import type { GalleryCardRect, GalleryGL } from "./work-gallery-gl"

export type GalleryItem = {
  slug: string
  name: string
  src: string
  alt: string
  /** bottom-right label: its status and the year it started */
  meta: string
  /** what it does, in one line */
  line: string
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/**
 * Selected work as a sideways gallery.
 *
 * - Desktop and tablets: the section pins and scrolling down slides the row
 *   of cards to the left. The card images are repainted in WebGL and ripple
 *   like cloth with the scroll speed, settling flat when the scroll stops.
 * - Phones: a native swipe row with scroll snap; the frames lean a little
 *   with the swipe speed (plain CSS transforms, no WebGL).
 * - Reduced motion: no pin, no bend (a grid from 768px up, the row below).
 * - No JS: the swipe row.
 *
 * The cards are always real links with real images and text; the canvas is
 * decoration on top of the images only (never the captions).
 *
 * While the gallery is on screen the sky behind it pans to the star of the
 * card in the middle, like the old vertical list did.
 */
export function WorkGallery({ items, head }: { items: GalleryItem[]; head: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const view = viewRef.current
    const track = trackRef.current
    const canvas = canvasRef.current
    if (!section || !view || !track || !canvas) return
    const root = document.documentElement

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const isPhone = () => window.innerWidth < 768 || (coarse && Math.min(window.innerWidth, window.innerHeight) < 600)

    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-card]"))
    const frames = cards.map((c) => c.querySelector<HTMLElement>("[data-frame]")!)
    const imgs = cards.map((c) => c.querySelector<HTMLImageElement>("img")!)
    const hover = cards.map(() => 0)
    const hoverTarget = cards.map(() => 0)

    let mode: "static" | "swipe" | "pin" = "swipe"
    let gl: GalleryGL | null = null
    let glFailed = false
    let glLoading = false
    let raf = 0
    let inView = false
    let disposed = false

    // geometry, refreshed on resize
    let travel = 0
    let viewW = 0
    let viewH = 0
    let base: Array<{ x: number; y: number; w: number; h: number }> = []

    // motion state
    let trackX = 0
    let lastX = 0
    let lastT = 0
    let bend = 0
    let lastSig = ""
    let current: string | null = null

    const setMode = (m: typeof mode) => {
      mode = m
      section.dataset.gallery = m
    }

    const measure = () => {
      const pin = mode === "pin"
      // measure the row unshifted
      track.style.transform = ""
      viewW = view.clientWidth
      viewH = view.clientHeight
      travel = pin ? Math.max(0, track.scrollWidth - viewW) : 0
      section.style.height = pin ? `calc(100vh + ${travel}px)` : ""
      section.style.setProperty("--travel", `${travel}px`)
      const vr = view.getBoundingClientRect()
      base = frames.map((f) => {
        const r = f.getBoundingClientRect()
        return { x: r.left - vr.left + (pin ? 0 : view.scrollLeft), y: r.top - vr.top, w: r.width, h: r.height }
      })
      if (gl) gl.resize(viewW, viewH)
      lastSig = ""
    }

    const pickActive = (x: number) => {
      // the card whose centre is nearest the middle of the view
      let best = -1
      let bestD = Infinity
      base.forEach((b, i) => {
        const d = Math.abs(b.x + x + b.w / 2 - viewW / 2)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      const slug = best >= 0 ? cards[best].dataset.card ?? null : null
      if (slug && slug !== current) {
        current = slug
        setGraphFocus(slug)
        setHoveredNode(slug)
      }
    }

    const frame = (t: number) => {
      raf = 0
      if (disposed) return
      const dt = lastT ? Math.min(64, t - lastT) : 16
      lastT = t

      if (mode === "pin") {
        const top = section.getBoundingClientRect().top
        const p = travel > 0 ? clamp(-top / travel, 0, 1) : 0
        trackX = -p * travel
        track.style.transform = `translate3d(${trackX.toFixed(2)}px,0,0)`
      } else if (mode === "swipe") {
        trackX = -view.scrollLeft
      }

      // smoothed velocity: positive while the cards travel left
      const v = (lastX - trackX) / Math.max(1, dt)
      lastX = trackX
      const target = mode === "static" ? 0 : clamp(v / (mode === "pin" ? 2.4 : 3.2), -1, 1)
      const k = 1 - Math.exp(-dt / (Math.abs(target) > Math.abs(bend) ? 90 : 220))
      bend += (target - bend) * k
      if (Math.abs(bend) < 0.002 && target === 0) bend = 0

      let hovering = false
      for (let i = 0; i < hover.length; i++) {
        hover[i] += (hoverTarget[i] - hover[i]) * (1 - Math.exp(-dt / 120))
        if (Math.abs(hover[i] - hoverTarget[i]) > 0.002) hovering = true
        else hover[i] = hoverTarget[i]
      }

      if (gl) {
        const sig = `${trackX.toFixed(1)}|${bend.toFixed(4)}|${hover.map((h) => h.toFixed(3)).join(",")}`
        if (sig !== lastSig) {
          lastSig = sig
          const rects: GalleryCardRect[] = base.map((b, i) => ({ x: b.x + trackX, y: b.y, w: b.w, h: b.h, hover: hover[i] }))
          gl.render(rects, bend)
        }
      } else if (mode !== "static") {
        view.style.setProperty("--bend", bend.toFixed(4))
      }

      // only while the gallery is on screen: before it arrives (or after it
      // leaves) the star map must keep its own hover and centre
      if (mode !== "static" && inView) pickActive(trackX)

      // keep running while on screen and moving; scroll events restart it
      if (inView && (bend !== 0 || hovering || mode === "pin")) raf = requestAnimationFrame(frame)
    }

    // the loop only runs while the gallery is on screen
    const kick = () => {
      if (!raf && !disposed && inView) {
        if (!lastT) lastT = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    const startGL = () => {
      if (gl || glFailed || glLoading || mode !== "pin") return
      glLoading = true
      // the images are lazy: start them all now that the gallery is close
      imgs.forEach((img) => (img.loading = "eager"))
      import("./work-gallery-gl")
        .then(({ createGalleryGL }) => {
          glLoading = false
          if (disposed || mode !== "pin") return
          try {
            gl = createGalleryGL(
              canvas,
              imgs,
              (i) => {
                cards[i].classList.add("is-gl")
                lastSig = ""
                kick()
              },
              () => {
                gl?.dispose()
                gl = null
                glFailed = true
                cards.forEach((c) => c.classList.remove("is-gl"))
                section.removeAttribute("data-gl")
              },
            )
            section.setAttribute("data-gl", "")
            gl.resize(viewW, viewH)
            kick()
          } catch {
            glFailed = true
          }
        })
        .catch(() => {
          glLoading = false
          glFailed = true
        })
    }

    const stopGL = () => {
      gl?.dispose()
      gl = null
      cards.forEach((c) => c.classList.remove("is-gl"))
      section.removeAttribute("data-gl")
    }

    const chooseMode = () => {
      const next = reduced ? "static" : isPhone() ? "swipe" : "pin"
      if (next !== mode) {
        if (next !== "pin") stopGL()
        setMode(next)
        view.style.removeProperty("--bend")
        track.style.transform = ""
      }
      measure()
      if (mode === "pin" && inView) startGL()
      kick()
    }

    // on screen: drive the loop, hide the floating star labels, pan the sky
    const near = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting
        if (inView) {
          root.setAttribute("data-work-focus", "")
          if (mode === "pin") startGL()
          kick()
        } else {
          if (raf) cancelAnimationFrame(raf)
          raf = 0
          lastT = 0
          root.removeAttribute("data-work-focus")
          current = null
          setGraphFocus(null)
          setHoveredNode(null)
        }
      },
      { rootMargin: "-15% 0px -15% 0px" },
    )

    // warm up the images and GL a little before the section arrives
    const early = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        imgs.forEach((img) => (img.loading = "eager"))
        if (mode === "pin") startGL()
        early.disconnect()
      },
      { rootMargin: "100% 0px 100% 0px" },
    )

    const onScroll = () => {
      if (inView) kick()
    }

    // keyboard: a focused card off to the side scrolls the page to it
    const onFocus = (e: FocusEvent) => {
      if (mode !== "pin") return
      const i = cards.findIndex((c) => c.contains(e.target as Node))
      if (i < 0) return
      // after the browser's own focus scroll, which would otherwise win
      requestAnimationFrame(() => {
        if (view.parentElement) view.parentElement.scrollLeft = 0
        const b = base[i]
        const want = clamp(b.x + b.w / 2 - viewW / 2, 0, travel)
        const sectionTop = section.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: sectionTop + want })
        kick()
      })
    }

    const onEnter = (e: PointerEvent) => {
      const i = cards.indexOf(e.currentTarget as HTMLElement)
      if (i >= 0) hoverTarget[i] = 1
      kick()
    }
    const onLeave = (e: PointerEvent) => {
      const i = cards.indexOf(e.currentTarget as HTMLElement)
      if (i >= 0) hoverTarget[i] = 0
      kick()
    }

    let resizeT = 0
    const onResize = () => {
      window.clearTimeout(resizeT)
      resizeT = window.setTimeout(chooseMode, 120)
    }

    chooseMode()
    near.observe(section)
    early.observe(section)
    window.addEventListener("scroll", onScroll, { passive: true })
    view.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    section.addEventListener("focusin", onFocus)
    cards.forEach((c) => {
      c.addEventListener("pointerenter", onEnter)
      c.addEventListener("pointerleave", onLeave)
    })
    // images or fonts arriving can move the frames
    const ro = new ResizeObserver(() => measure())
    ro.observe(track)

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(resizeT)
      near.disconnect()
      early.disconnect()
      ro.disconnect()
      window.removeEventListener("scroll", onScroll)
      view.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      section.removeEventListener("focusin", onFocus)
      cards.forEach((c) => {
        c.removeEventListener("pointerenter", onEnter)
        c.removeEventListener("pointerleave", onLeave)
      })
      stopGL()
      section.style.height = ""
      track.style.transform = ""
      root.removeAttribute("data-work-focus")
      setGraphFocus(null)
      setHoveredNode(null)
    }
  }, [])

  return (
    <section id="work" ref={sectionRef} aria-labelledby="work-title" className="gal" data-gallery="swipe">
      <div className="gal-stage">
        <div className="wrap gal-head">{head}</div>
        <div ref={viewRef} className="gal-view">
          <ul ref={trackRef} className="gal-track" aria-label="Selected projects">
            {items.map((p) => (
              <li key={p.slug} data-card={p.slug} className="gal-card">
                <Link href={p.slug === "rive-foundry" ? "/rive-foundry" : `/work/${p.slug}`} className="gal-link">
                  <span data-frame className="gal-frame">
                    <Image src={p.src} alt="" quality={85} width={1600} height={1000} sizes="(min-width: 768px) 60vw, 84vw" />
                  </span>
                  <span className="gal-cap">
                    <span className="gal-name">{p.name}</span>
                    <span className="gal-meta">{p.meta}</span>
                  </span>
                  <span className="gal-line">{p.line}</span>
                </Link>
              </li>
            ))}
          </ul>
          <canvas ref={canvasRef} className="gal-gl" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
