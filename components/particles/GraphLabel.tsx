"use client"

import { useCallback, useEffect, useRef, type ReactNode } from "react"
import type { GraphLayout } from "@/lib/formations/types"
import { scrollToTarget } from "@/components/motion/SmoothScroll"
import { registerGraphLabel, setGraphLayout, setHoveredNode } from "./store"

export type GraphLabelProps = {
  /** graph node id; must match a node in the published layout */
  id: string
  children: ReactNode
  className?: string
  /** wrapper element, default "li" so a list of labels stays semantic */
  as?: "li" | "div" | "span"
  /** side of the star the label sits on, per graph layout (default right) */
  side?: { wide?: LabelSide; compact?: LabelSide }
}

export type LabelSide = "right" | "left" | "above" | "below"

/**
 * Server-rendered label (put a real <a href="/work/<slug>"> inside). With the
 * WebGL field running, the engine moves it onto its projected star every frame
 * and hovering it brightens that star's constellation lines. Without WebGL it
 * stays in normal document flow.
 */
export function GraphLabel({ id, children, className, as = "li", side }: GraphLabelProps) {
  const ref = useRef<HTMLElement | null>(null)
  const setRef = useCallback((el: HTMLElement | null) => {
    ref.current = el
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const off = registerGraphLabel(id, el)
    return () => {
      off()
      setHoveredNode(null)
    }
  }, [id])

  const props = {
    ref: setRef,
    className,
    "data-graph-label": id,
    "data-side-wide": side?.wide,
    "data-side-compact": side?.compact,
    onPointerEnter: () => setHoveredNode(id),
    onPointerLeave: () => setHoveredNode(null),
    onFocus: () => {
      setHoveredNode(id)
      // keyboard users: bring the constellation into its formed position so
      // the focused label sits on a visible star
      const root = document.documentElement
      if (root.getAttribute("data-particles") === "on" && !root.hasAttribute("data-graph-active")) {
        const section = ref.current?.closest<HTMLElement>('[data-formation="graph"]')
        if (section) {
          const top = section.getBoundingClientRect().top + window.scrollY
          scrollToTarget(top + window.innerHeight * 0.5, 0)
        }
      }
    },
    onBlur: () => setHoveredNode(null),
  }
  const inner = <span className="pf-label-inner">{children}</span>
  if (as === "div") return <div {...props}>{inner}</div>
  if (as === "span") return <span {...props}>{inner}</span>
  return <li {...props}>{inner}</li>
}

let layoutGeneration = 0

/** Publish the knowledge-graph layout to the particle engine while mounted. */
export function useGraphLayout(layout: GraphLayout | null) {
  // keyed by content so a new object with the same data does not rebuild
  const key = layout ? JSON.stringify(layout) : ""
  useEffect(() => {
    const gen = ++layoutGeneration
    setGraphLayout(key ? (JSON.parse(key) as GraphLayout) : null)
    return () => {
      // a layout switch publishes the next layout right after this cleanup;
      // only clear when nothing replaced it, so the graph is not rebuilt twice
      queueMicrotask(() => {
        if (layoutGeneration === gen) setGraphLayout(null)
      })
    }
  }, [key])
}

/** Component form of useGraphLayout, for server pages: <GraphLayoutSource layout={...} />. */
export function GraphLayoutSource({ layout }: { layout: GraphLayout }) {
  useGraphLayout(layout)
  return null
}
