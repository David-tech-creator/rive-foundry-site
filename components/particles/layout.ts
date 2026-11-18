/**
 * Placement of the scroll formations on screen, per viewport class. Pure
 * helpers used by the engine (no three.js, no DOM writes).
 *
 * - wide: desktop landscape. Shapes on the right half, copy on the left.
 *   These values are the original desktop tuning; leave them alone.
 * - compact: landscape tablets (iPad held sideways) and phones held sideways.
 *   Same idea as wide, but the copy column takes a bigger share of the
 *   width, so each shape is fitted into the free area to the right of it.
 * - portrait: phones and portrait tablets. Shapes in the upper part of the
 *   screen, copy in the lower part; each shape is fitted into the space left
 *   above its section's copy.
 */
import { FLAG, type FormationName } from "@/lib/formations/types"
import { HELIX_RADIUS } from "@/lib/formations/shapes"

export type LayoutMode = "wide" | "compact" | "portrait"

/** x as a fraction of the half-width, y and scale in world units. */
export type Place = { x: number; y: number; s: number }

/** Shape extent in its local space (before scale), robust to stray dust. */
export type Bounds = { minX: number; maxX: number; minY: number; maxY: number }

/** World-space rectangle (y up, viewport half-height = 1). */
export type Rect = { x0: number; x1: number; y0: number; y1: number }

export function layoutMode(vw: number, vh: number): LayoutMode {
  const aspect = vw / vh
  if (aspect < 0.9) return "portrait"
  if (vw < 1280 || vh < 560) return "compact"
  return "wide"
}

export function defaultPlace(name: FormationName, aspect: number, mode: LayoutMode): Place {
  if (mode === "portrait") {
    const a = aspect
    switch (name) {
      case "portrait":
      case "astronaut-bust":
        // high and a little smaller, so the hero copy fits in the lower half
        return { x: 0, y: 0.44, s: Math.min(0.5, a * 0.82) }
      case "astronaut-float":
        // higher and smaller so the figure clears the kicker and heading
        return { x: 0.18, y: 0.5, s: Math.min(0.36, a * 0.62) }
      case "globe":
        return { x: 0.12, y: 0.36, s: a * 0.6 }
      case "leman":
        // the east end (Montreux) used to touch the right edge
        return { x: 0, y: 0.34, s: a * 0.86 }
      case "helix":
        // top left to bottom right above the copy; fitted into the space left
        return { x: 0, y: 0.42, s: Math.min(0.9, a * 1.25) }
      case "orbits":
        return { x: 0, y: 0.34, s: a * 0.64 }
      case "ridge":
        return { x: 0, y: 0.42, s: a * 1.02 }
      default:
        return { x: 0, y: 0, s: 1 }
    }
  }
  if (mode === "compact") {
    // tablet branch: a touch further right and smaller than desktop; the
    // engine then fits each shape beside the measured copy column
    switch (name) {
      case "portrait":
      case "astronaut-bust":
        return { x: 0.5, y: -0.02, s: 0.86 }
      case "astronaut-float":
        return { x: 0.56, y: 0.02, s: 0.66 }
      case "globe":
        return { x: 0.52, y: 0, s: 0.5 }
      case "leman":
        return { x: 0.52, y: 0.02, s: Math.min(aspect * 0.42, 0.74) }
      case "helix":
        return { x: 0.5, y: 0, s: 1.05 }
      case "orbits":
        return { x: 0.52, y: -0.02, s: 0.48 }
      case "ridge":
        return { x: 0.5, y: 0.02, s: 0.62 }
      default:
        return { x: 0, y: 0, s: 1 }
    }
  }
  switch (name) {
    case "portrait":
      return { x: 0.46, y: -0.02, s: 0.92 }
    case "astronaut-bust":
      // a little further right and smaller than the portrait: at 0.46 the
      // helmet ran into the end of the section 01 copy
      return { x: 0.52, y: -0.02, s: 0.86 }
    case "astronaut-float":
      return { x: 0.5, y: 0.02, s: 0.72 }
    case "globe":
      return { x: 0.44, y: 0, s: 0.56 }
    case "leman":
      // right of the copy column, so the bright shore never crosses the text
      return { x: 0.44, y: 0.02, s: Math.min(aspect * 0.5, 0.82) }
    case "helix":
      // right of the copy, running corner to corner through the right half
      return { x: 0.5, y: 0, s: 1.22 }
    case "orbits":
      return { x: 0.4, y: 0, s: 0.54 }
    case "ridge":
      return { x: 0.5, y: 0.04, s: 0.8 }
    default:
      return { x: 0, y: 0, s: 1 }
  }
}

/**
 * Screen angle of the helix axis (radians, negative = top left to bottom
 * right). Steep on landscape screens; on portrait screens it follows the
 * diagonal of the free area above the copy, so a short strip on a phone
 * still gets a long helix.
 */
export function helixAngle(mode: LayoutMode, free: Rect | null): number {
  if (mode !== "portrait" || !free) return -0.92
  const a = Math.atan2(free.y1 - free.y0, free.x1 - free.x0)
  return -Math.min(0.95, Math.max(0.36, a))
}

/**
 * Local extent of the helix laid at `angle`: the visible axis (the faded
 * ends left out) plus the strand radius on both sides.
 */
export function helixBounds(angle: number): Bounds {
  const half = 0.82
  const r = HELIX_RADIUS * 1.15
  const c = Math.abs(Math.cos(angle))
  const s = Math.abs(Math.sin(angle))
  const hx = c * half + s * r
  const hy = s * half + c * r
  return { minX: -hx, maxX: hx, minY: -hy, maxY: hy }
}

function percentile(sorted: number[], p: number) {
  if (!sorted.length) return 0
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))
  return sorted[i]
}

/**
 * On-screen extent of a built formation in local units. Faint dust is left
 * out (it may drift off screen), and the 2nd to 98th percentile is used so a
 * few stray particles do not shrink the shape. Shapes the shader rotates are
 * measured as they appear: the globe as its full sphere, orbit rings as tilted
 * circles.
 */
export function measureBounds(name: FormationName, arr: Float32Array, count: number): Bounds | null {
  // the helix's extent depends on its screen angle: see helixBounds()
  if (name === "graph" || name === "contact" || name === "helix") return null
  const step = Math.max(1, Math.floor(count / 4000))
  const xs: number[] = []
  const ys: number[] = []
  const ax: number[] = []
  const ay: number[] = []
  const push = (x0: number, x1: number, y0: number, y1: number) => {
    xs.push(x0, x1)
    ys.push(y0, y1)
  }
  for (let i = 0; i < count; i += step) {
    const o = i * 4
    const x = arr[o]
    const y = arr[o + 1]
    const z = arr[o + 2]
    const w = arr[o + 3]
    const flagged = w >= FLAG
    const b = flagged ? w - FLAG : w
    if (name === "orbits") {
      if (flagged) {
        // ring particle: the whole ring sweeps past, tilted ~0.34 rad and
        // rolled 0.16 rad, so it spans about r across and 0.5 r up and down
        const r = Math.hypot(x, z)
        push(-r, r, -r * 0.5, r * 0.5)
      } else {
        const r = Math.hypot(x, y, z)
        push(-r, r, -r, r)
      }
      continue
    }
    if (name === "globe" && !flagged) {
      if (b < 0.25) continue // atmosphere haze
      const r = Math.hypot(x, y, z)
      push(-r, r, -r, r)
      continue
    }
    if (name === "ridge" && z < -0.3) continue // the sky may run past the frame
    if (b < 0.3) continue // loose dust around the figures
    if (name === "globe") {
      ax.push(x)
      ay.push(y)
      continue
    }
    push(x, x, y, y)
  }
  if (xs.length < 20) return null
  xs.sort((a, b) => a - b)
  ys.sort((a, b) => a - b)
  const out = {
    minX: percentile(xs, 0.005),
    maxX: percentile(xs, 0.995),
    minY: percentile(ys, 0.005),
    maxY: percentile(ys, 0.995),
  }
  // the globe's small astronaut is a minority of the samples: measure it on
  // its own so a percentile can never trim it off the edge of the screen
  if (ax.length > 20) {
    ax.sort((a, b) => a - b)
    ay.sort((a, b) => a - b)
    out.minX = Math.min(out.minX, percentile(ax, 0.01))
    out.maxX = Math.max(out.maxX, percentile(ax, 0.99))
    out.minY = Math.min(out.minY, percentile(ay, 0.01))
    out.maxY = Math.max(out.maxY, percentile(ay, 0.99))
  }
  return out
}

/**
 * Fit a shape into a free rectangle: shrink it (never grow it, never below
 * minFrac of its default size) and move it as little as possible from its
 * default position so its bounds stay inside the rectangle. Returns x as a
 * fraction of the half-width, like Place.
 */
export function fitPlace(base: Place, b: Bounds, rect: Rect, aspect: number, minFrac: number): Place {
  const bw = Math.max(1e-3, b.maxX - b.minX)
  const bh = Math.max(1e-3, b.maxY - b.minY)
  const rw = Math.max(1e-3, rect.x1 - rect.x0)
  const rh = Math.max(1e-3, rect.y1 - rect.y0)
  const s = Math.max(base.s * minFrac, Math.min(base.s, rw / bw, rh / bh))
  const keep = (want: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, want)))
  // allowed centre positions so that bounds stay inside the rect
  let cx = keep(base.x * aspect, rect.x0 - b.minX * s, rect.x1 - b.maxX * s)
  const cy = keep(base.y, rect.y0 - b.minY * s, rect.y1 - b.maxY * s)
  // whatever happens, keep the shape on screen horizontally when it fits
  const edge = aspect * 0.98
  if (bw * s < edge * 2) cx = Math.min(edge - b.maxX * s, Math.max(-edge - b.minX * s, cx))
  return { x: cx / aspect, y: cy, s }
}
