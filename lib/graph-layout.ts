/**
 * Star-map layout of the knowledge graph in lib/graph.ts, in the particle
 * engine's normalized space (-1..1, y up). Pure and deterministic, so the
 * server render, the WebGL field and the SVG fallback all agree.
 *
 * David sits at the centre as the brightest star. Around him sit five
 * constellations (CONSTELLATIONS in lib/graph.ts): a labelled hub star with
 * its products clustered round it. Bright lines run David to hub, hub to
 * product, and product to product where one is built on another. Secondary
 * themes are faint inner stars, tech stars faint on the rim, both with dim
 * lines so the constellations read first.
 */
import { CONSTELLATIONS, EDGES, PERSON, PERSON_ID, PRODUCTS, TECH, THEMES } from "@/lib/graph"
import type { GraphLayout, GraphLayoutNode } from "@/lib/formations/types"

export type StarNode = GraphLayoutNode & {
  kind: "person" | "product" | "theme" | "tech"
  label: string
  /** true for a constellation hub: a theme star that carries a label */
  hub?: boolean
  /** hubs: where the constellation name sits, away from the lines */
  side?: LabelSide
  href?: string
}

/** Where a constellation name sits around its hub star. */
export type LabelSide = "right" | "left" | "above" | "below"

const SIDES: Array<[LabelSide, number, number]> = [
  ["right", 1, 0],
  ["below", 0, -1],
  ["above", 0, 1],
  ["left", -1, 0],
]

/**
 * The side of a hub star with the fewest lines running through it: the one
 * whose direction is furthest from every line leaving the star. A line that
 * reaches its next star within the label's length counts double (the label
 * would sit on that star). `sx` and `sy` stretch the layout into screen
 * proportions; `reachH` and `reachV` are the label's length beside and
 * above/below the star in those units.
 */
function pickSide(
  hub: { x: number; y: number },
  ends: Array<{ x: number; y: number }>,
  sx: number,
  sy: number,
  reachH: number,
  reachV: number,
): LabelSide {
  let best: LabelSide = "right"
  let bestScore = Infinity
  for (const [side, dx, dy] of SIDES) {
    const reach = dx ? reachH : reachV
    let score = -Infinity
    for (const o of ends) {
      const vx = (o.x - hub.x) * sx
      const vy = (o.y - hub.y) * sy
      const d = Math.hypot(vx, vy) || 1
      const dot = (vx * dx + vy * dy) / d
      score = Math.max(score, dot > 0.3 && d * dot < reach ? dot * 2 : dot)
    }
    // a clear win only: right is the default and reads best
    if (score < bestScore - 0.08) {
      best = side
      bestScore = score
    }
  }
  return best
}

/** Line ends of a hub: David plus every star with an edge to it. */
function hubEnds(hub: StarNode, nodes: StarNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const ends: StarNode[] = [byId.get(PERSON_ID)!]
  for (const e of EDGES) {
    const other = e.to === hub.id ? e.from : e.from === hub.id ? e.to : null
    const n = other ? byId.get(other) : undefined
    if (n && n.id !== PERSON_ID && (n.kind === "product" || n.hub)) ends.push(n)
  }
  return ends
}

/** Hub labels placed by hand in the wide layout, where pickSide's choice collides with a product label. */
const WIDE_SIDE: Record<string, LabelSide> = { "self-hosting": "above", workshop: "below", family: "above" }

/** Rough on-screen aspect of the graph area (x is stretched by the engine). */
const ASPECT = 1.6
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

function round(n: number) {
  return Math.round(n * 1000) / 1000
}

function build(): { nodes: StarNode[]; edges: GraphLayout["edges"] } {
  const nodes: StarNode[] = []

  nodes.push({
    id: PERSON_ID,
    kind: "person",
    label: PERSON.name,
    href: "/",
    x: 0,
    y: 0,
    r: 0.075,
    weight: 1,
  })

  // constellations: hub stars on a ring, products clustered round each hub
  const hubs = new Map(CONSTELLATIONS.map((c) => [c.theme, c]))
  const N = CONSTELLATIONS.length
  CONSTELLATIONS.forEach((c, ci) => {
    const a = (ci / N) * Math.PI * 2 + 2.2
    const hx = Math.cos(a) * 0.5
    const hy = Math.sin(a) * 0.52
    nodes.push({ id: c.theme, kind: "theme", hub: true, label: c.label, x: hx, y: hy, r: 0.02, weight: 0.55 })
    const members = c.members.map((slug) => PRODUCTS.find((p) => p.slug === slug)).filter((p): p is (typeof PRODUCTS)[number] => Boolean(p))
    // fan the products out on the far side of the hub, heaviest in the middle
    const sorted = [...members].sort((x, y) => y.weight - x.weight)
    const order: typeof sorted = []
    sorted.forEach((m, k) => (k % 2 ? order.push(m) : order.unshift(m)))
    const spread = Math.min(2.6, 0.95 * order.length)
    order.forEach((p, k) => {
      const t = order.length === 1 ? 0 : k / (order.length - 1) - 0.5
      const pa = a + t * spread
      const rad = 0.2 + (1 - p.weight) * 0.06
      nodes.push({
        id: p.slug,
        kind: "product",
        label: p.name,
        href: p.slug === "rive-foundry" ? "/rive-foundry" : `/work/${p.slug}`,
        x: hx + Math.cos(pa) * rad,
        y: hy + Math.sin(pa) * rad * 0.95,
        r: 0.022 + p.weight * 0.034,
        // stay just under David so he keeps the azure core
        weight: Math.min(0.95, 0.35 + p.weight * 0.6),
      })
    })
  })

  // other themes: faint unlabelled stars close to David
  THEMES.filter((t) => !hubs.has(t.id)).forEach((t, i, all) => {
    const a = (i / all.length) * Math.PI * 2 + 0.6
    nodes.push({ id: t.id, kind: "theme", label: t.label, x: Math.cos(a) * 0.2, y: Math.sin(a) * 0.22, r: 0.012, weight: 0.3 })
  })

  // tech: faint stars on the rim
  TECH.forEach((t, i) => {
    const a = (i / TECH.length) * Math.PI * 2 + 0.12
    const rad = 0.92 + ((i * 37) % 7) * 0.012
    nodes.push({
      id: t.id,
      kind: "tech",
      label: t.label,
      x: Math.cos(a) * rad,
      y: Math.sin(a) * rad,
      r: 0.013,
      weight: 0.22,
    })
  })

  // constellation names go on the side of the hub with no lines through it
  // (about 360px per unit on a 1440x900 screen once x is stretched)
  for (const n of nodes) if (n.hub) n.side = pickSide(n, hubEnds(n, nodes), ASPECT, 1, (n.label.length * 7.4 + 30) / 360, 30 / 360)
  // pickSide sees lines, not labels: "Home stack" on its right ran into the
  // "Retouch Studio" label next door, so it goes above its star
  for (const n of nodes) if (n.hub && WIDE_SIDE[n.id]) n.side = WIDE_SIDE[n.id]

  // label centre: products to the right of the star, hubs on their side
  const labelX = (n: StarNode) =>
    n.kind === "product" ? n.x + 0.09 : n.hub ? n.x + (n.side === "right" ? 0.07 : n.side === "left" ? -0.07 : 0) : n.x
  const labelY = (n: StarNode) => (n.hub ? n.y + (n.side === "above" ? 0.045 : n.side === "below" ? -0.045 : 0) : n.y)

  // Relax product positions so labels (which sit to the right of each star)
  // do not collide. Work in screen-like space where x is stretched.
  const movable = nodes.filter((n) => n.kind === "product")
  const fixed = nodes.filter((n) => n.kind !== "product")
  for (let iter = 0; iter < 240; iter++) {
    for (const a of movable) {
      let fx = 0
      let fy = 0
      for (const b of [...movable, ...fixed]) {
        if (a === b) continue
        // compare label centres (unlabelled stars: the star itself)
        const labelled = b.kind === "product" || b.hub
        const dx = (labelX(a) - labelX(b)) * ASPECT
        const dy = a.y - labelY(b)
        const d2 = dx * dx + dy * dy * 4
        const min = labelled ? 0.1 : 0.03
        if (d2 < min && d2 > 1e-6) {
          const d = Math.sqrt(d2)
          fx += (dx / d) * (Math.sqrt(min) - d) * 0.12
          fy += (dy / d) * (Math.sqrt(min) - d) * 0.24
        }
      }
      a.x += fx / ASPECT
      a.y += fy
      // keep inside the frame, leaving room on the right for the label
      a.x = Math.max(-0.92, Math.min(0.72, a.x))
      a.y = Math.max(-0.9, Math.min(0.9, a.y))
    }
  }

  for (const n of nodes) {
    n.x = round(n.x)
    n.y = round(n.y)
    n.r = round(n.r)
    n.weight = round(n.weight)
  }

  const ids = new Set(nodes.map((n) => n.id))
  const kindOf = new Map(nodes.map((n) => [n.id, n]))
  const home = new Map(CONSTELLATIONS.flatMap((c) => c.members.map((m) => [m as string, c.theme])))
  const edges: GraphLayout["edges"] = []
  // David to each constellation, not to every product: the tree reads at a glance
  for (const c of CONSTELLATIONS) edges.push({ from: PERSON_ID, to: c.theme, w: 0.9 })
  for (const e of EDGES) {
    if (!ids.has(e.from) || !ids.has(e.to) || e.from === PERSON_ID) continue
    const a = kindOf.get(e.from)!
    const b = kindOf.get(e.to)!
    let w = 0.5
    if (a.kind === "product" && b.kind === "product") w = 1
    else if (b.hub && home.get(e.from) === e.to) w = 0.85
    else if (b.hub) w = 0.4 // a product touching another constellation
    else if (b.kind === "theme") w = 0.16
    else if (b.kind === "tech") w = 0.08
    edges.push({ from: e.from, to: e.to, w })
  }
  return { nodes, edges }
}

/**
 * Portrait-orientation screens (aspect < 0.9, phones): the field is narrow,
 * so labels are wide relative to the sky. Start from the same stars, squeeze
 * them below the section heading, then push labelled stars apart using real
 * label boxes measured in CSS px of a 390x844 screen (engine: graph x scale
 * aspect*0.9, y scale 0.66). Constellation names count as boxes too, on
 * whichever side of their hub star has no lines through it.
 */
function buildPortrait(base: StarNode[]): StarNode[] {
  const nodes = base.map((n) => ({ ...n }))
  const SX = 176 // px per normalized x unit
  const SY = 278 // px per normalized y unit
  const CHAR = 6.3 // px per character at the 12px label size
  const HUB_CHAR = 7.4 // px per character of a 10px uppercase hub name
  const TOP = 0.5 // keep clear of the heading at the top of the screen
  const GAP = 2 // boxes may touch by this much (px)
  for (const n of nodes) {
    n.x = n.x * 0.62 - 0.22
    n.y = n.y * 0.78 - 0.22
  }
  for (const n of nodes) if (n.hub) n.side = pickSide(n, hubEnds(n, nodes), SX, SY, n.label.length * HUB_CHAR + 30, 30)
  const boxes = nodes.filter((n) => n.kind === "product" || n.kind === "person" || n.hub)
  const w = (n: StarNode) => (n.hub ? n.label.length * HUB_CHAR + 8 : n.label.length * CHAR + 16)
  /** label box in px (y up), for the star at (x, y) */
  const rect = (n: StarNode, x = n.x, y = n.y) => {
    const px = x * SX
    const py = y * SY
    if (n.hub) {
      const lw = w(n)
      switch (n.side) {
        case "left":
          return { x0: px - 18 - lw, x1: px + 6, y0: py - 8, y1: py + 8 }
        case "above":
          return { x0: px - lw / 2, x1: px + lw / 2, y0: py + 6, y1: py + 22 }
        case "below":
          return { x0: px - lw / 2, x1: px + lw / 2, y0: py - 22, y1: py - 6 }
        default:
          return { x0: px - 6, x1: px + 18 + lw, y0: py - 8, y1: py + 8 }
      }
    }
    return { x0: px - 8, x1: px + w(n), y0: py - 12, y1: py + 12 }
  }
  const overlap = (a: StarNode, b: StarNode, ax = a.x, ay = a.y) => {
    const ra = rect(a, ax, ay)
    const rb = rect(b)
    return {
      ox: Math.min(ra.x1, rb.x1) - Math.max(ra.x0, rb.x0),
      oy: Math.min(ra.y1, rb.y1) - Math.max(ra.y0, rb.y0),
      dy: (ra.y0 + ra.y1) / 2 - (rb.y0 + rb.y1) / 2,
    }
  }
  const clamp = (n: StarNode) => {
    const r = rect(n)
    if (r.x0 < -0.98 * SX) n.x += (-0.98 * SX - r.x0) / SX
    else if (r.x1 > 0.98 * SX) n.x -= (r.x1 - 0.98 * SX) / SX
    n.y = Math.max(-1, Math.min(TOP, n.y))
  }
  for (let iter = 0; iter < 600; iter++) {
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        const { ox, oy, dy } = overlap(a, b)
        if (ox <= 0 || oy <= GAP) continue
        // separate vertically (there is more room that way), a little sideways
        const sgn = dy === 0 ? (i % 2 ? 1 : -1) : Math.sign(dy)
        const push = (oy / 2 + 0.5) / SY
        const fixedA = a.kind === "person"
        const fixedB = b.kind === "person"
        if (!fixedA) a.y += sgn * push * (fixedB ? 2 : 1)
        if (!fixedB) b.y -= sgn * push * (fixedA ? 2 : 1)
        const side = (Math.min(ox, 12) / SX) * 0.15
        if (!fixedA) a.x += a.x <= b.x ? -side : side
        if (!fixedB) b.x += a.x <= b.x ? side : -side
      }
    }
    // a label must not cover any other star either (sprite radius ~9px)
    for (const a of boxes) {
      if (a.kind === "person") continue
      for (const b of nodes) {
        if (a === b) continue
        const r = rect(a)
        const bx = b.x * SX
        const by = b.y * SY
        if (bx < r.x0 + 4 || bx > r.x1 + 4 || by <= r.y0 - 9 || by >= r.y1 + 9) continue
        const sgn = (r.y0 + r.y1) / 2 >= by ? 1 : -1
        const need = sgn > 0 ? by + 9 - r.y0 : r.y1 - (by - 9)
        a.y += (sgn * (need * 0.5 + 0.5)) / SY
      }
    }
    for (const n of boxes) if (n.kind !== "person") clamp(n)
  }
  // The push-apart above can leave a label wedged between two others (Van
  // Roye between Romandy CTO and David). Settle what is left greedily: move
  // each label that still clashes to the nearest free height.
  const clash = (a: StarNode, b: StarNode, ay = a.y, ax = a.x) => {
    const { ox, oy } = overlap(a, b, ax, ay)
    return ox > 0 && oy > GAP
  }
  for (let pass = 0; pass < 3; pass++) {
    for (const a of boxes) {
      if (a.kind === "person") continue
      const others = boxes.filter((b) => b !== a)
      if (!others.some((b) => clash(a, b))) continue
      let done = false
      for (const dxPx of [0, -14, 14, -28, 28, -42, 42]) {
        const x = a.x + dxPx / SX
        const r = rect(a, x)
        if (r.x0 < -0.98 * SX || r.x1 > 0.98 * SX) continue
        for (let k = 0; k <= 30 && !done; k++) {
          const y = a.y + (Math.ceil(k / 2) * 4 * (k % 2 ? 1 : -1)) / SY
          if (y > TOP || y < -1) continue
          if (others.every((b) => !clash(a, b, y, x))) {
            a.x = x
            a.y = y
            done = true
          }
        }
        if (done) break
      }
    }
  }
  // last pass: pairs still sharing a row (the relaxation can stall on a
  // crowded line) move apart vertically, the lighter star giving way
  for (let iter = 0; iter < 80; iter++) {
    let moved = false
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        if (!clash(a, b)) continue
        const mover = a.kind === "person" ? b : b.kind === "person" ? a : a.weight < b.weight ? a : b
        const other = mover === a ? b : a
        const { oy, dy } = overlap(mover, other)
        const dir = dy >= 0 ? 1 : -1
        const want = mover.y + (dir * (oy - GAP + 0.5)) / SY
        mover.y = Math.max(-1, Math.min(TOP, want))
        if (mover.y !== want) other.y -= (dir * (want - mover.y) * SY) / SY
        moved = true
      }
    }
    if (!moved) break
  }
  for (const n of nodes) {
    n.x = round(n.x)
    n.y = round(n.y)
  }
  return nodes
}

const BUILT = build()

/** Nodes with labels and links, for HTML labels and the SVG fallback. */
export const STAR_NODES: StarNode[] = BUILT.nodes

const strip = (nodes: StarNode[]): GraphLayout["nodes"] => nodes.map(({ id, x, y, r, weight }) => ({ id, x, y, r, weight }))

/** The layout as the particle engine expects it (no extra fields). */
export const GRAPH_LAYOUT: GraphLayout = {
  nodes: strip(BUILT.nodes),
  edges: BUILT.edges,
}

const PORTRAIT_NODES = buildPortrait(BUILT.nodes)

/** Same graph, arranged for portrait-orientation screens. */
export const GRAPH_LAYOUT_PORTRAIT: GraphLayout = {
  nodes: strip(PORTRAIT_NODES),
  edges: BUILT.edges,
}

/** Side of each constellation name, in the wide and the compact layout. */
export const HUB_SIDES: Record<string, { wide: LabelSide; compact: LabelSide }> = Object.fromEntries(
  BUILT.nodes
    .filter((n) => n.hub)
    .map((n) => [n.id, { wide: n.side ?? "right", compact: PORTRAIT_NODES.find((p) => p.id === n.id)?.side ?? "right" }]),
)
