"use client"

import { useEffect, useState } from "react"
import { GraphLayoutSource } from "@/components/particles"
import type { GraphLayout } from "@/lib/formations/types"

/**
 * Publishes the knowledge-graph layout that fits the screen: the wide one on
 * desktop, the compact portrait one on portrait screens (width/height < 0.9)
 * and on tablets or phones held sideways (under 1280px wide or 560px tall).
 * Same thresholds as layoutMode() in components/particles/layout.ts: the
 * engine fits the compact layout beside the copy on those screens.
 */
const COMPACT_QUERY = "(max-aspect-ratio: 9/10), (max-width: 1279px), (max-height: 559px)"
export function GraphLayoutSwitch({ wide, portrait }: { wide: GraphLayout; portrait: GraphLayout }) {
  // null until the first effect: publish one layout, the right one, instead of
  // wide first and portrait a frame later (each publish rebuilds the graph)
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY)
    const update = () => setIsPortrait(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  if (isPortrait === null) return null
  return <GraphLayoutSource layout={isPortrait ? portrait : wide} />
}
