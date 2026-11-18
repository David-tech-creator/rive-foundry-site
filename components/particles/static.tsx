/**
 * Static fallbacks for prefers-reduced-motion / no WebGL. Server components:
 * no hooks, render in the HTML. Both carry .pf-static, so they are hidden
 * automatically once the WebGL field is running (set hideWhenParticles=false
 * to keep them).
 */
import "./particles.css"
import type { GraphLayoutEdge, GraphLayoutNode } from "@/lib/formations/types"
import { lemanMapGeometry } from "@/lib/formations/shapes"

export type StaticPortraitProps = {
  src?: string
  alt?: string
  className?: string
  /** intrinsic size hint for the <img>, default 800 */
  size?: number
  hideWhenParticles?: boolean
  priority?: boolean
}

/** The stippled portrait as a still image, for before (or without) the particle field. */
export function StaticPortrait({
  src = "/portrait/david-stipple.png",
  alt = "Portrait of David Vinkenroye",
  className,
  size = 800,
  hideWhenParticles = true,
  priority = true,
}: StaticPortraitProps) {
  const cls = ["pf-static-portrait", hideWhenParticles ? "pf-static" : "", className ?? ""].filter(Boolean).join(" ")
  return (
    <span className={cls}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </span>
  )
}

export type StaticGraphNode = GraphLayoutNode & {
  label?: string
  /** when set, the node is a link (e.g. /work/<slug>) */
  href?: string
  /** theme labels are hidden on narrow screens and drawn left of their star */
  kind?: "person" | "product" | "theme" | "tech"
}

export type StaticGraphProps = {
  nodes: StaticGraphNode[]
  edges: GraphLayoutEdge[]
  className?: string
  /** accessible name for the SVG */
  title?: string
  hideWhenParticles?: boolean
}

/** SVG star map of the knowledge graph; nodes with href are real links. */
export function StaticGraph({
  nodes,
  edges,
  className,
  title = "Map of David Vinkenroye's products and themes",
  hideWhenParticles = true,
}: StaticGraphProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const cls = ["pf-static-graph", hideWhenParticles ? "pf-static" : "", className ?? ""].filter(Boolean).join(" ")
  // SVG y grows downward; layout y is up
  const sy = (y: number) => -y
  const titleId = "static-graph-title"
  return (
    <svg className={cls} viewBox="-1.25 -1.15 2.5 2.3" role="group" aria-labelledby={titleId} width="100%">
      <title id={titleId}>{title}</title>
      <g stroke="#EDEDEF" strokeOpacity={0.14} strokeWidth={0.003}>
        {edges.map((e) => {
          const a = byId.get(e.from)
          const b = byId.get(e.to)
          if (!a || !b) return null
          return <line key={`${e.from}-${e.to}`} x1={a.x} y1={sy(a.y)} x2={b.x} y2={sy(b.y)} />
        })}
      </g>
      {nodes.map((n) => {
        const r = Math.max(0.008, n.r * 0.6)
        const isTheme = n.kind === "theme"
        const star = (
          <g>
            <circle cx={n.x} cy={sy(n.y)} r={r} fill="#EDEDEF" fillOpacity={0.55 + n.weight * 0.45} />
            {n.label ? (
              <text
                className={isTheme ? "sg-label sg-theme" : "sg-label"}
                x={isTheme ? n.x - r - 0.02 : n.x + r + 0.02}
                y={sy(n.y)}
                textAnchor={isTheme ? "end" : "start"}
                dominantBaseline="middle"
                fontSize={0.042}
                fill={n.href ? "#EDEDEF" : "#8B8A92"}
                stroke="#1F1E22"
                strokeWidth={0.012}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {n.label}
              </text>
            ) : null}
          </g>
        )
        return n.href ? (
          <a key={n.id} href={n.href} aria-label={n.label ?? n.id}>
            {star}
          </a>
        ) : (
          <g key={n.id}>{star}</g>
        )
      })}
    </svg>
  )
}

export type StaticHelixProps = { className?: string; hideWhenParticles?: boolean }

/**
 * Still double helix for the DNA section: two dotted strands and faint rungs
 * on a diagonal. Decorative, so it is hidden from assistive tech.
 */
export function StaticHelix({ className, hideWhenParticles = true }: StaticHelixProps) {
  const cls = ["pf-static-helix", hideWhenParticles ? "pf-static" : "", className ?? ""].filter(Boolean).join(" ")
  const turns = 3
  const half = 160
  const R = 34
  const steps = 96
  const strand = (phase: number) => {
    let d = ""
    for (let i = 0; i <= steps; i++) {
      const x = -half + (i / steps) * half * 2
      const y = Math.cos((x / half) * turns * Math.PI + phase) * R
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`
    }
    return d
  }
  const rungs: string[] = []
  for (let i = 1; i < turns * 6; i++) {
    const x = -half + (i / (turns * 6)) * half * 2
    const y = Math.cos((x / half) * turns * Math.PI) * R
    rungs.push(`M${x.toFixed(1)} ${y.toFixed(1)}V${(-y).toFixed(1)}`)
  }
  return (
    <svg className={cls} viewBox="-200 -200 400 400" aria-hidden="true" focusable="false" width="100%">
      <g transform="rotate(52)" fill="none" stroke="#EDEDEF" strokeLinecap="round">
        <path d={rungs.join("")} strokeOpacity={0.18} strokeWidth={1} />
        <path d={strand(0)} strokeOpacity={0.75} strokeWidth={3.2} strokeDasharray="0.1 6" />
        <path d={strand(Math.PI)} strokeOpacity={0.45} strokeWidth={3.2} strokeDasharray="0.1 6" />
      </g>
    </svg>
  )
}

export type LemanLabelSpec = {
  /** landmark id in LEMAN_MARKS (lib/formations/shapes.ts) */
  id: string
  text: string
  side: "left" | "right" | "above" | "below"
  /** px between the landmark and the label */
  gap: number
  /** the landmark is a star: the gap grows with its radius */
  star?: boolean
  /** left out on phones (with its trail) */
  minor?: boolean
  /** shorter text for phones */
  short?: string
}

/** The landmarks named on the Lac Léman map, in the field and in the static SVG. */
export const LEMAN_LABELS: LemanLabelSpec[] = [
  { id: "gva", text: "GVA airport", short: "GVA", side: "left", gap: 24 },
  { id: "epfl", text: "EPFL", side: "above", gap: 15, star: true },
  { id: "mont-blanc", text: "Mont Blanc", side: "above", gap: 10 },
  { id: "zurich", text: "Zurich, ETH", side: "right", gap: 10, star: true },
  { id: "milan", text: "Milan", side: "below", gap: 10, minor: true },
  { id: "cote-dazur", text: "Côte d'Azur", side: "left", gap: 10, minor: true },
]

/**
 * Quiet labels for the Lac Léman map. With the field running the engine moves
 * each one onto its projected landmark and they fade in with --leman-ready;
 * without it they are hidden (StaticLeman carries its own text). Decorative:
 * the section copy already says all of it.
 */
export function LemanLabels({ className }: { className?: string }) {
  return (
    <ul className={["leman-labels", className ?? ""].filter(Boolean).join(" ")} aria-hidden="true">
      {LEMAN_LABELS.map((l) => (
        <li
          key={l.id}
          data-leman-label={l.id}
          data-side={l.side}
          data-gap={l.gap}
          data-star={l.star ? "" : undefined}
          className={l.minor ? "leman-minor" : undefined}
          style={{ ["--gap" as string]: `${l.gap}px` }}
        >
          <span className="pf-label-inner">
            {l.short ? (
              <>
                <span className="leman-full">{l.text}</span>
                <span className="leman-short">{l.short}</span>
              </>
            ) : (
              l.text
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

export type StaticLemanProps = { className?: string; hideWhenParticles?: boolean }

/**
 * Still version of the Lac Léman map for reduced motion and no WebGL: the
 * dotted lake, Geneva, the runway, EPFL and the trail to Zurich, the two
 * ridges and the directions south, drawn from the same geometry as the field.
 */
export function StaticLeman({ className, hideWhenParticles = true }: StaticLemanProps) {
  const m = lemanMapGeometry()
  const k = 100
  const X = (x: number) => +(x * k).toFixed(1)
  const Y = (y: number) => +(-y * k).toFixed(1)
  const path = (pts: ReadonlyArray<readonly [number, number]>, close = false) =>
    pts.map(([x, y], i) => `${i ? "L" : "M"}${X(x)} ${Y(y)}`).join("") + (close ? "Z" : "")
  const star = ([cx, cy]: readonly [number, number], r: number) => {
    const R = r * k
    const w = R * 0.2
    const x = X(cx)
    const y = Y(cy)
    return `M${x} ${y - R}L${x + w} ${y - w}L${x + R} ${y}L${x + w} ${y + w}L${x} ${y + R}L${x - w} ${y + w}L${x - R} ${y}L${x - w} ${y - w}Z`
  }
  const b = m.bounds
  const pad = { l: 100, r: 70, t: 26, b: 24 }
  const vb = [X(b.minX) - pad.l, Y(b.maxY) - pad.t, (b.maxX - b.minX) * k + pad.l + pad.r, (b.maxY - b.minY) * k + pad.t + pad.b]
  const text = (id: string) => LEMAN_LABELS.find((l) => l.id === id)
  const cls = ["pf-static-leman", hideWhenParticles ? "pf-static" : "", className ?? ""].filter(Boolean).join(" ")
  return (
    <svg
      className={cls}
      viewBox={vb.map((v) => v.toFixed(1)).join(" ")}
      role="img"
      aria-label="Map of Lac Léman: Geneva and its airport at the west end, EPFL in Lausanne, the Alps and Mont Blanc to the south, Zurich to the north-east"
      width="100%"
    >
      <g fill="none" stroke="#EDEDEF" strokeLinecap="round" strokeLinejoin="round">
        <path d={path(m.lake, true)} fill="rgba(237,237,239,0.07)" strokeOpacity={0.85} strokeWidth={2.2} strokeDasharray="0.1 4" />
        {m.ridges.map((r, i) => (
          <path key={i} d={path(r)} strokeOpacity={i ? 0.8 : 0.6} strokeWidth={2} strokeDasharray="0.1 3.5" />
        ))}
        {m.runway.map((e, i) => (
          <path key={i} d={path(e)} strokeOpacity={0.9} strokeWidth={1.8} strokeDasharray="0.1 3" />
        ))}
        {m.trails.map((t, i) => (
          <path
            key={i}
            d={path(t.dots) + (t.head.length ? path(t.head.slice(0, 3)) + path(t.head.slice(3)) : "")}
            strokeOpacity={i ? 0.45 : 0.7}
            strokeWidth={2}
            strokeDasharray="0.1 4.6"
          />
        ))}
      </g>
      <g fill="#EDEDEF">
        {m.stars.map((s, i) => (
          <path key={i} d={star(s, m.starRadius)} />
        ))}
        {m.towns.map((t, i) => (
          <circle key={i} cx={X(t[0])} cy={Y(t[1])} r={2.2} fillOpacity={0.85} />
        ))}
        <circle cx={X(m.montBlanc[0])} cy={Y(m.montBlanc[1])} r={2.4} />
      </g>
      <circle cx={X(m.geneva[0])} cy={Y(m.geneva[1])} r={6} fill="#4DA3FF" />
      <g fill="#8B8A92" fontSize={10} letterSpacing="1.6" style={{ textTransform: "uppercase" }}>
        {m.marks.map((mark) => {
          const l = text(mark.id)
          if (!l) return null
          const x = X(mark.x)
          const y = Y(mark.y)
          const g = l.gap * 0.8 + (l.star ? m.starRadius * k : 0)
          const at =
            l.side === "left"
              ? { x: x - g, y: y + 3.5, anchor: "end" as const }
              : l.side === "above"
                ? { x, y: y - g, anchor: "middle" as const }
                : l.side === "below"
                  ? { x, y: y + g + 8, anchor: "middle" as const }
                  : { x: x + g, y: y + 3.5, anchor: "start" as const }
          return (
            <text key={mark.id} x={at.x} y={at.y} textAnchor={at.anchor}>
              {l.text}
            </text>
          )
        })}
      </g>
    </svg>
  )
}
