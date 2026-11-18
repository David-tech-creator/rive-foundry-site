/**
 * Procedural formations for the Mission log particle field. Every builder
 * writes `count` vec4s (xyz + brightness) into a caller-owned Float32Array so
 * rebuilds (graph, contact on resize) can reuse the same GPU buffer.
 */
import { ACCENT_BRIGHTNESS, FLAG, MAX_GRAPH_NODES, type GraphLayout } from "./types"
import { clamp01, gauss, type Rng } from "./random"
import { stippleImage, type ImageField } from "./image"
import { isCoast, isLand } from "./land-mask"

const TAU = Math.PI * 2

/* ------------------------------------------------------------------ */
/* Per-particle constants                                              */
/* ------------------------------------------------------------------ */

/**
 * aRand: x = phase seed, y = arrival delay (stagger), z = size seed,
 * w = 1 for the azure share of particles, else 0.
 */
export function buildRandoms(out: Float32Array, count: number, rng: Rng, azureShare = 0.16) {
  for (let i = 0; i < count; i++) {
    const o = i * 4
    out[o] = rng()
    out[o + 1] = rng()
    out[o + 2] = 0.55 + Math.pow(rng(), 3) * 1.45
    out[o + 3] = rng() < azureShare ? 1 : 0
  }
}

/** Soft volumetric star field (the resting state), written as vec3 positions. */
export function buildScatter(out: Float32Array, count: number, rng: Rng) {
  for (let i = 0; i < count; i++) {
    const o = i * 3
    if (rng() < 0.26) {
      // a faint diagonal band, like a galaxy seen edge-on
      const t = rng() * 2 - 1
      out[o] = t * 2.8 + gauss(rng) * 0.12
      out[o + 1] = t * 0.55 + gauss(rng) * 0.16
      out[o + 2] = -0.6 - rng() * 2.2
    } else {
      out[o] = (rng() * 2 - 1) * 2.8
      out[o + 1] = (rng() * 2 - 1) * 1.55
      out[o + 2] = 0.35 - Math.pow(rng(), 0.6) * 2.9
    }
  }
}

/* ------------------------------------------------------------------ */
/* Lodestar: the four-point guiding star                               */
/* ------------------------------------------------------------------ */

const starPt = { x: 0, y: 0, order: 0 }

/** One point on the lodestar (radius 1). order 0..1 = when it lights up. */
export function lodestarPoint(rng: Rng) {
  const r = rng()
  if (r < 0.08) {
    // bright core
    const a = rng() * TAU
    const d = Math.abs(gauss(rng)) * 0.06
    starPt.x = Math.cos(a) * d
    starPt.y = Math.sin(a) * d
    starPt.order = 0
    return starPt
  }
  const diagonal = r < 0.22
  const k = (rng() * 4) | 0 // arm index: 0 up, 1 right, 2 down, 3 left
  const theta = Math.PI / 2 - k * (Math.PI / 2) - (diagonal ? Math.PI / 4 : 0)
  const len = diagonal ? 0.36 : 1
  const d = Math.pow(rng(), 0.85)
  const hw = (diagonal ? 0.05 : 0.17) * Math.pow(1 - d, 1.35)
  const onEdge = rng() < 0.45
  const lat = onEdge ? (rng() < 0.5 ? -hw : hw) : (rng() * 2 - 1) * hw
  const along = d * len
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  starPt.x = c * along - s * lat
  starPt.y = s * along + c * lat
  starPt.order = clamp01((k + d) / 4)
  return starPt
}

/* ------------------------------------------------------------------ */
/* Helmet: the site's mark (components/site/helmet-mark.tsx)            */
/* ------------------------------------------------------------------ */

/** inside the visor pill: x 4.8..19.2, y 6.2..14.6 on the 24-unit grid */
const inVisor = (X: number, Y: number) => {
  const cx = Math.min(15, Math.max(9, X))
  return (X - cx) ** 2 + (Y - 10.4) ** 2 <= 4.2 * 4.2
}

/**
 * One point on the helmet mark (radius about 1, y up): the shell with the
 * visor cut out, crisp outlines, the glint and the neck ring.
 * order 0..1 = when it lights up (bottom first, like it is filling up).
 */
export function helmetPoint(rng: Rng) {
  let X = 12
  let Y = 10.5
  const r = rng()
  if (r < 0.6) {
    // shell
    for (let t = 0; t < 40; t++) {
      X = 2.5 + rng() * 19
      Y = 1 + rng() * 19
      if ((X - 12) ** 2 + (Y - 10.5) ** 2 <= 9.5 * 9.5 && !inVisor(X, Y)) break
    }
  } else if (r < 0.78) {
    // outer edge, so the silhouette stays crisp
    const a = rng() * TAU
    const d = 9.5 - Math.abs(gauss(rng)) * 0.12
    X = 12 + Math.cos(a) * d
    Y = 10.5 + Math.sin(a) * d
  } else if (r < 0.89) {
    // visor edge
    const d = 4.2 + Math.abs(gauss(rng)) * 0.12
    if (rng() < 0.42) {
      X = 9 + rng() * 6
      Y = rng() < 0.5 ? 10.4 - d : 10.4 + d
    } else {
      const a = rng() * Math.PI - Math.PI / 2
      const right = rng() < 0.5
      X = (right ? 15 : 9) + Math.cos(a) * d * (right ? 1 : -1)
      Y = 10.4 + Math.sin(a) * d
    }
  } else if (r < 0.96) {
    // neck ring
    X = 6.6 + rng() * 10.8
    Y = 20.9 + rng() * 2.1
  } else {
    // glint
    X = 8.2 + rng() * 2.4
    Y = 8.2 + rng() * 1.5
  }
  starPt.x = (X - 12) / 11
  starPt.y = (12 - Y) / 11
  starPt.order = clamp01((23 - Y) / 22)
  return starPt
}

/**
 * Preloader helmet. Only a share of particles join it; the rest keep w = -1
 * (the shader leaves them in the star field). w = order in which arms fill.
 */
export function buildStar(out: Float32Array, count: number, rng: Rng, share = 0.2) {
  for (let i = 0; i < count; i++) {
    const o = i * 4
    if (rng() < share) {
      const p = helmetPoint(rng)
      out[o] = p.x
      out[o + 1] = p.y
      out[o + 2] = gauss(rng) * 0.02
      out[o + 3] = p.order
    } else {
      out[o] = 0
      out[o + 1] = 0
      out[o + 2] = 0
      out[o + 3] = -1
    }
  }
}

/* ------------------------------------------------------------------ */
/* Image formations                                                    */
/* ------------------------------------------------------------------ */

/** Astronaut bust: same framing as the portrait, visor catches azure. */
export function buildAstronautBust(out: Float32Array, count: number, rng: Rng, field: ImageField) {
  stippleImage(field, out, 0, count, rng, {
    floor: 0.06,
    gamma: 1.3,
    edgeGain: 1.6,
    depth: 0.16,
    brightBase: 0.32,
    brightGain: 1.05,
  })
}

/** Full-body floating astronaut, plus loose dust drifting around it. */
export function buildAstronautFloat(out: Float32Array, count: number, rng: Rng, field: ImageField) {
  const body = Math.floor(count * 0.82)
  // shaded like the bust (visor, seams, joint rings and folds come from the
  // luminance render), so it reads as an astronaut and not a silhouette
  stippleImage(field, out, 0, body, rng, {
    floor: 0.06,
    gamma: 1.35,
    edgeGain: 1.7,
    depth: 0.14,
    brightBase: 0.3,
    brightGain: 1.05,
  })
  for (let i = body; i < count; i++) {
    const o = i * 4
    const a = rng() * TAU
    const d = 0.9 + Math.abs(gauss(rng)) * 0.7
    out[o] = Math.cos(a) * d
    out[o + 1] = Math.sin(a) * d * 0.8
    out[o + 2] = gauss(rng) * 0.4
    out[o + 3] = 0.18 + rng() * 0.2
  }
}

/* ------------------------------------------------------------------ */
/* Globe with Geneva                                                   */
/* ------------------------------------------------------------------ */

const GENEVA_LAT = (46.2 * Math.PI) / 180
/** The globe is turned so Geneva (6.14°E) sits at lon 0, facing the viewer. */
const GENEVA_LON_DEG = 6.14

/**
 * Unit globe in "earth" coordinates with Geneva's meridian facing +z; the
 * shader spins it a little around the polar axis and tilts it so Geneva faces
 * the camera. Globe particles keep w < 2; the small floating astronaut that
 * drifts beside it is flagged (w >= 2) so it does not spin.
 */
export function buildGlobe(out: Float32Array, count: number, rng: Rng, float: ImageField | null) {
  const astro = float ? Math.floor(count * 0.14) : 0
  const globe = count - astro
  for (let i = 0; i < globe; i++) {
    const o = i * 4
    const r = rng()
    let lat: number
    let lon: number
    let rad = 1
    let b = 0.42
    if (r < 0.06) {
      // Geneva cluster: tight and bright
      lat = GENEVA_LAT + gauss(rng) * 0.018
      lon = gauss(rng) * 0.024
      b = ACCENT_BRIGHTNESS + 0.15 + rng() * 0.2
      rad = 1.004
    } else if (r < 0.14) {
      // graticule: parallels and meridians every 30 degrees, faint
      if (rng() < 0.5) {
        lat = (Math.round((rng() * 150 - 75) / 30) * 30 * Math.PI) / 180
        lon = rng() * TAU
      } else {
        lon = (Math.round(rng() * 11) * 30 * Math.PI) / 180
        lat = Math.asin(rng() * 2 - 1)
      }
      lat += gauss(rng) * 0.003
      b = 0.3
    } else if (r < 0.18) {
      // thin atmosphere rim
      lat = Math.asin(rng() * 2 - 1)
      lon = rng() * TAU
      rad = 1.03 + Math.abs(gauss(rng)) * 0.05
      b = 0.2
    } else if (r < 0.8) {
      // continents (Natural Earth land mask), coastlines brighter so the shapes read
      lat = 0
      lon = 0
      for (let k = 0; k < 40; k++) {
        lat = Math.asin(rng() * 2 - 1)
        lon = rng() * TAU
        if (isLand((lat * 180) / Math.PI, (lon * 180) / Math.PI + GENEVA_LON_DEG)) break
      }
      const coast = isCoast((lat * 180) / Math.PI, (lon * 180) / Math.PI + GENEVA_LON_DEG)
      b = coast ? 0.72 + rng() * 0.15 : 0.4 + rng() * 0.2
    } else {
      // open sea: sparse and dim
      lat = Math.asin(rng() * 2 - 1)
      lon = rng() * TAU
      b = 0.05 + rng() * 0.07
    }
    const cl = Math.cos(lat)
    out[o] = cl * Math.sin(lon) * rad
    out[o + 1] = Math.sin(lat) * rad
    out[o + 2] = cl * Math.cos(lon) * rad
    out[o + 3] = b
  }
  if (float && astro > 0) {
    stippleImage(float, out, globe, count, rng, {
      floor: 0.08,
      gamma: 1.3,
      edgeGain: 1.7,
      depth: 0.06,
      brightBase: 0.32,
      brightGain: 1.0,
      scale: 0.42,
      ox: -1.75,
      oy: 0.62,
      wOffset: FLAG,
    })
  }
}

/* ------------------------------------------------------------------ */
/* Lac Léman                                                           */
/* ------------------------------------------------------------------ */

/**
 * Lake Geneva shoreline, hand-traced as [lon, lat] pairs: north shore west to
 * east (Geneva, Nyon, Lausanne, Montreux), then the south shore back east to
 * west (Le Bouveret, Évian, Thonon, Yvoire, Hermance).
 */
const LEMAN_LONLAT: ReadonlyArray<readonly [number, number]> = [
  [6.146, 46.204], [6.15, 46.22], [6.16, 46.245], [6.165, 46.268], [6.18, 46.29],
  [6.205, 46.32], [6.232, 46.355], [6.245, 46.38], [6.275, 46.405], [6.315, 46.44],
  [6.338, 46.458], [6.38, 46.475], [6.44, 46.495], [6.497, 46.507], [6.555, 46.515],
  [6.61, 46.512], [6.64, 46.507], [6.69, 46.497], [6.745, 46.478], [6.8, 46.462],
  [6.845, 46.458], [6.88, 46.445], [6.91, 46.425], [6.925, 46.405], [6.935, 46.392],
  [6.9, 46.385], [6.86, 46.385], [6.808, 46.388], [6.75, 46.393], [6.68, 46.4],
  [6.59, 46.405], [6.53, 46.392], [6.48, 46.378], [6.42, 46.375], [6.36, 46.368],
  [6.32, 46.365], [6.285, 46.345], [6.255, 46.315], [6.225, 46.282], [6.195, 46.25],
  [6.17, 46.222], [6.155, 46.207],
]

const LON0 = 6.54
const LAT0 = 46.36
const KX = Math.cos((LAT0 * Math.PI) / 180)
const LEMAN_SCALE = 1 / ((6.935 - LON0) * KX)

function toLeman(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * KX * LEMAN_SCALE, (lat - LAT0) * LEMAN_SCALE]
}

/** Normalized polyline: x in [-1, 1], y roughly [-0.6, 0.6]. */
export const LEMAN: ReadonlyArray<readonly [number, number]> = LEMAN_LONLAT.map(([lon, lat]) => toLeman(lon, lat))

function insidePolygon(x: number, y: number, poly: ReadonlyArray<readonly [number, number]>) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

type Pt = readonly [number, number]

/** Tiny deterministic hash (0..1), so the ridges are the same in the field and the static SVG. */
function hash01(n: number) {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

type Peak = { x: number; h: number; w: number }

/** Piecewise linear y(x) through knots sorted by x. */
function lineThrough(knots: ReadonlyArray<Pt>) {
  return (x: number) => {
    if (x <= knots[0][0]) return knots[0][1]
    for (let i = 1; i < knots.length; i++) {
      const [xa, ya] = knots[i - 1]
      const [xb, yb] = knots[i]
      if (x <= xb) return ya + ((yb - ya) * (x - xa)) / (xb - xa)
    }
    return knots[knots.length - 1][1]
  }
}

/**
 * A mountain silhouette: a zigzag of summits and cols over a base line that
 * follows the range. Named peaks are knots of their own (height h above the
 * base); the knots between them take a share of the envelope, so the line
 * stays jagged but never tops a named peak nearby. Ends sit on the base.
 */
function silhouette(baseKnots: ReadonlyArray<Pt>, peaks: Peak[], seed: number): Pt[] {
  const base = lineThrough(baseKnots)
  const x0 = baseKnots[0][0]
  const x1 = baseKnots[baseKnots.length - 1][0]
  const env = (x: number) => {
    let e = 0
    for (const p of peaks) e = Math.max(e, p.h * Math.pow(Math.max(0, 1 - Math.abs(x - p.x) / p.w), 1.15))
    return e
  }
  const knots: Pt[] = peaks.map((p) => [p.x, base(p.x) + p.h] as const)
  const n = Math.max(2, Math.round((x1 - x0) / 0.036))
  for (let i = 0; i <= n; i++) {
    const edge = i === 0 || i === n
    const x = x0 + ((x1 - x0) * i) / n + (edge ? 0 : (hash01(seed + i) - 0.5) * 0.014)
    if (peaks.some((p) => Math.abs(p.x - x) < 0.024)) continue
    const share = i % 2 ? 0.5 + 0.2 * hash01(seed + i * 7.3) : 0.74 + 0.2 * hash01(seed + i * 3.1)
    knots.push([x, edge ? base(x) : base(x) + env(x) * share])
  }
  return knots.sort((p, q) => p[0] - q[0])
}

function polyLength(pts: ReadonlyArray<Pt>) {
  let l = 0
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return l
}

/** Point at arc length d along a polyline. */
function alongPoly(pts: ReadonlyArray<Pt>, d: number): Pt {
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (d <= l || i === pts.length - 1) {
      const t = l > 0 ? Math.min(1, d / l) : 0
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]
    }
    d -= l
  }
  return pts[pts.length - 1]
}

/** Unit vector of the true direction from one [lon, lat] to another, in map space. */
function heading(from: Pt, to: Pt): Pt {
  const dx = (to[0] - from[0]) * KX
  const dy = to[1] - from[1]
  const l = Math.hypot(dx, dy)
  return [dx / l, dy / l]
}

/** A dotted trail: evenly spaced dot centres from a to b. */
function dots(a: Pt, b: Pt, spacing: number): Pt[] {
  const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / spacing))
  const out: Pt[] = []
  for (let i = 0; i <= n; i++) out.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n])
  return out
}

/** Two short dotted strokes folding back from the tip of a trail. */
function chevron(tip: Pt, dir: Pt, len: number): Pt[] {
  const out: Pt[] = []
  for (const turn of [2.5, -2.5]) {
    const c = Math.cos(turn)
    const s = Math.sin(turn)
    const d: Pt = [dir[0] * c - dir[1] * s, dir[0] * s + dir[1] * c]
    for (let i = 1; i <= 3; i++) out.push([tip[0] + (d[0] * len * i) / 3, tip[1] + (d[1] * len * i) / 3])
  }
  return out
}

/*
 * The landmarks around the lake, placed from real [lon, lat] with the lake's
 * own projection (1 unit = about 30 km): Geneva airport just north-west of
 * the Geneva tip, EPFL on the shore at the west edge of Lausanne. The lake is
 * the hero, so what lies further out is drawn compactly instead of to scale:
 * the Alps as one ridge along the south shore, and Zurich, Milan and the Côte
 * d'Azur as short dotted trails on their true bearings.
 */
const GENEVA_LL: Pt = [6.148, 46.206]
const EPFL_LL: Pt = [6.5668, 46.5191]
const GVA_LL: Pt = [6.1092, 46.2381]
const ETH_LL: Pt = [8.5476, 47.3763]
const MILAN_LL: Pt = [9.19, 45.4642]
const NICE_LL: Pt = [7.262, 43.7034]
const RHONE_LL: Pt = [6.95, 46.36] // just past the east end, where the valley leaves for the Simplon

/** Mountain height in map units for a summit in metres, a little exaggerated
 *  so the ranges read as mountains (Mont Blanc's own height comes from its
 *  true summit position). */
const alt = (m: number) => (m / 4808) * 0.3

const LEMAN_GEO = (() => {
  const geneva = toLeman(...GENEVA_LL)
  const epfl = toLeman(...EPFL_LL)
  const gva = toLeman(...GVA_LL)
  const lx = (lon: number) => toLeman(lon, LAT0)[0]

  // runway 04/22: 3.9 km on a true heading of about 45 degrees, drawn a
  // little longer than scale so it reads as a runway
  const rwDir: Pt = [Math.SQRT1_2, Math.SQRT1_2]
  const rwLen = 0.17
  const rwHalfW = 0.016

  // The Alps as one ridge just south of the lake and along it, drawn
  // schematically so the map stays compact: Mont Blanc (really 70 km out)
  // is pulled in as the tallest, brightest peak near the south-west end,
  // south-east of Geneva; the Chablais peaks follow the south shore to the
  // Dents du Midi at the east end, each at its own longitude.
  const montBlancX = -0.36
  const front = silhouette(
    [
      [-0.78, -0.74],
      [-0.25, -0.6],
      [1.05, -0.3],
    ],
    [
      { x: montBlancX, h: 0.23, w: 0.26 }, // Mont Blanc
      { x: lx(6.46), h: alt(1863) * 0.7, w: 0.16 }, // Le Môle
      { x: lx(6.61), h: alt(2244) * 0.9, w: 0.18 }, // Roc d'Enfer
      { x: lx(6.7295), h: alt(2222) * 0.9, w: 0.14 }, // Dent d'Oche
      { x: lx(6.787), h: alt(2432) * 0.9, w: 0.15 }, // Cornettes de Bise
      { x: lx(6.923), h: alt(3257) * 0.9, w: 0.2 }, // Dents du Midi
    ],
    17,
  )
  const montBlanc = front.find((p) => p[0] === montBlancX) as Pt

  // Zurich, 220 km away: a short dotted trail from EPFL on the true bearing
  const toZurich = heading(EPFL_LL, ETH_LL)
  const zurich: Pt = [epfl[0] + toZurich[0] * 0.46, epfl[1] + toZurich[1] * 0.46]
  const zurichTrail = dots(
    [epfl[0] + toZurich[0] * 0.14, epfl[1] + toZurich[1] * 0.14],
    [epfl[0] + toZurich[0] * 0.39, epfl[1] + toZurich[1] * 0.39],
    0.045,
  )

  // the two directions south: short stubs on their true bearings, leaving
  // the map from the east end of the ridge (Milan) and from Geneva (Nice)
  const toMilan = heading(RHONE_LL, MILAN_LL)
  const milanFrom: Pt = [0.88, -0.47]
  const milanTip: Pt = [milanFrom[0] + toMilan[0] * 0.2, milanFrom[1] + toMilan[1] * 0.2]
  const milanTrail = dots(milanFrom, milanTip, 0.045)

  const toNice = heading(GENEVA_LL, NICE_LL)
  const coteTip: Pt = [geneva[0] + toNice[0] * 0.34, geneva[1] + toNice[1] * 0.34]
  const coteTrail = dots([geneva[0] + toNice[0] * 0.14, geneva[1] + toNice[1] * 0.14], coteTip, 0.045)

  return {
    geneva,
    lausanne: toLeman(6.632, 46.512),
    montreux: toLeman(6.91, 46.433),
    epfl,
    gva,
    rwDir,
    rwLen,
    rwHalfW,
    front,
    montBlanc,
    zurich,
    zurichTrail,
    milan: { tip: milanTip, dir: toMilan, trail: milanTrail, head: chevron(milanTip, toMilan, 0.05) },
    cote: { tip: coteTip, dir: toNice, trail: coteTrail, head: chevron(coteTip, toNice, 0.05) },
  }
})()

/** Radius of the small four-point stars (EPFL, ETH), in map units. */
export const LEMAN_STAR = 0.048
const MAP_STAR = LEMAN_STAR

/**
 * Where the map's labels sit, in the formation's local space. `minor` ones
 * (the two directions south) are left out on phones, and so are their trails.
 */
export const LEMAN_MARKS: ReadonlyArray<{ id: string; x: number; y: number; minor?: boolean }> = [
  // the airport label hangs off the runway's north-east end
  {
    id: "gva",
    x: LEMAN_GEO.gva[0] + (LEMAN_GEO.rwDir[0] * LEMAN_GEO.rwLen) / 2,
    y: LEMAN_GEO.gva[1] + (LEMAN_GEO.rwDir[1] * LEMAN_GEO.rwLen) / 2,
  },
  { id: "epfl", x: LEMAN_GEO.epfl[0], y: LEMAN_GEO.epfl[1] },
  { id: "mont-blanc", x: LEMAN_GEO.montBlanc[0], y: LEMAN_GEO.montBlanc[1] },
  { id: "zurich", x: LEMAN_GEO.zurich[0], y: LEMAN_GEO.zurich[1] },
  { id: "milan", x: LEMAN_GEO.milan.tip[0], y: LEMAN_GEO.milan.tip[1], minor: true },
  { id: "cote-dazur", x: LEMAN_GEO.cote.tip[0], y: LEMAN_GEO.cote.tip[1], minor: true },
]

/** Local extent of the whole map (lake, landmarks, ridges, trails), for fitting it on screen. */
export function lemanBounds(directions: boolean) {
  const g = LEMAN_GEO
  const pts: Pt[] = [...LEMAN, ...g.front, ...g.zurichTrail, g.gva, g.geneva]
  pts.push([g.zurich[0] + MAP_STAR, g.zurich[1] + MAP_STAR], [g.epfl[0], g.epfl[1] + MAP_STAR])
  pts.push([g.gva[0] - g.rwLen / 2 - 0.02, g.gva[1] - g.rwLen / 2])
  if (directions) pts.push(...g.milan.trail, ...g.milan.head, ...g.cote.trail, ...g.cote.head)
  const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  for (const [x, y] of pts) {
    b.minX = Math.min(b.minX, x)
    b.maxX = Math.max(b.maxX, x)
    b.minY = Math.min(b.minY, y)
    b.maxY = Math.max(b.maxY, y)
  }
  b.minY -= 0.03 // the haze under the ridge
  return b
}

/** Plain geometry of the map for the static SVG fallback (local space, y up). */
export function lemanMapGeometry() {
  const g = LEMAN_GEO
  const [dx, dy] = g.rwDir
  const h = g.rwLen / 2
  const w = g.rwHalfW
  const edge = (side: number): [Pt, Pt] => [
    [g.gva[0] - dx * h - dy * w * side, g.gva[1] - dy * h + dx * w * side],
    [g.gva[0] + dx * h - dy * w * side, g.gva[1] + dy * h + dx * w * side],
  ]
  return {
    lake: LEMAN,
    geneva: g.geneva,
    towns: [g.lausanne, g.montreux],
    runway: [edge(1), edge(-1)],
    stars: [g.epfl, g.zurich],
    starRadius: MAP_STAR,
    ridges: [g.front],
    montBlanc: g.montBlanc,
    trails: [
      { dots: g.zurichTrail, head: [] as Pt[] },
      { dots: g.milan.trail, head: g.milan.head },
      { dots: g.cote.trail, head: g.cote.head },
    ],
    marks: LEMAN_MARKS,
    bounds: lemanBounds(true),
  }
}

/**
 * Lac Léman as a small map: the stippled lake with Geneva bright at its
 * western tip, the airport runway, EPFL and a dotted trail to Zurich and ETH,
 * the Alps as one ridge along the south shore with Mont Blanc on it, and
 * (with `directions`) two faint trails towards Milan and the Côte d'Azur.
 * `thin` (0..1) is the share of lake and Geneva particles that stay lit: a
 * map drawn small on screen keeps its outline crisp with fewer of them (the
 * rest get brightness 0 and are invisible).
 */
export function buildLeman(out: Float32Array, count: number, rng: Rng, directions = true, thin = 1) {
  const poly = LEMAN
  const g = LEMAN_GEO
  const n = poly.length
  const segLen: number[] = []
  let perim = 0
  for (let i = 0; i < n; i++) {
    const [x0, y0] = poly[i]
    const [x1, y1] = poly[(i + 1) % n]
    const l = Math.hypot(x1 - x0, y1 - y0)
    segLen.push(l)
    perim += l
  }
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [x, y] of poly) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  const frontLen = polyLength(g.front)
  const [rdx, rdy] = g.rwDir
  // shares of the particles, in order; the water takes what is left
  const SHORE = 0.25
  const GENEVA = 0.06
  const TOWNS = 0.028
  const RUNWAY = 0.022
  const STARS = 0.03
  const TRAIL = 0.012
  const FRONT = 0.1
  const DIRS = directions ? 0.01 : 0
  const cut: number[] = []
  let acc = 0
  for (const share of [SHORE, GENEVA, TOWNS, RUNWAY, STARS, TRAIL, FRONT, DIRS]) cut.push((acc += share))
  const jitter = () => gauss(rng) * 0.0028
  const dot = (pts: ReadonlyArray<Pt>) => pts[Math.min(pts.length - 1, (rng() * pts.length) | 0)]

  for (let i = 0; i < count; i++) {
    const o = i * 4
    const r = rng()
    let x: number
    let y: number
    let z = gauss(rng) * 0.015
    let b: number
    if (r < cut[0]) {
      // shoreline, walked by arc length
      let d = rng() * perim
      let s = 0
      while (s < n - 1 && d > segLen[s]) d -= segLen[s++]
      const t = d / segLen[s]
      const [x0, y0] = poly[s]
      const [x1, y1] = poly[(s + 1) % n]
      x = x0 + (x1 - x0) * t + gauss(rng) * 0.006
      y = y0 + (y1 - y0) * t + gauss(rng) * 0.006
      b = rng() < thin ? 0.75 + rng() * 0.25 : 0
    } else if (r < cut[1]) {
      // Geneva, at the western tip
      x = g.geneva[0] + gauss(rng) * 0.018
      y = g.geneva[1] + gauss(rng) * 0.018
      b = rng() < 0.4 + 0.6 * thin ? ACCENT_BRIGHTNESS + 0.2 + rng() * 0.2 : 0
    } else if (r < cut[2]) {
      // two quieter shore towns for scale
      const c = rng() < 0.6 ? g.lausanne : g.montreux
      x = c[0] + gauss(rng) * 0.011
      y = c[1] + gauss(rng) * 0.011
      b = 0.85
    } else if (r < cut[3]) {
      // the runway: two rows of edge lights and a dashed centre line
      const q = rng()
      const along = (Math.round(rng() * 14) / 14 - 0.5) * g.rwLen
      const side = q < 0.4 ? 1 : q < 0.8 ? -1 : 0
      const across = side * g.rwHalfW
      if (side === 0 && Math.round((along / g.rwLen + 0.5) * 14) % 2) {
        // centre line dashes on every other light only
        x = g.gva[0] + rdx * along * 0.9
        y = g.gva[1] + rdy * along * 0.9
      } else {
        x = g.gva[0] + rdx * along - rdy * across
        y = g.gva[1] + rdy * along + rdx * across
      }
      x += jitter()
      y += jitter()
      b = side === 0 ? 0.55 : 0.95
      z = 0
    } else if (r < cut[4]) {
      // EPFL and ETH: small four-point stars
      const c = rng() < 0.55 ? g.epfl : g.zurich
      const p = lodestarPoint(rng)
      x = c[0] + p.x * MAP_STAR
      y = c[1] + p.y * MAP_STAR
      b = 0.95 + 0.15 * (1 - p.order * 0.5)
      z = 0
    } else if (r < cut[5]) {
      // dotted trail from EPFL towards Zurich, fading as it leaves
      const k = (rng() * g.zurichTrail.length) | 0
      const p = g.zurichTrail[k]
      x = p[0] + jitter()
      y = p[1] + jitter()
      b = 0.85 - (0.35 * k) / g.zurichTrail.length
      z = 0
    } else if (r < cut[6]) {
      // the ridge: a crisp stippled crest with a little haze under it,
      // Mont Blanc a touch brighter than the rest
      const [px, py] = alongPoly(g.front, rng() * frontLen)
      const haze = rng() < 0.22
      x = px + gauss(rng) * 0.003
      y = py + (haze ? -Math.abs(gauss(rng)) * 0.04 : gauss(rng) * 0.003)
      b = haze ? 0.18 + rng() * 0.12 : 0.62 + rng() * 0.2
      if (!haze) {
        const near = Math.hypot(px - g.montBlanc[0], py - g.montBlanc[1])
        if (near < 0.14) b += 0.4 * (1 - near / 0.14)
      }
      z = haze ? -0.02 : 0
    } else if (r < cut[7]) {
      // faint direction trails, each with an arrowhead
      const t = rng() < 0.5 ? g.milan : g.cote
      const p = rng() < 0.72 ? dot(t.trail) : dot(t.head)
      x = p[0] + jitter()
      y = p[1] + jitter()
      b = 0.5
      z = 0
    } else {
      // water surface
      let tries = 0
      do {
        x = minX + rng() * (maxX - minX)
        y = minY + rng() * (maxY - minY)
      } while (!insidePolygon(x, y, poly) && ++tries < 40)
      b = rng() < thin ? 0.22 + rng() * 0.22 : 0
      z -= 0.03
    }
    out[o] = x
    out[o + 1] = y
    out[o + 2] = z
    out[o + 3] = b
  }
}

/* ------------------------------------------------------------------ */
/* Constellation graph                                                 */
/* ------------------------------------------------------------------ */

export type GraphBuild = {
  /** node world positions (xyz) for the uNodes uniform, MAX_GRAPH_NODES long */
  nodes: Float32Array
  ids: string[]
  count: number
}

/**
 * Builds the star map. Positions are written in WORLD space (graph nodes in
 * -1..1 are stretched by sx/sy), because node discs must stay round on any
 * aspect. Writes `edges` (vec4 per particle): from index, to index, t, kind
 * (0 sky, 1 node disc, 2 strand). Strands run from the outer node to the node
 * nearer the centre, so the shader can make them flow inward.
 */
export function buildGraph(
  out: Float32Array,
  edges: Float32Array,
  count: number,
  rng: Rng,
  layout: GraphLayout | null,
  sx: number,
  sy: number,
  nodesOut?: Float32Array,
): GraphBuild {
  const nodeWorld = nodesOut ?? new Float32Array(MAX_GRAPH_NODES * 3)
  nodeWorld.fill(0)
  const list = layout ? layout.nodes.slice(0, MAX_GRAPH_NODES) : []
  const ids = list.map((n) => n.id)
  const index = new Map<string, number>()
  list.forEach((n, i) => {
    index.set(n.id, i)
    nodeWorld[i * 3] = n.x * sx
    nodeWorld[i * 3 + 1] = n.y * sy
    nodeWorld[i * 3 + 2] = 0
  })
  // [outer node, inner node, length, strength 0..1]
  const links: Array<[number, number, number, number]> = []
  if (layout) {
    for (const e of layout.edges) {
      const a = index.get(e.from)
      const b = index.get(e.to)
      if (a === undefined || b === undefined || a === b) continue
      const ax = nodeWorld[a * 3]
      const ay = nodeWorld[a * 3 + 1]
      const bx = nodeWorld[b * 3]
      const by = nodeWorld[b * 3 + 1]
      // flow toward the centre: from = outer node
      const outerFirst = ax * ax + ay * ay >= bx * bx + by * by
      const len = Math.hypot(bx - ax, by - ay)
      const w = Math.max(0, Math.min(1, e.w ?? 0.5))
      links.push(outerFirst ? [a, b, len, w] : [b, a, len, w])
    }
  }

  let topWeight = -1
  let topNode = -1
  list.forEach((n, i) => {
    if (n.weight > topWeight) {
      topWeight = n.weight
      topNode = i
    }
  })

  const skyShare = list.length ? 0.1 : 1
  const strandShare = links.length ? 0.38 : 0
  const nSky = Math.floor(count * skyShare)
  const nStrand = Math.floor(count * strandShare)
  const nDisc = count - nSky - nStrand

  // node disc cumulative weights
  const discCdf: number[] = []
  let acc = 0
  for (const n of list) {
    acc += Math.pow(Math.max(0.004, n.r), 1.2) * (0.5 + n.weight)
    discCdf.push(acc)
  }
  const linkCdf: number[] = []
  let lacc = 0
  for (const l of links) {
    // strong links get many more particles per unit of length than faint ones
    lacc += Math.max(0.02, l[2]) * (0.06 + l[3] * l[3] * 1.6)
    linkCdf.push(lacc)
  }
  const pick = (cdf: number[], total: number) => {
    const t = rng() * total
    let lo = 0
    let hi = cdf.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (cdf[mid] < t) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  const unit = Math.min(sx, sy)
  let p = 0
  for (; p < nDisc && list.length; p++) {
    const i = pick(discCdf, acc)
    const n = list[i]
    const R = Math.max(0.006, n.r * unit)
    const a = rng() * TAU
    const halo = rng() < 0.16
    const d = halo ? R * (1 + gauss(rng) * 0.04) : R * Math.min(1, Math.abs(gauss(rng)) * 0.45)
    const o = p * 4
    out[o] = nodeWorld[i * 3] + Math.cos(a) * d
    out[o + 1] = nodeWorld[i * 3 + 1] + Math.sin(a) * d
    out[o + 2] = gauss(rng) * 0.01
    const core = 1 - d / R
    let b = 0.45 + n.weight * 0.55 + core * 0.45
    if (halo) b = 0.35 + n.weight * 0.3
    if (i === topNode && core > 0.55) b = ACCENT_BRIGHTNESS + 0.2
    out[o + 3] = b
    edges[o] = i
    edges[o + 1] = i
    edges[o + 2] = 0
    edges[o + 3] = 1
  }
  for (let s = 0; s < nStrand; s++, p++) {
    const l = links[pick(linkCdf, lacc)]
    const t = rng()
    const [a, b, , w] = l
    const o = p * 4
    out[o] = nodeWorld[a * 3] + (nodeWorld[b * 3] - nodeWorld[a * 3]) * t
    out[o + 1] = nodeWorld[a * 3 + 1] + (nodeWorld[b * 3 + 1] - nodeWorld[a * 3 + 1]) * t
    out[o + 2] = 0
    out[o + 3] = 0.16 + w * 0.5 + rng() * 0.18
    edges[o] = a
    edges[o + 1] = b
    edges[o + 2] = t
    edges[o + 3] = 2
  }
  for (; p < count; p++) {
    // faint background sky gives the map depth
    const o = p * 4
    out[o] = (rng() * 2 - 1) * (sx + 0.3)
    out[o + 1] = (rng() * 2 - 1) * (sy + 0.3)
    out[o + 2] = -0.3 - rng() * 1.6
    out[o + 3] = 0.12 + Math.pow(rng(), 4) * 0.5
    edges[o] = -1
    edges[o + 1] = -1
    edges[o + 2] = 0
    edges[o + 3] = 0
  }
  return { nodes: nodeWorld, ids, count: list.length }
}

/** Fills the edge attribute with "not a graph particle". */
export function clearEdges(edges: Float32Array, count: number) {
  for (let i = 0; i < count; i++) {
    const o = i * 4
    edges[o] = -1
    edges[o + 1] = -1
    edges[o + 2] = 0
    edges[o + 3] = 0
  }
}

/* ------------------------------------------------------------------ */
/* DNA double helix                                                    */
/* ------------------------------------------------------------------ */

/** Turns along the helix. Whole turns, so the shader can wrap it seamlessly. */
export const HELIX_TURNS = 4
/** Strand radius in local units (the axis runs from -1 to 1). */
export const HELIX_RADIUS = 0.16
/** Base pairs per turn. */
const HELIX_RUNGS_PER_TURN = 9

/**
 * Cylindrical coordinates, so the shader can twist, turn and slide it:
 * x = position along the axis (-1..1), y = angle offset, z = signed distance
 * from the axis (negative = the far side of a rung), w = brightness. The
 * shader adds the twist (x * HELIX_TURNS * TAU) and the scroll spin, then
 * lays the axis diagonally across the screen.
 */
export function buildHelix(out: Float32Array, count: number, rng: Rng) {
  const R = HELIX_RADIUS
  const rungs = HELIX_TURNS * HELIX_RUNGS_PER_TURN
  const rungU = (k: number) => -1 + ((k + 0.5) / rungs) * 2
  for (let i = 0; i < count; i++) {
    const o = i * 4
    const r = rng()
    let u: number
    let a: number
    let d: number
    let b: number
    if (r < 0.6) {
      // the two backbones: soft stippled tubes
      u = rng() * 2 - 1
      a = rng() < 0.5 ? 0 : Math.PI
      d = R + gauss(rng) * 0.011
      a += gauss(rng) * 0.035
      b = 0.42 + rng() * 0.42
    } else if (r < 0.7) {
      // a brighter bead where each base pair meets its backbone
      const k = (rng() * rungs) | 0
      u = rungU(k) + gauss(rng) * 0.006
      a = (rng() < 0.5 ? 0 : Math.PI) + gauss(rng) * 0.05
      d = R + gauss(rng) * 0.01
      b = k % 7 === 3 ? ACCENT_BRIGHTNESS + 0.1 + rng() * 0.15 : 0.85 + rng() * 0.3
    } else if (r < 0.88) {
      // faint rungs: the base pairs, straight through the axis
      const k = (rng() * rungs) | 0
      u = rungU(k) + gauss(rng) * 0.004
      a = 0
      d = (rng() * 2 - 1) * R * 0.94
      b = 0.2 + rng() * 0.16
    } else {
      // loose dust that turns with the strands
      u = rng() * 2 - 1
      a = rng() * TAU
      d = R * (1.25 + Math.abs(gauss(rng)) * 1.3)
      b = 0.1 + rng() * 0.16
    }
    out[o] = u
    out[o + 1] = a
    out[o + 2] = d
    out[o + 3] = b
  }
}

/* ------------------------------------------------------------------ */
/* Frontier ridge                                                      */
/* ------------------------------------------------------------------ */

const RIDGE_LINES = 38
const RIDGE_BINS = 300
const RIDGE_PEAKS = [
  { x: 0.1, w: 0.2, a: 1 },
  { x: -0.42, w: 0.17, a: 0.62 },
  { x: 0.56, w: 0.15, a: 0.54 },
  { x: -0.8, w: 0.14, a: 0.34 },
  { x: 0.92, w: 0.12, a: 0.3 },
]

/** Height of the range at x on line t (0 far, 1 near): sharp peaks with a jagged edge. */
function ridgeHeight(x: number, t: number) {
  let h = 0
  for (const p of RIDGE_PEAKS) {
    const shift = p.x + (t - 0.5) * p.x * 0.25
    const d = Math.abs(x - shift) / p.w
    h += p.a * Math.exp(-d * (1 + d * 0.35))
  }
  const k = 1 + t * 3
  const rough =
    Math.sin(x * 19 * k + t * 41) * 0.05 + Math.sin(x * 37 * k - t * 23) * 0.03 + Math.sin(x * 71 + t * 67) * 0.018
  return Math.max(0, h * (1 + rough) + rough * 0.22)
}

/**
 * Ranges in perspective, the far ones high and small, with the parts hidden
 * by a nearer range left out. z sorts them for the shader: within 0.15 a
 * range, -0.4 the sky.
 */
export function buildRidge(out: Float32Array, count: number, rng: Rng) {
  const lineY: Float32Array[] = []
  const shown: Uint8Array[] = []
  const xs = new Float32Array(RIDGE_BINS)
  const envelope = new Float32Array(RIDGE_BINS).fill(-9)
  const spread = (i: number) => 0.62 + (i / (RIDGE_LINES - 1)) * 0.5
  const toScreen = (t: number) => ({ base: 0.06 - Math.pow(t, 1.4) * 0.72, amp: 0.46 * (1 - t * 0.8) })
  for (let b = 0; b < RIDGE_BINS; b++) xs[b] = (b / (RIDGE_BINS - 1)) * 2 - 1
  for (let i = RIDGE_LINES - 1; i >= 0; i--) {
    const t = i / (RIDGE_LINES - 1)
    const { base, amp } = toScreen(t)
    const ys = new Float32Array(RIDGE_BINS)
    const vis = new Uint8Array(RIDGE_BINS)
    for (let b = 0; b < RIDGE_BINS; b++) {
      const x = xs[b] * spread(i)
      const y = base + ridgeHeight(x, t) * amp
      ys[b] = y
      vis[b] = y > envelope[b] + 0.004 ? 1 : 0
    }
    for (let b = 0; b < RIDGE_BINS; b++) envelope[b] = Math.max(envelope[b], ys[b])
    lineY[i] = ys
    shown[i] = vis
  }

  for (let i = 0; i < count; i++) {
    const o = i * 4
    const r = rng()
    if (r < 0.88) {
      let line = 0
      let bin = 0
      for (let tries = 0; tries < 24; tries++) {
        line = (Math.pow(rng(), 0.8) * RIDGE_LINES) | 0
        bin = (rng() * RIDGE_BINS) | 0
        if (shown[line][bin]) break
      }
      const t = line / (RIDGE_LINES - 1)
      const crest = lineY[line][bin] > toScreen(t).base + 0.1
      const edge = clamp01((1 - Math.abs(xs[bin])) / 0.32)
      out[o] = xs[bin] + gauss(rng) * 0.0012
      out[o + 1] = lineY[line][bin] + gauss(rng) * 0.0022
      out[o + 2] = (t - 0.5) * 0.3
      const base = 0.3 + (1 - t) * 0.52 + (crest ? 0.34 : 0)
      out[o + 3] = crest && rng() < 0.09 ? ACCENT_BRIGHTNESS + rng() * 0.2 : base * edge
    } else {
      // a sky of faint stars above the ranges
      const x = rng() * 2 - 1
      out[o] = x
      out[o + 1] = 0.1 + rng() * 0.92
      out[o + 2] = -0.4
      out[o + 3] = 0.1 + Math.pow(rng(), 4) * 0.6
    }
  }
}

/* ------------------------------------------------------------------ */
/* Orbits around a cube monolith                                       */
/* ------------------------------------------------------------------ */

/**
 * Monolith points are plain (w = brightness); ring points are flagged
 * (w = FLAG + brightness) and lie flat in the xz plane so the shader can turn
 * and tilt them.
 */
export function buildOrbits(out: Float32Array, count: number, rng: Rng) {
  const RINGS = [0.48, 0.66, 0.86, 1.08, 1.32]
  const hx = 0.13
  const hy = 0.34
  const hz = 0.13
  const ringTotal = RINGS.reduce((a, r) => a + r, 0)
  // a few bright "satellites" sit on each ring
  const sat: number[][] = RINGS.map(() => [rng() * TAU, rng() * TAU, rng() * TAU])
  for (let i = 0; i < count; i++) {
    const o = i * 4
    if (rng() < 0.22) {
      // monolith: edges emphasised, faces filled
      let x: number
      let y: number
      let z: number
      if (rng() < 0.6) {
        const e = (rng() * 12) | 0
        const t = rng() * 2 - 1
        const sA = e & 1 ? 1 : -1
        const sB = e & 2 ? 1 : -1
        if (e < 4) {
          x = t * hx
          y = sA * hy
          z = sB * hz
        } else if (e < 8) {
          x = sA * hx
          y = t * hy
          z = sB * hz
        } else {
          x = sA * hx
          y = sB * hy
          z = t * hz
        }
        out[o + 3] = 0.85 + rng() * 0.3
      } else {
        const f = (rng() * 6) | 0
        const u = rng() * 2 - 1
        const v = rng() * 2 - 1
        const s = f & 1 ? 1 : -1
        if (f < 2) {
          x = s * hx
          y = u * hy
          z = v * hz
        } else if (f < 4) {
          x = u * hx
          y = s * hy
          z = v * hz
        } else {
          x = u * hx
          y = v * hy
          z = s * hz
        }
        out[o + 3] = 0.3 + rng() * 0.2
      }
      out[o] = x + gauss(rng) * 0.002
      out[o + 1] = y + gauss(rng) * 0.002
      out[o + 2] = z + gauss(rng) * 0.002
    } else {
      let t = rng() * ringTotal
      let k = 0
      while (k < RINGS.length - 1 && t > RINGS[k]) t -= RINGS[k++]
      const R = RINGS[k]
      let a = rng() * TAU
      let b = 0.32 + rng() * 0.28
      if (rng() < 0.08) {
        const s = sat[k][(rng() * 3) | 0]
        a = s + gauss(rng) * 0.02
        b = ACCENT_BRIGHTNESS + 0.1
      }
      const rr = R + gauss(rng) * 0.006
      out[o] = Math.cos(a) * rr
      out[o + 1] = gauss(rng) * 0.004
      out[o + 2] = Math.sin(a) * rr
      out[o + 3] = FLAG + b
    }
  }
}

/* ------------------------------------------------------------------ */
/* Contact: outline around the CTA + the lodestar above it             */
/* ------------------------------------------------------------------ */

/**
 * Local space = world units centred on the CTA. w/h = outline size in world
 * units. The outline is walked by arc length, blended toward an even split per
 * side so short sides are not sparse; jitter is hashed from the arc position.
 */
/** Local y of the lodestar's centre above a contact box of height h. */
export function contactStarY(h: number) {
  return h / 2 + Math.min(0.32, 0.12 + h * 0.6)
}

export function buildContact(out: Float32Array, count: number, rng: Rng, w: number, h: number) {
  const sides = [w, h, w, h]
  const perim = 2 * (w + h)
  const hw = w / 2
  const hh = h / 2
  const starY = contactStarY(h)
  const starScale = 0.11
  for (let i = 0; i < count; i++) {
    const o = i * 4
    const r = rng()
    if (r < 0.6) {
      // choose a side: half by length, half evenly
      const pick = rng()
      let side = 0
      let accum = 0
      for (; side < 3; side++) {
        accum += 0.5 * (sides[side] / perim) + 0.125
        if (pick < accum) break
      }
      const u = rng()
      let x: number
      let y: number
      // seam sits mid-edge: start each side from its middle
      const t = (u + 0.5) % 1
      if (side === 0) {
        x = -hw + t * w
        y = hh
      } else if (side === 1) {
        x = hw
        y = hh - t * h
      } else if (side === 2) {
        x = hw - t * w
        y = -hh
      } else {
        x = -hw
        y = -hh + t * h
      }
      const hash = Math.sin((side * 7.13 + t * 91.7) * 12.9898) * 43758.5453
      const jitter = (hash - Math.floor(hash) - 0.5) * 0.006
      const halo = rng() < 0.2
      const spread = halo ? Math.abs(gauss(rng)) * 0.018 : 0
      const nx = side === 1 ? 1 : side === 3 ? -1 : 0
      const ny = side === 0 ? 1 : side === 2 ? -1 : 0
      out[o] = x + nx * (jitter + spread)
      out[o + 1] = y + ny * (jitter + spread)
      out[o + 2] = gauss(rng) * 0.01
      out[o + 3] = halo ? 0.28 : 0.75 + rng() * 0.3
    } else if (r < 0.82) {
      const p = helmetPoint(rng)
      out[o] = p.x * starScale
      out[o + 1] = starY + p.y * starScale
      out[o + 2] = gauss(rng) * 0.01
      out[o + 3] = ACCENT_BRIGHTNESS + 0.1 + rng() * 0.2
    } else {
      // loose dust around the card
      const a = rng() * TAU
      const d = 1 + Math.abs(gauss(rng)) * 0.6
      out[o] = Math.cos(a) * (hw + 0.1) * d
      out[o + 1] = Math.sin(a) * (hh + 0.1) * d
      out[o + 2] = -0.2 - rng() * 0.8
      out[o + 3] = 0.12 + rng() * 0.15
    }
  }
}

/** Fallback filler when a formation's asset is missing. */
export function buildRing(out: Float32Array, count: number, rng: Rng) {
  for (let i = 0; i < count; i++) {
    const o = i * 4
    const a = rng() * TAU
    const r = 0.8 + gauss(rng) * 0.02
    out[o] = Math.cos(a) * r
    out[o + 1] = Math.sin(a) * r
    out[o + 2] = gauss(rng) * 0.02
    out[o + 3] = 0.5
  }
}
