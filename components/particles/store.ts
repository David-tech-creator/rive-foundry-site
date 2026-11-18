"use client"

/**
 * Tiny shared store between the particle engine, the preloader, HTML graph
 * labels and the page. No dependencies; React reads it through
 * useSyncExternalStore.
 */
import { useSyncExternalStore } from "react"
import type { GraphLayout } from "@/lib/formations/types"

export type ParticleMode = "pending" | "webgl" | "static"

export type ParticleState = {
  /** pending until ParticleStage decides; static = reduced motion or no WebGL */
  mode: ParticleMode
  /** engine built its first formations and is rendering */
  engineReady: boolean
  /** 0..1, driven by the Preloader; the lodestar's arms fill with it */
  loadProgress: number
  /** a Preloader is on the page; the engine waits for it before the intro */
  preloaderMounted: boolean
  preloaderDone: boolean
  /** the portrait easter egg: morph to the astronaut bust without scrolling */
  suitUp: boolean
  /** where the bust is drawn, in CSS pixels; the film opens exactly on it */
  bustBox: { top: number; bottom: number; centerX: number } | null
  /** graph node under the pointer (brightens its edges) */
  hoveredNode: string | null
  /** graph node the sky should pan toward (e.g. active item in the work list) */
  graphFocus: string | null
  /** knowledge graph layout in normalized -1..1 space */
  graph: GraphLayout | null
}

let state: ParticleState = {
  mode: "pending",
  engineReady: false,
  loadProgress: 0,
  preloaderMounted: false,
  preloaderDone: false,
  suitUp: false,
  bustBox: null,
  hoveredNode: null,
  graphFocus: null,
  graph: null,
}

const listeners = new Set<() => void>()

export const particleStore = {
  get: (): ParticleState => state,
  set(patch: Partial<ParticleState>) {
    let changed = false
    for (const k in patch) {
      const key = k as keyof ParticleState
      if (state[key] !== patch[key]) {
        changed = true
        break
      }
    }
    if (!changed) return
    state = { ...state, ...patch }
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

const serverState = state

/** Select a slice of the particle state. */
export function useParticleState<T>(selector: (s: ParticleState) => T): T {
  return useSyncExternalStore(
    particleStore.subscribe,
    () => selector(particleStore.get()),
    () => selector(serverState),
  )
}

/** "pending" on the server and first client render, then "webgl" or "static". */
export function useParticlesMode(): ParticleMode {
  return useParticleState((s) => s.mode)
}

export function setHoveredNode(id: string | null) {
  particleStore.set({ hoveredNode: id })
}

export function setGraphFocus(id: string | null) {
  particleStore.set({ graphFocus: id })
}

export function setGraphLayout(graph: GraphLayout | null) {
  particleStore.set({ graph })
}

/* ------------------------------------------------------------------ */
/* Graph label registry + per-frame screen projection                  */
/* ------------------------------------------------------------------ */

/** Elements the engine moves onto projected node positions every frame. */
export const graphLabelElements = new Map<string, HTMLElement>()

export function registerGraphLabel(id: string, el: HTMLElement): () => void {
  graphLabelElements.set(id, el)
  return () => {
    if (graphLabelElements.get(id) === el) graphLabelElements.delete(id)
  }
}

export type NodeScreen = {
  /** CSS px from the viewport's top-left */
  x: number
  y: number
  /** projected disc radius in CSS px */
  r: number
  /** 0..1, how formed the graph is right now */
  visible: number
}

const screenCache = new Map<string, NodeScreen>()
const frameListeners = new Set<() => void>()

/** Engine-side: publish a node's projected position (only when it moved). */
export function publishNodeScreen(id: string, x: number, y: number, r: number, visible: number) {
  const prev = screenCache.get(id)
  if (
    prev &&
    Math.abs(prev.x - x) < 0.5 &&
    Math.abs(prev.y - y) < 0.5 &&
    Math.abs(prev.r - r) < 0.5 &&
    Math.abs(prev.visible - visible) < 0.01
  )
    return false
  screenCache.set(id, { x, y, r, visible })
  return true
}

/** Engine-side: notify hook subscribers once per frame after publishing. */
export function flushNodeScreens() {
  frameListeners.forEach((l) => l())
}

export function hasNodeScreenListeners() {
  return frameListeners.size > 0
}

const HIDDEN: NodeScreen = { x: 0, y: 0, r: 0, visible: 0 }

/**
 * Projected screen position of a graph node, for custom overlays. Prefer
 * <GraphLabel> (no React re-render per frame) for plain labels.
 */
export function useGraphNodeScreen(id: string): NodeScreen {
  return useSyncExternalStore(
    (l) => {
      frameListeners.add(l)
      return () => {
        frameListeners.delete(l)
      }
    },
    () => screenCache.get(id) ?? HIDDEN,
    () => HIDDEN,
  )
}

export function getGraphNodeScreen(id: string): NodeScreen | undefined {
  return screenCache.get(id)
}
