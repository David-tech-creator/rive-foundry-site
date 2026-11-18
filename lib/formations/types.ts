/**
 * Shared types for the particle formations ("Mission log").
 *
 * A formation is a target shape for the single particle cloud. Each one is a
 * Float32Array of `count * 4` floats: xyz in the formation's LOCAL space plus a
 * brightness in w. The vertex shader places local space on screen with a
 * per-formation offset/scale uniform, so a resize never forces a rebuild.
 *
 * World space: the camera sees y in [-1, 1] and x in [-aspect, aspect] at z = 0.
 */

/** Scroll formations, in the order they appear on the page (chain order). */
export const FORMATIONS = [
  "portrait",
  "astronaut-bust",
  "astronaut-float",
  "globe",
  "leman",
  "graph",
  "helix",
  "orbits",
  "contact",
  "ridge",
] as const

export type FormationName = (typeof FORMATIONS)[number]

export const FORMATION_INDEX: Record<FormationName, number> = FORMATIONS.reduce(
  (acc, name, i) => {
    acc[name] = i
    return acc
  },
  {} as Record<FormationName, number>,
)

export function isFormationName(v: string | null | undefined): v is FormationName {
  return !!v && (FORMATIONS as readonly string[]).includes(v)
}

/** A node of the knowledge graph in normalized -1..1 space (y up). */
export type GraphLayoutNode = {
  id: string
  x: number
  y: number
  /** radius in the same normalized space, e.g. 0.02..0.08 */
  r: number
  /** 0..1, importance; drives brightness */
  weight: number
}

/** `w` 0..1: how strongly the line is drawn (default 0.5). */
export type GraphLayoutEdge = { from: string; to: string; w?: number }

export type GraphLayout = { nodes: GraphLayoutNode[]; edges: GraphLayoutEdge[] }

/** Hard cap: node positions live in a uniform array of this size. */
export const MAX_GRAPH_NODES = 96

/** Brightness above this reads as an azure accent in the fragment shader. */
export const ACCENT_BRIGHTNESS = 1.3

/**
 * Flag convention for w: values >= 2 mean "special particle" for formations
 * that animate in the shader (globe: do not spin, orbits: ring particle).
 * The real brightness is then w - 2.
 */
export const FLAG = 2
