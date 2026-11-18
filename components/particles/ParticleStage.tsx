"use client"

import "./particles.css"
import { useEffect, useRef, useState } from "react"
import type { GraphLayout } from "@/lib/formations/types"
import type { Engine, ParticleAssets } from "./engine"
import { particleStore, setGraphLayout, useParticlesMode } from "./store"

export type ParticleStageProps = {
  /** Optional: knowledge-graph layout (or publish it with <GraphLayoutSource />). */
  graph?: GraphLayout
  /** Particle count on desktop. Default 60 000. */
  count?: number
  /** Particle count on phones (touch or narrow screens). Default 20 000. */
  mobileCount?: number
  /** Particle count on tablets (touch, shorter side 600px or more). Default 30 000. */
  tabletCount?: number
  /** Override mask / luminance image URLs. */
  assets?: Partial<ParticleAssets>
}

/** Context attributes of the particle renderer (antialias off, opaque). */
const ENGINE_CONTEXT: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: true,
  stencil: false,
  premultipliedAlpha: true,
  powerPreference: "high-performance",
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas")
    const gl = c.getContext("webgl2")
    if (!gl) return false
    gl.getExtension("WEBGL_lose_context")?.loseContext()
    return true
  } catch {
    return false
  }
}

/** Resolves once the window has loaded and the main thread has a gap (max ~1.5s after load). */
function afterFirstPaint(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback
      if (ric) ric(() => resolve(), { timeout: 1500 })
      else setTimeout(resolve, 200)
    }
    if (document.readyState === "complete") idle()
    else window.addEventListener("load", idle, { once: true })
  })
}

function useReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

/**
 * The single fixed, full-viewport particle canvas behind the page. Mount once
 * (root layout). Decoration only: aria-hidden, pointer-events none, and three
 * is loaded with a dynamic import after hydration.
 */
export function ParticleStage({ graph, count = 130000, mobileCount = 84000, tabletCount = 100000, assets }: ParticleStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const mode = useParticlesMode()
  const assetsKey = JSON.stringify(assets ?? {})

  const graphKey = graph ? JSON.stringify(graph) : ""
  useEffect(() => {
    if (graphKey) setGraphLayout(JSON.parse(graphKey) as GraphLayout)
  }, [graphKey])

  useEffect(() => {
    if (reduced === null) return
    const root = document.documentElement
    // the boot script in the root layout already vouched for WebGL2: skip a
    // second throwaway context (a failure to create the real one falls back below)
    if (reduced || !(root.getAttribute("data-particles") === "on" || webglAvailable())) {
      particleStore.set({ mode: "static", engineReady: false })
      root.setAttribute("data-particles", "off")
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return

    let engine: Engine | null = null
    let cancelled = false
    // device tier: phones and tablets get fewer, larger particles (the pixel
    // ratio stays at 2 so the dots stay sharp on their dense screens)
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const shortSide = Math.min(window.innerWidth, window.innerHeight)
    const tier = window.innerWidth < 768 || (coarse && shortSide < 600) ? "phone" : coarse ? "tablet" : "desktop"
    const cores = navigator.hardwareConcurrency || 8
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
    const base = tier === "phone" ? mobileCount : tier === "tablet" ? tabletCount : count
    // only genuinely weak devices: Safari reports few cores even on fast iPhones
    const n = Math.round(base * (cores <= 2 || memory <= 2 ? 0.6 : 1))
    // phones and tablets have 2x-3x screens: below 2 the canvas is upscaled and the dots go soft
    const maxDpr = 2
    const minDpr = tier === "desktop" ? 1 : 1.5

    // Phones and tablets: let the page paint and settle first (the hero text
    // is the LCP element there, with no preloader in front of it), then pull
    // in three.js. Desktop keeps loading it straight away for the preloader.
    const boot = () => (tier === "desktop" ? Promise.resolve() : afterFirstPaint())

    // Make the real context before pulling in three.js: with WebGL turned off
    // this fails quietly (no three.js console errors) and the page goes
    // straight to the static fallbacks. The attributes match the engine's.
    let context: WebGL2RenderingContext | null = null
    boot()
      .then(() => {
        if (cancelled) return Promise.reject(new Error("cancelled"))
        try {
          context = canvas.getContext("webgl2", ENGINE_CONTEXT)
        } catch {
          context = null
        }
        return context ? import("./engine") : Promise.reject(new Error("no webgl2"))
      })
      .then(({ createEngine }) => {
        if (cancelled || !context) return
        engine = createEngine({
          canvas,
          context,
          count: n,
          maxDpr,
          minDpr,
          assets: JSON.parse(assetsKey) as Partial<ParticleAssets>,
          onContextLost: () => {
            engine?.dispose()
            engine = null
            particleStore.set({ mode: "static", engineReady: false })
            root.setAttribute("data-particles", "off")
          },
        })
        particleStore.set({ mode: "webgl" })
      })
      .catch(() => {
        if (cancelled) return
        particleStore.set({ mode: "static", engineReady: false })
        root.setAttribute("data-particles", "off")
      })

    return () => {
      cancelled = true
      engine?.dispose()
      engine = null
    }
  }, [reduced, count, mobileCount, tabletCount, assetsKey])

  // the canvas stays mounted (empty in static mode) so turning reduced motion
  // off later can start the engine on it
  return (
    <div className="pf-stage" aria-hidden="true" hidden={mode === "static"}>
      <canvas ref={canvasRef} />
    </div>
  )
}
