/**
 * Mission log particle engine (plain three.js). Loaded with a dynamic import
 * from <ParticleStage />, so three is never part of the initial bundle.
 *
 * - One THREE.Points cloud. Each formation is a vec4 target attribute built
 *   once on the CPU; the vertex shader blends them with per-stage uniforms.
 * - Scroll timeline: elements with data-formation="..." define windows in
 *   viewport heights; each window is smoothstepped into its uniform.
 * - Writes --<formation>-ready CSS variables on <html> so text reveals sync
 *   with shape completion.
 * - No allocations in the frame loop (DOM strings aside), pauses when hidden.
 */
import * as THREE from "three"
import { FORMATION_COUNT, fragmentShader, vertexShader } from "./shaders"
import {
  FORMATIONS,
  FORMATION_INDEX,
  MAX_GRAPH_NODES,
  isFormationName,
  type FormationName,
  type GraphLayout,
} from "@/lib/formations/types"
import { createRng } from "@/lib/formations/random"
import {
  defaultPlace,
  fitPlace,
  helixAngle,
  helixBounds,
  layoutMode,
  measureBounds,
  type Bounds,
  type LayoutMode,
  type Place,
  type Rect,
} from "./layout"
import { loadImageField, type ImageField } from "@/lib/formations/image"
import { buildPortraitFromPoints, loadPortraitPoints } from "@/lib/formations/portrait-points"
import {
  buildAstronautBust,
  buildAstronautFloat,
  buildContact,
  buildGlobe,
  buildGraph,
  buildHelix,
  buildRidge,
  buildLeman,
  buildOrbits,
  buildRandoms,
  buildRing,
  buildScatter,
  buildStar,
  clearEdges,
  contactStarY,
  LEMAN_MARKS,
  LEMAN_STAR,
  lemanBounds,
} from "@/lib/formations/shapes"
import {
  flushNodeScreens,
  graphLabelElements,
  hasNodeScreenListeners,
  particleStore,
  publishNodeScreen,
} from "./store"

export type ParticleAssets = {
  /** baked dot positions (scripts/portrait-points.mjs), not an image */
  portraitPoints: string
  bustMask: string
  bustLum: string
  floatMask: string
  floatLum: string
}

export const DEFAULT_ASSETS: ParticleAssets = {
  portraitPoints: "/portrait/david-points.bin",
  bustMask: "/particles/astronaut-bust-mask.png",
  bustLum: "/particles/astronaut-bust-lum.webp",
  floatMask: "/particles/astronaut-float-mask.png",
  floatLum: "/particles/astronaut-float-lum.png",
}

export type EngineOptions = {
  canvas: HTMLCanvasElement
  /** A WebGL2 context already made on `canvas` (ParticleStage makes it, so a
   *  missing WebGL never reaches three.js). */
  context?: WebGL2RenderingContext
  count: number
  /** Device pixel ratio cap. Default 2. Lowered further while frames run slow. */
  maxDpr?: number
  /** The slow-frame fallback never goes below this. Default 1. */
  minDpr?: number
  assets?: Partial<ParticleAssets>
  onContextLost?: () => void
}

export type Engine = { dispose(): void }

type Section = {
  el: HTMLElement
  k: number
  /** window start/length in viewport heights */
  start: number
  len: number
  outlineId: string | null
}

const PALETTE = {
  particle: [0.93, 0.93, 0.94] as const, // #EDEDEF
  azure: [0.302, 0.639, 1.0] as const, // #4DA3FF
  clear: 0x1f1e22,
}

const CAMERA_FOV = 40
const CAMERA_Z = 1 / Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180) // visible height at z=0 is 2

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t: number) => t * t * (3 - 2 * t)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function createEngine(opts: EngineOptions): Engine {
  const { canvas } = opts
  const count = Math.max(1000, Math.floor(opts.count))
  const assets: ParticleAssets = { ...DEFAULT_ASSETS, ...opts.assets }
  const root = document.documentElement

  /* ---------------- renderer, camera, geometry ---------------- */

  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: opts.context,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  })
  renderer.setClearColor(PALETTE.clear, 1)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.05, 40)
  camera.position.set(0, 0, CAMERA_Z)

  const geometry = new THREE.BufferGeometry()
  const scatter = new Float32Array(count * 3)
  const rand = new Float32Array(count * 4)
  const star = new Float32Array(count * 4)
  const edges = new Float32Array(count * 4)
  const targets: Float32Array[] = []
  // the ridge shares the leman buffer and attribute: see aF4 in shaders.ts
  for (let k = 0; k < FORMATION_COUNT; k++) {
    targets.push(k === FORMATION_INDEX.ridge ? targets[FORMATION_INDEX.leman] : new Float32Array(count * 4))
  }

  buildScatter(scatter, count, createRng(11))
  buildRandoms(rand, count, createRng(12))
  buildStar(star, count, createRng(13))
  clearEdges(edges, count)

  // Every formation is built on demand, when a section on the page asks for
  // it: text pages (/work/<slug>, /about, ...) build none of them.
  const built = new Array<boolean>(FORMATION_COUNT).fill(false)
  /** on-screen extent of each built shape, for fitting it beside the copy */
  const bounds: Array<Bounds | null> = new Array(FORMATION_COUNT).fill(null)

  geometry.setAttribute("position", new THREE.BufferAttribute(scatter, 3))
  geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 4))
  geometry.setAttribute("aStar", new THREE.BufferAttribute(star, 4))
  const edgeAttr = new THREE.BufferAttribute(edges, 4)
  geometry.setAttribute("aEdge", edgeAttr)
  const targetAttrs: THREE.BufferAttribute[] = []
  targets.forEach((arr, k) => {
    if (k === FORMATION_INDEX.ridge) {
      targetAttrs.push(targetAttrs[FORMATION_INDEX.leman])
      return
    }
    const attr = new THREE.BufferAttribute(arr, 4)
    geometry.setAttribute(`aF${k}`, attr)
    targetAttrs.push(attr)
  })
  // portrait surface normals (xy) for the pointer light
  const normals = new Float32Array(count * 2)
  const normalAttr = new THREE.BufferAttribute(normals, 2)
  geometry.setAttribute("aN", normalAttr)

  const nodeUniform = new Float32Array(MAX_GRAPH_NODES * 3)
  const mUniform = new Float32Array(FORMATION_COUNT)
  const offUniform = new Float32Array(FORMATION_COUNT * 3)
  const sclUniform = new Float32Array(FORMATION_COUNT * 3).fill(1)

  const uniforms = {
    uTime: { value: 0 },
    uSize: { value: 4 },
    uTurb: { value: 0 },
    uStar: { value: 1 },
    uLoad: { value: 0 },
    uStarX: { value: new THREE.Vector3(0, 0.05, 0.26) },
    uM: { value: mUniform },
    uOff: { value: offUniform },
    uScl: { value: sclUniform },
    uPointer: { value: new THREE.Vector2(9, 9) },
    uPointerOn: { value: 0 },
    uGlowR: { value: 0.2 },
    uHover: { value: -1 },
    uGraphPan: { value: new THREE.Vector2(0, 0) },
    uFlow: { value: 0.045 },
    uNodes: { value: nodeUniform },
    uGlobeSpin: { value: 0 },
    uGlobeTilt: { value: 0.52 },
    uOrbitTilt: { value: 0.34 },
    uContactStar: { value: 0 },
    uHelix: { value: new THREE.Vector3(0, 0, -0.9) },
    uLight: { value: new THREE.Vector3(0, 0, 1) },
    uHeadYaw: { value: 0 },
    uHeadPitch: { value: 0 },
    // head ellipse of the portrait (local space); replaced by findHead()
    uHeadCenter: { value: new THREE.Vector4(-0.05, 0.54, 0.3, 0.39) },
    uColA: { value: new THREE.Vector3(...PALETTE.particle) },
    uColB: { value: new THREE.Vector3(...PALETTE.azure) },
    uOpacity: { value: count > 40000 ? 0.5 : 0.72 },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    defines: { MAX_NODES: MAX_GRAPH_NODES },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  scene.add(points)

  /* ---------------- viewport + layout ---------------- */

  /** the canvas box (fixed at the large viewport height, so on phones it
   *  does not change while the toolbars slide in and out) */
  const stageW = () => canvas.clientWidth || window.innerWidth
  const stageH = () => canvas.clientHeight || window.innerHeight
  let vw = stageW()
  let vh = stageH()
  let aspect = vw / vh
  let mode: LayoutMode = layoutMode(vw, vh)
  let isPortraitVp = mode === "portrait"
  let graphKey = ""
  const coarse = window.matchMedia("(pointer: coarse)").matches

  let sections: Section[] = []
  const present = new Array<boolean>(FORMATION_COUNT).fill(false)
  const nextPresent = new Int8Array(FORMATION_COUNT).fill(-1)
  const sectionPlace: Array<Partial<Place> | null> = new Array(FORMATION_COUNT).fill(null)
  /** each section's copy (text only) in px, relative to its sticky stage's
   *  top edge (= viewport top while the stage is stuck) */
  const copyBox: Array<{ top: number; bottom: number; left: number; right: number } | null> = new Array(
    FORMATION_COUNT,
  ).fill(null)

  let dprCap = opts.maxDpr ?? 2
  const dprFloor = Math.min(dprCap, opts.minDpr ?? 1)

  function resizeRenderer() {
    vw = stageW()
    vh = stageH()
    aspect = vw / vh
    mode = layoutMode(vw, vh)
    isPortraitVp = mode === "portrait"
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    renderer.setPixelRatio(dpr)
    renderer.setSize(vw, vh, false)
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    // fewer particles (phones, tablets) are drawn a little larger; past 72 000
    // (desktop) they get finer, so the extra particles add detail, not glare
    const fine = count > 72000 ? Math.max(0.84, Math.sqrt(72000 / count)) : 1
    const density = Math.min(1.3, Math.max(1, Math.sqrt(40000 / count))) * fine
    uniforms.uSize.value =
      2.05 * CAMERA_Z * dpr * Math.min(1.35, Math.max(0.48, Math.min(vw, vh) / 900)) * density
    uniforms.uGlowR.value = isPortraitVp ? 0.15 : 0.2
    uniforms.uStarX.value.set(0, isPortraitVp ? 0.08 : 0.05, isPortraitVp ? Math.min(0.26, aspect * 0.45) : 0.26)
  }

  /** px from the viewport top (y down) to world y (up, half-height 1) */
  const pxToWorldY = (py: number) => 1 - (py / vh) * 2
  const pxToWorldX = (px: number) => ((px - vw / 2) / vh) * 2

  /**
   * Free area for a shape on phones and tablets: above the copy (portrait) or
   * to its right (compact landscape). Null on wide screens, where the desktop
   * placement is kept as tuned, and when the copy has not been measured.
   */
  function freeRect(k: number): Rect | null {
    const c = copyBox[k]
    if (!c || mode === "wide") return null
    // the hero shares the top of the screen with the header
    // (and the helix, whose top end would otherwise run under it)
    const top = k === FORMATION_INDEX.portrait ? 84 : k === FORMATION_INDEX.helix ? 72 : Math.max(20, vh * 0.035)
    if (mode === "portrait") {
      // breathing room: about 20px under the header and above the copy
      const header = document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().bottom ?? 0
      return {
        x0: -aspect * 0.94,
        x1: aspect * 0.94,
        y0: pxToWorldY(c.top - Math.max(22, vh * 0.026)),
        y1: pxToWorldY(Math.max(top, header + 20)),
      }
    }
    return {
      x0: pxToWorldX(c.right + Math.max(24, vw * 0.03)),
      x1: aspect - Math.max(0.04, (24 / vh) * 2),
      y0: -0.94,
      y1: pxToWorldY(k === FORMATION_INDEX.portrait ? top : vh * 0.03),
    }
  }

  function applyLayout() {
    // the helix is laid at a per-layout angle, so its extent follows it
    const H = FORMATION_INDEX.helix
    uniforms.uHelix.value.z = helixAngle(mode, freeRect(H))
    if (built[H]) bounds[H] = helixBounds(uniforms.uHelix.value.z)
    for (let k = 0; k < FORMATION_COUNT; k++) {
      const name = FORMATIONS[k]
      let base = defaultPlace(name, aspect, mode)
      const ov = sectionPlace[k]
      const b = bounds[k]
      if (name === "leman" && !ov && b) base = fitLeman(base, b)
      const rect = !ov && b && name !== "leman" ? freeRect(k) : null
      // portrait phones: the shape must fit above the copy, even if that means
      // drawing it small (a floor of 0.62 let it run into the kicker)
      if (rect && b) base = fitPlace(base, b, rect, aspect, mode === "portrait" ? 0.3 : 0.55)
      const x = ov?.x ?? base.x
      const y = ov?.y ?? base.y
      const s = base.s * (ov?.s ?? 1)
      if (name === "contact") {
        offUniform[k * 3] = 0
        offUniform[k * 3 + 1] = 0
        sclUniform[k * 3] = sclUniform[k * 3 + 1] = sclUniform[k * 3 + 2] = 1
        continue
      }
      if (name === "graph") {
        // the graph bakes its scale into node positions; only its offset lives here
        offUniform[k * 3] = graphOx
        offUniform[k * 3 + 1] = graphOy
        sclUniform[k * 3] = sclUniform[k * 3 + 1] = sclUniform[k * 3 + 2] = 1
        continue
      }
      offUniform[k * 3] = x * aspect
      offUniform[k * 3 + 1] = y
      offUniform[k * 3 + 2] = 0
      sclUniform[k * 3] = sclUniform[k * 3 + 1] = sclUniform[k * 3 + 2] = s
    }
    const B = FORMATION_INDEX["astronaut-bust"]
    const bust = bounds[B]
    if (bust) {
      const toPxY = (y: number) => (1 - (offUniform[B * 3 + 1] + y * sclUniform[B * 3])) * (vh / 2)
      const midX = offUniform[B * 3] + ((bust.minX + bust.maxX) / 2) * sclUniform[B * 3]
      particleStore.set({ bustBox: { top: toPxY(bust.maxY), bottom: toPxY(bust.minY), centerX: vw / 2 + midX * (vh / 2) } })
    }
  }

  function scanSections() {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-formation]"))
    const next: Section[] = []
    present.fill(false)
    sectionPlace.fill(null)
    for (const el of els) {
      const name = el.dataset.formation
      if (!isFormationName(name)) continue
      const k = FORMATION_INDEX[name]
      present[k] = true
      const num = (v: string | undefined) => {
        if (v === undefined || v === "") return undefined
        const n = parseFloat(v)
        return Number.isFinite(n) ? n : undefined
      }
      const px = num(el.dataset.formationX)
      const py = num(el.dataset.formationY)
      const ps = num(el.dataset.formationScale)
      if (px !== undefined || py !== undefined || ps !== undefined) sectionPlace[k] = { x: px, y: py, s: ps }
      next.push({ el, k, start: 0, len: 0.6, outlineId: el.dataset.outlineTarget ?? null })
    }
    sections = next
    helixSection = next.find((s) => s.k === FORMATION_INDEX.helix) ?? null
    ridgeSection = next.find((s) => s.k === FORMATION_INDEX.ridge) ?? null
    ensureFormations()
    let nxt = -1
    for (let k = FORMATION_COUNT - 1; k >= 0; k--) {
      nextPresent[k] = nxt
      if (present[k]) nxt = k
    }
    measure()
  }

  let contactTarget: HTMLElement | null = null
  let contactW = 0
  let contactH = 0
  /** helmet centre above the contact box, in its local space */
  let contactStar = 0
  /** contact CTA centre in document coordinates (it sits in a non-sticky
   *  section, so it only moves on layout changes, which re-run measure()) */
  let contactDocCx = 0
  let contactDocCy = 0

  const range = document.createRange()
  /** The section copy's text extent, relative to its sticky stage, with the
   *  reveal's translate taken out (it drifts up to 18px while fading in). */
  function measureCopy(section: HTMLElement) {
    const stage = section.querySelector<HTMLElement>(".fm-stage")
    const copy = section.querySelector<HTMLElement>(".fm-copy")
    if (!stage || !copy) return null
    range.selectNodeContents(copy)
    const r = range.getBoundingClientRect()
    if (!r.height) return null
    const st = stage.getBoundingClientRect()
    let ty = 0
    const tf = getComputedStyle(copy).transform
    if (tf && tf !== "none") {
      try {
        ty = new DOMMatrixReadOnly(tf).m42
      } catch {
        ty = 0
      }
    }
    return { top: r.top - st.top - ty, bottom: r.bottom - st.top - ty, left: r.left, right: r.right }
  }

  function measure() {
    const sy = window.scrollY
    for (const s of sections) {
      const r = s.el.getBoundingClientRect()
      const top = (r.top + sy) / vh
      const startOff = parseFloat(s.el.dataset.formationStart ?? "")
      const len = parseFloat(s.el.dataset.formationLength ?? "")
      s.start = top - 0.8 + (Number.isFinite(startOff) ? startOff : 0)
      s.len = Number.isFinite(len) && len > 0 ? len : 0.6
      copyBox[s.k] = measureCopy(s.el)
    }
    collectLemanLabels()
    applyLayout()
    // contact outline size
    const cs = sections.find((s) => s.k === FORMATION_INDEX.contact)
    const target = cs?.outlineId ? document.getElementById(cs.outlineId) : null
    contactTarget = target
    if (target) {
      const r = target.getBoundingClientRect()
      contactDocCx = r.left + r.width / 2
      contactDocCy = r.top + sy + r.height / 2
      const w = (r.width / vh) * 2 + 0.07
      const h = (r.height / vh) * 2 + 0.07
      if (!built[FORMATION_INDEX.contact] || Math.abs(w - contactW) > 0.004 || Math.abs(h - contactH) > 0.004) {
        contactW = w
        contactH = h
        buildContact(targets[FORMATION_INDEX.contact], count, createRng(28), w, h)
        contactStar = contactStarY(h)
        targetAttrs[FORMATION_INDEX.contact].needsUpdate = true
        built[FORMATION_INDEX.contact] = true
      }
    } else {
      built[FORMATION_INDEX.contact] = false
    }
    if (present[FORMATION_INDEX.graph] && graphMappingKey() !== graphKey) rebuildGraph()
  }

  /* ---------------- Lac Léman map labels ---------------- */

  type MapLabel = {
    el: HTMLElement
    /** marker in the formation's local space */
    x: number
    y: number
    side: string
    /** px between the marker and the label (plus the star's radius for stars) */
    gap: number
    star: boolean
    /** last --gap written, px */
    gapPx: number
    w: number
    h: number
    lastX: number
    lastY: number
  }
  let lemanLabels: MapLabel[] = []
  /** the direction trails are drawn only while their labels show (not on phones) */
  let lemanDirections = true
  /** share of lake particles lit: fewer when the map is drawn small */
  let lemanThin = 1

  function rebuildLeman() {
    const L = FORMATION_INDEX.leman
    buildLeman(targets[L], count, createRng(24), lemanDirections, lemanThin)
    targetAttrs[L].needsUpdate = true
    bounds[L] = lemanBounds(lemanDirections)
  }

  /** Labels sit on landmarks of the map; the page renders them, the engine
   *  measures them here (never in the frame loop) and moves them per frame. */
  function collectLemanLabels() {
    const next: MapLabel[] = []
    let minorShown = false
    document.querySelectorAll<HTMLElement>("[data-leman-label]").forEach((el) => {
      const mark = LEMAN_MARKS.find((m) => m.id === el.dataset.lemanLabel)
      const inner = el.querySelector<HTMLElement>(".pf-label-inner")
      if (!mark || !inner) return
      const w = inner.offsetWidth
      if (!w) return // hidden at this size
      if (mark.minor) minorShown = true
      const prev = lemanLabels.find((l) => l.el === el)
      next.push({
        el,
        x: mark.x,
        y: mark.y,
        side: el.dataset.side ?? "right",
        gap: parseFloat(el.dataset.gap ?? "") || 10,
        star: el.dataset.star !== undefined,
        gapPx: prev ? prev.gapPx : -1,
        w,
        h: inner.offsetHeight,
        lastX: prev ? prev.lastX : -1e5,
        lastY: prev ? prev.lastY : -1e5,
      })
    })
    lemanLabels = next
    const L = FORMATION_INDEX.leman
    if (present[L] && built[L] && minorShown !== lemanDirections) {
      lemanDirections = minorShown
      rebuildLeman()
    }
  }

  /** px between a label and its landmark at map scale s: stars grow with the map */
  const labelGap = (l: MapLabel, s: number) => l.gap + (l.star ? LEMAN_STAR * s * (vh / 2) : 0)

  /** Screen box of a label around its marker at (X, Y) px, at map scale s. */
  function labelBox(l: MapLabel, X: number, Y: number, s: number) {
    const g = labelGap(l, s)
    switch (l.side) {
      case "left":
        return { l: X - g - l.w, r: X - g, t: Y - l.h / 2, b: Y + l.h / 2 }
      case "above":
        return { l: X - l.w / 2, r: X + l.w / 2, t: Y - g - l.h, b: Y - g }
      case "below":
        return { l: X - l.w / 2, r: X + l.w / 2, t: Y + g, b: Y + g + l.h }
      default:
        return { l: X + g, r: X + g + l.w, t: Y - l.h / 2, b: Y + l.h / 2 }
    }
  }

  /** Where the map may go, in px: right of the copy on landscape screens,
   *  above it on portrait ones, always under the header. */
  function lemanArea() {
    const c = copyBox[FORMATION_INDEX.leman]
    // the header is 80px tall at the top of the page but shrinks to its
    // scrolled height (3.5rem, 4rem on touch) by the time the map shows
    const headerNow = document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().bottom ?? 0
    const header = Math.min(headerNow, coarse ? 65 : 57)
    if (mode === "portrait") {
      return {
        l: Math.max(10, vw * 0.03),
        r: vw - Math.max(10, vw * 0.03),
        t: Math.max(header + 16, vh * 0.035),
        b: c ? c.top - Math.max(22, vh * 0.026) : vh * 0.48,
      }
    }
    return {
      l: c ? c.right + Math.max(24, vw * 0.018) : vw * 0.5,
      r: vw - Math.max(16, vw * 0.015),
      t: Math.max(header + 20, vh * 0.05),
      b: vh - Math.max(20, vh * 0.04),
    }
  }

  /**
   * Fit the map, labels included, into lemanArea(): shrink it (labels keep
   * their size, so a few rounds; never larger than the default placement),
   * then centre it in the area.
   */
  function fitLeman(base: Place, b: Bounds): Place {
    const area = lemanArea()
    const half = vh / 2
    const extent = (s: number) => {
      let l = vw / 2 + b.minX * s * half
      let r = vw / 2 + b.maxX * s * half
      let t = vh / 2 - b.maxY * s * half
      let bt = vh / 2 - b.minY * s * half
      for (const lab of lemanLabels) {
        const o = labelBox(lab, vw / 2 + lab.x * s * half, vh / 2 - lab.y * s * half, s)
        l = Math.min(l, o.l)
        r = Math.max(r, o.r)
        t = Math.min(t, o.t)
        bt = Math.max(bt, o.b)
      }
      return { l, r, t, b: bt }
    }
    let s = base.s
    for (let i = 0; i < 6; i++) {
      const e = extent(s)
      const spanX = (b.maxX - b.minX) * s * half
      const spanY = (b.maxY - b.minY) * s * half
      const fx = (area.r - area.l - (e.r - e.l - spanX)) / spanX
      const fy = (area.b - area.t - (e.b - e.t - spanY)) / spanY
      const f = Math.min(1, fx, fy)
      if (f >= 0.998) break
      s *= Math.max(0.5, f)
    }
    const e = extent(s)
    const cx = ((area.l + area.r) / 2 - (e.l + e.r) / 2) / half
    const cy = -((area.t + area.b) / 2 - (e.t + e.b) / 2) / half
    // drawn small, the lake's outline would clot (phones and tablets also draw
    // fewer, larger particles, tall screens larger ones): light fewer, in
    // steps so a resize does not rebuild often. Desktop keeps them all.
    const sizeF = uniforms.uSize.value / (2.05 * CAMERA_Z * renderer.getPixelRatio())
    const weight = (((s * half) / 240) * Math.sqrt(count / 60000) * 1.15) / Math.max(1, sizeF)
    const thin = Math.round(Math.min(1, Math.max(0.45, weight)) * 20) / 20
    if (thin !== lemanThin) {
      lemanThin = thin
      if (built[FORMATION_INDEX.leman]) rebuildLeman()
    }
    return { x: cx / aspect, y: cy, s }
  }

  /** Move each label onto its projected landmark (only when it moved). */
  function projectLemanLabels() {
    const k = FORMATION_INDEX.leman * 3
    const s = sclUniform[k]
    for (const l of lemanLabels) {
      const g = Math.round(labelGap(l, s))
      if (g !== l.gapPx) {
        l.gapPx = g
        l.el.style.setProperty("--gap", `${g}px`)
      }
      proj.set(offUniform[k] + l.x * s, offUniform[k + 1] + l.y * s, 0)
      proj.applyMatrix4(points.matrixWorld).project(camera)
      const x = (proj.x * 0.5 + 0.5) * vw
      const y = (0.5 - proj.y * 0.5) * vh
      if (Math.abs(x - l.lastX) > 0.25 || Math.abs(y - l.lastY) > 0.25) {
        l.lastX = x
        l.lastY = y
        l.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
      }
    }
  }

  /* ---------------- graph ---------------- */

  let graphIds: string[] = []
  const graphIndex = new Map<string, number>()
  let graphR = new Float32Array(MAX_GRAPH_NODES)
  const lastLabelX = new Float32Array(MAX_GRAPH_NODES).fill(-1e5)
  const lastLabelY = new Float32Array(MAX_GRAPH_NODES).fill(-1e5)
  let graphSx = 1
  let graphSy = 1
  let graphOx = 0
  let graphOy = 0

  /**
   * Scale (world units per layout unit) and offset of the star map.
   * wide and portrait phones: the original tuning. Portrait tablets: the map
   * fills the space under the heading and intro. Compact landscape (tablets
   * and phones held sideways): the portrait layout (GraphLayoutSwitch sends it
   * there too) fitted to the right of the copy column, which on these widths
   * takes too much of the screen to share it with the wide map.
   * The portrait layout spans x -0.98..0.98 (labels included) and y -1..0.5.
   */
  function graphMapping(): [number, number, number, number] {
    const c = copyBox[FORMATION_INDEX.graph]
    if (mode === "wide") return [Math.min(aspect * 0.8, 1.9), 0.8, 0, 0]
    if (mode === "portrait") {
      if (vw < 600 || !c) return [aspect * 0.9, 0.66, 0, 0]
      const y1 = pxToWorldY(c.bottom + 36)
      const y0 = -0.94
      const sy = Math.max(0.5, Math.min(0.8, (y1 - y0) / 1.56))
      // labels sit right of their stars: nudge the map right to centre it
      return [aspect * 0.9, sy, aspect * 0.1, Math.min(0.5, y1 - 0.53 * sy)]
    }
    if (!c) return [Math.min(aspect * 0.8, 1.9), 0.8, 0, 0]
    const x1 = aspect - (28 / vh) * 2
    const x0 = Math.min(pxToWorldX(c.right + 32), x1 - aspect * 0.9)
    const y1 = pxToWorldY(vh * 0.06)
    const y0 = -0.93
    const sx = Math.min(aspect * 0.8, (x1 - x0) / 1.96)
    const sy = Math.min(1.15, (y1 - y0) / 1.56)
    return [sx, sy, (x0 + x1) / 2, y1 - 0.53 * sy]
  }

  function graphMappingKey() {
    const c = copyBox[FORMATION_INDEX.graph]
    const layout = particleStore.get().graph
    return [
      mode,
      vw,
      vh,
      layout ? layout.nodes.length : 0,
      graphLabelElements.size,
      c ? Math.round(c.bottom / 8) : -1,
      c ? Math.round(c.right / 8) : -1,
      // label widths change when the web font arrives
      Math.round(labelWidthSum() / 8),
    ].join(":")
  }

  function labelWidthSum() {
    let sum = 0
    graphLabelElements.forEach((el) => (sum += el.querySelector<HTMLElement>(".pf-label-inner")?.offsetWidth ?? 0))
    return sum
  }

  /** A node's label: its width in px (0: none) and the side of the star it
   *  sits on (right unless the page sets data-side-wide / data-side-compact;
   *  the wide graph layout runs only in wide mode). */
  function labelInfo(id: string) {
    const el = graphLabelElements.get(id)
    const inner = el?.querySelector<HTMLElement>(".pf-label-inner")
    const side = (mode === "wide" ? el?.dataset.sideWide : el?.dataset.sideCompact) ?? "right"
    return { w: inner ? inner.offsetWidth : 0, side }
  }

  /**
   * The screen area the labelled stars must stay inside, in px: under the
   * header everywhere, right of the copy on compact screens and under it on
   * portrait tablets (where graphMapping put the map).
   */
  function graphArea() {
    const c = copyBox[FORMATION_INDEX.graph]
    const header = document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().bottom ?? 0
    const edge = mode === "wide" ? 16 : 8
    const area = { l: edge, r: vw - edge, t: Math.max(edge, header + 10), b: vh - edge }
    if (c && mode === "compact") area.l = Math.max(area.l, Math.min(c.right + 24, vw * 0.5))
    // wide: the whole map clears the copy column (keepOffCopy alone hops
    // single stars, which stacked Dbrain on Retouch Studio), unless that
    // would leave the map less than half the screen
    if (c && mode === "wide") area.l = Math.max(area.l, Math.min(c.right + 32, vw * 0.5))
    if (c && mode === "portrait" && vw >= 600) area.t = Math.max(area.t, c.bottom + 20)
    return area
  }

  /** Projected box of a star and its label (labels sit right of the star). */
  function nodeBox(n: GraphLayout["nodes"][number], sx: number, sy: number, ox: number, oy: number) {
    const half = vh / 2
    const X = vw / 2 + (n.x * sx + ox) * half
    const Y = vh / 2 - (n.y * sy + oy) * half
    const rp = n.r * Math.min(sx, sy) * half
    const { w, side } = labelInfo(n.id)
    if (w && (side === "above" || side === "below")) {
      const hh = rp + 20
      return { X, Y, l: X - Math.max(rp, w / 2), r: X + Math.max(rp, w / 2), t: Y - hh, b: Y + hh }
    }
    const lw = w ? w + (isPortraitVp ? 16 : 10) : 0
    const hh = Math.max(rp, lw ? 10 : 0)
    if (side === "left") return { X, Y, l: X - rp - lw, r: X + rp, t: Y - hh, b: Y + hh }
    return { X, Y, l: X - rp, r: X + rp + lw, t: Y - hh, b: Y + hh }
  }

  /**
   * graphMapping() sizes the map from fixed layout spans; labels are wider
   * than those spans allow on some screens. Measure the real boxes, labels
   * included, shrink the map if it does not fit the area (labels keep their
   * size, so a few rounds), then slide it inside.
   */
  function fitGraphToView(layout: GraphLayout) {
    const nodes = layout.nodes.filter((n) => graphLabelElements.has(n.id))
    if (!nodes.length) return
    const area = graphArea()
    const half = vh / 2
    const extent = () => {
      let l = Infinity
      let r = -Infinity
      let t = Infinity
      let b = -Infinity
      let xl = Infinity
      let xr = -Infinity
      let yt = Infinity
      let yb = -Infinity
      for (const n of nodes) {
        const o = nodeBox(n, graphSx, graphSy, graphOx, graphOy)
        l = Math.min(l, o.l)
        r = Math.max(r, o.r)
        t = Math.min(t, o.t)
        b = Math.max(b, o.b)
        xl = Math.min(xl, o.X)
        xr = Math.max(xr, o.X)
        yt = Math.min(yt, o.Y)
        yb = Math.max(yb, o.Y)
      }
      return { l, r, t, b, spanX: xr - xl, spanY: yb - yt }
    }
    for (let i = 0; i < 4; i++) {
      const e = extent()
      const w = e.r - e.l
      const h = e.b - e.t
      const aw = area.r - area.l
      const ah = area.b - area.t
      let changed = false
      if (w > aw && e.spanX > 1) {
        const f = Math.max(0.6, (aw - (w - e.spanX)) / e.spanX)
        if (f < 0.999) {
          graphSx *= f
          changed = true
        }
      }
      if (h > ah && e.spanY > 1) {
        const f = Math.max(0.6, (ah - (h - e.spanY)) / e.spanY)
        if (f < 0.999) {
          graphSy *= f
          changed = true
        }
      }
      if (!changed) break
    }
    const e = extent()
    // slide inside: centre when it still does not fit, else the shortest move
    if (e.r - e.l > area.r - area.l) graphOx += ((area.l + area.r) / 2 - (e.l + e.r) / 2) / half
    else if (e.r > area.r) graphOx -= (e.r - area.r) / half
    else if (e.l < area.l) graphOx += (area.l - e.l) / half
    if (e.b - e.t > area.b - area.t) graphOy -= ((area.t + area.b) / 2 - (e.t + e.b) / 2) / half
    else if (e.t < area.t) graphOy -= (area.t - e.t) / half
    else if (e.b > area.b) graphOy += (e.b - area.b) / half
  }

  /** Last word after the copy hop: any labelled star still poking out of the
   *  area is pulled back in on its own. */
  function keepInView(layout: GraphLayout): GraphLayout {
    const area = graphArea()
    const half = vh / 2
    const nodes = layout.nodes.map((n) => {
      if (!graphLabelElements.has(n.id)) return n
      const o = nodeBox(n, graphSx, graphSy, graphOx, graphOy)
      let dx = 0
      let dy = 0
      if (o.r > area.r) dx = area.r - o.r
      else if (o.l < area.l) dx = area.l - o.l
      if (o.t < area.t) dy = area.t - o.t
      else if (o.b > area.b) dy = area.b - o.b
      if (!dx && !dy) return n
      return { ...n, x: n.x + dx / (graphSx * half), y: n.y - dy / (graphSy * half) }
    })
    return { nodes, edges: layout.edges }
  }

  /**
   * Stars must not land on the section copy (the intro used to get a star on
   * the word "Each"): any star or label box that overlaps the copy moves just
   * past its right edge or below it, whichever is the shorter hop.
   */
  function keepOffCopy(layout: GraphLayout): GraphLayout {
    const c = copyBox[FORMATION_INDEX.graph]
    if (!c) return layout
    const half = vh / 2
    const ux = graphSx * half
    const uy = graphSy * half
    const pad = 12
    const box = { l: c.left - pad, r: c.right + pad, t: c.top - pad, b: c.bottom + pad }
    const nodes = layout.nodes.map((n) => {
      const o = nodeBox(n, graphSx, graphSy, graphOx, graphOy)
      if (o.r < box.l || o.l > box.r || o.b < box.t || o.t > box.b) return n
      const hopRight = box.r + 4 - o.l
      const hopDown = box.b + 4 - o.t
      const m = { ...n }
      if (hopRight < hopDown && o.r + hopRight < vw - 8) m.x = n.x + hopRight / ux
      else m.y = n.y - hopDown / uy
      return m
    })
    return { nodes, edges: layout.edges }
  }

  function rebuildGraph() {
    const published: GraphLayout | null = particleStore.get().graph
    graphKey = graphMappingKey()
    ;[graphSx, graphSy, graphOx, graphOy] = graphMapping()
    if (published) fitGraphToView(published)
    const layout = published ? keepInView(keepOffCopy(published)) : null
    applyLayout()
    const res = buildGraph(
      targets[FORMATION_INDEX.graph],
      edges,
      count,
      createRng(25),
      layout,
      graphSx,
      graphSy,
      nodeUniform,
    )
    graphIds = res.ids
    graphIndex.clear()
    graphR = new Float32Array(MAX_GRAPH_NODES)
    graphIds.forEach((id, i) => graphIndex.set(id, i))
    layout?.nodes.slice(0, MAX_GRAPH_NODES).forEach((n, i) => (graphR[i] = n.r))
    lastLabelX.fill(-1e5)
    lastLabelY.fill(-1e5)
    targetAttrs[FORMATION_INDEX.graph].needsUpdate = true
    edgeAttr.needsUpdate = true
    built[FORMATION_INDEX.graph] = true
    applyHover()
    applyFocus()
  }

  let panTargetX = 0
  let panTargetY = 0
  function applyHover() {
    const id = particleStore.get().hoveredNode
    const i = id ? graphIndex.get(id) : undefined
    uniforms.uHover.value = i === undefined ? -1 : i
  }
  function applyFocus() {
    const id = particleStore.get().graphFocus
    const i = id ? graphIndex.get(id) : undefined
    if (i === undefined) {
      panTargetX = 0
      panTargetY = 0
    } else {
      panTargetX = nodeUniform[i * 3] * 0.55
      panTargetY = nodeUniform[i * 3 + 1] * 0.55
    }
  }

  let lastGraph = particleStore.get().graph
  let lastHover = particleStore.get().hoveredNode
  let lastFocus = particleStore.get().graphFocus
  const unsubscribe = particleStore.subscribe(() => {
    const s = particleStore.get()
    if (s.graph !== lastGraph) {
      lastGraph = s.graph
      rebuildGraph()
    }
    if (s.hoveredNode !== lastHover) {
      lastHover = s.hoveredNode
      applyHover()
    }
    if (s.graphFocus !== lastFocus) {
      lastFocus = s.graphFocus
      applyFocus()
    }
  })

  /* ---------------- image formations ---------------- */

  let disposed = false

  /** A target buffer was filled: upload it, measure it, re-place shapes. */
  function finishBuild(k: number) {
    targetAttrs[k].needsUpdate = true
    built[k] = true
    bounds[k] =
      k === FORMATION_INDEX.leman ? lemanBounds(lemanDirections) : measureBounds(FORMATIONS[k], targets[k], count)
    applyLayout()
  }

  function fallbackFill(k: number) {
    buildRing(targets[k], count, createRng(40 + k))
    targetAttrs[k].needsUpdate = true
  }

  // Image formations load lazily: only when a section on the current page
  // asks for them. Text pages (/about, /work/<slug>, ...) download nothing.
  // `requested` is set once per formation so a failed load is not retried on
  // every MutationObserver rescan.
  const requested = new Array<boolean>(FORMATION_COUNT).fill(false)

  async function loadPortrait() {
    const portrait = await loadPortraitPoints(assets.portraitPoints)
    if (disposed) return
    if (portrait) {
      const head = buildPortraitFromPoints(portrait, targets[FORMATION_INDEX.portrait], count, createRng(21), normals)
      if (head) uniforms.uHeadCenter.value.set(head.cx, head.cy, head.rx, head.ry)
      normalAttr.needsUpdate = true
      finishBuild(FORMATION_INDEX.portrait)
    } else {
      // Missing masks keep their formation unbuilt: its uniform stays 0 and the
      // field blends straight to the next shape. Fill with a quiet ring anyway
      // so a stale buffer can never show garbage.
      fallbackFill(FORMATION_INDEX.portrait)
    }
  }

  async function loadBust() {
    // 1024: the visor rim, seams and folds come out of the finer luminance grid
    const bust = await loadImageField(assets.bustMask, assets.bustLum, 1024)
    if (disposed) return
    if (bust) {
      buildAstronautBust(targets[FORMATION_INDEX["astronaut-bust"]], count, createRng(22), bust)
      finishBuild(FORMATION_INDEX["astronaut-bust"])
    } else {
      fallbackFill(FORMATION_INDEX["astronaut-bust"])
    }
  }

  /** The globe is drawn around the floating astronaut, so both come from one mask. */
  async function loadFloat() {
    const float = await loadImageField(assets.floatMask, assets.floatLum, 512)
    if (disposed) return
    if (float) {
      buildAstronautFloat(targets[FORMATION_INDEX["astronaut-float"]], count, createRng(23), float)
      finishBuild(FORMATION_INDEX["astronaut-float"])
    } else {
      fallbackFill(FORMATION_INDEX["astronaut-float"])
    }
    buildGlobe(targets[FORMATION_INDEX.globe], count, createRng(29), float as ImageField | null)
    finishBuild(FORMATION_INDEX.globe)
  }

  /** Called after every section scan: start the loads this page needs. */
  function ensureFormations() {
    if (disposed) return
    // procedural shapes: cheap, built synchronously the first time they are needed
    const L = FORMATION_INDEX.leman
    const H = FORMATION_INDEX.helix
    const O = FORMATION_INDEX.orbits
    const R = FORMATION_INDEX.ridge
    if (present[R] && !built[R]) {
      buildRidge(targets[R], count, createRng(30))
      finishBuild(R)
    }
    if (present[L] && !built[L]) {
      buildLeman(targets[L], count, createRng(24), lemanDirections, lemanThin)
      finishBuild(L)
    }
    if (present[H] && !built[H]) {
      buildHelix(targets[H], count, createRng(26))
      finishBuild(H)
    }
    if (present[O] && !built[O]) {
      buildOrbits(targets[O], count, createRng(27))
      finishBuild(O)
    }
    const P = FORMATION_INDEX.portrait
    const B = FORMATION_INDEX["astronaut-bust"]
    const F = FORMATION_INDEX["astronaut-float"]
    const G = FORMATION_INDEX.globe
    if (present[P] && !built[P] && !requested[P]) {
      requested[P] = true
      loadPortrait()
        .catch(() => fallbackFill(P))
        .finally(() => {
          if (!disposed) particleStore.set({ engineReady: true })
        })
    }
    if (present[B] && !built[B] && !requested[B]) {
      requested[B] = true
      loadBust().catch(() => fallbackFill(B))
    }
    if ((present[F] || present[G]) && !built[G] && !requested[F]) {
      requested[F] = true
      loadFloat().catch(() => fallbackFill(F))
    }
  }

  /* ---------------- input ---------------- */

  let pointerTX = 9
  let pointerTY = 9
  let pointerActive = 0
  let pX = 9
  let pY = 9
  let pOn = 0
  let parX = 0
  let parY = 0
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return
    const nx = (e.clientX / vw) * 2 - 1
    const ny = 1 - (e.clientY / vh) * 2
    pointerTX = nx * aspect
    pointerTY = ny
    if (pointerActive === 0) {
      pX = pointerTX
      pY = pointerTY
    }
    pointerActive = 1
  }
  const onPointerLeave = () => {
    pointerActive = 0
    touchActive = 0
  }
  // Touch has no hover: while a finger is down it moves the portrait's light
  // (and the head follows it); on release both drift back to the default.
  // The glow and the push stay mouse only, as before.
  let touchActive = 0
  let touchX = 0
  let touchY = 0
  const onTouchPointer = (e: PointerEvent) => {
    if (e.pointerType !== "touch") return
    touchX = ((e.clientX / vw) * 2 - 1) * aspect
    touchY = 1 - (e.clientY / vh) * 2
    touchActive = 1
  }
  const onTouchEnd = (e: PointerEvent) => {
    if (e.pointerType === "touch") touchActive = 0
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  let resizeTimer: ReturnType<typeof setTimeout> | null = null
  let lastWidth = vw
  const onResize = () => {
    const widthChanged = stageW() !== lastWidth
    // mobile URL-bar show/hide leaves the stage size alone: keep layout stable
    if (!widthChanged && stageH() === vh) return
    lastWidth = stageW()
    resizeRenderer()
    applyLayout()
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(measure, 150)
  }

  let scanTimer: ReturnType<typeof setTimeout> | null = null
  const mutation = new MutationObserver(() => {
    if (scanTimer) clearTimeout(scanTimer)
    scanTimer = setTimeout(scanSections, 120)
  })
  mutation.observe(document.body, { childList: true, subtree: true })

  let measureTimer: ReturnType<typeof setTimeout> | null = null
  const bodyResize = new ResizeObserver(() => {
    if (measureTimer) clearTimeout(measureTimer)
    measureTimer = setTimeout(measure, 100)
  })
  bodyResize.observe(document.body)
  // the stage can still be hidden when the engine starts: refit once it has a size
  const stageResize = new ResizeObserver(() => onResize())
  stageResize.observe(canvas)
  // the web font changes every label's width: refit the star map once it is in
  document.fonts?.ready.then(() => {
    if (!disposed) measure()
  })

  const onContextLost = (e: Event) => {
    e.preventDefault()
    stop()
    opts.onContextLost?.()
  }
  canvas.addEventListener("webglcontextlost", onContextLost)

  window.addEventListener("pointermove", onPointerMove, { passive: true })
  window.addEventListener("pointerdown", onTouchPointer, { passive: true })
  window.addEventListener("pointermove", onTouchPointer, { passive: true })
  window.addEventListener("pointerup", onTouchEnd, { passive: true })
  window.addEventListener("pointercancel", onTouchEnd, { passive: true })
  document.addEventListener("pointerleave", onPointerLeave)
  window.addEventListener("blur", onPointerLeave)
  window.addEventListener("resize", onResize)

  /* ---------------- frame loop ---------------- */

  const READY_VARS = FORMATIONS.map((n) => `--${n}-ready`)
  const lastReady = new Float32Array(FORMATION_COUNT).fill(-1)
  const mRaw = new Float32Array(FORMATION_COUNT)
  let ridgeBorn = -1
  let ridgeSection: Section | null = null
  const proj = new THREE.Vector3()
  let graphActive = false

  let raf = 0
  let last = performance.now()
  let time = 0
  let lastScroll = window.scrollY
  let turb = 0
  let introStart = -1
  let loadSmoothed = 0
  let panX = 0
  let panY = 0
  let helixSection: Section | null = null
  let helixSpin = 0
  let helixSlide = 0

  // Adaptive pixel ratio: if frames keep running slow (under ~45 fps for two
  // seconds of active rendering), step the pixel ratio down, never below 1.
  let slowTime = 0
  let sampleTime = 0
  function adaptQuality(rawDt: number) {
    if (rawDt > 0.25 || dprCap <= dprFloor) return // tab switch or already at the floor
    sampleTime += rawDt
    if (rawDt > 0.022) slowTime += rawDt
    if (sampleTime < 2) return
    const slow = slowTime / sampleTime > 0.5
    sampleTime = 0
    slowTime = 0
    if (!slow || (window.devicePixelRatio || 1) <= 1) return
    dprCap = Math.max(dprFloor, dprCap - 0.25)
    resizeRenderer()
  }

  let skipFrame = false
  let suit = 0
  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    // pages without formations (legal, work detail): render at half rate
    if (!sections.length) {
      skipFrame = !skipFrame
      if (skipFrame) return
    }
    const rawDt = (now - last) / 1000
    const dt = Math.min(0.05, Math.max(0.0001, rawDt))
    last = now
    adaptQuality(sections.length ? rawDt : rawDt / 2)
    time += dt
    uniforms.uTime.value = time

    // intro + preloader
    const st = particleStore.get()
    if (introStart < 0 && st.engineReady && (st.preloaderDone || !st.preloaderMounted)) introStart = now
    const introT = introStart < 0 ? 0 : clamp01((now - introStart) / 2400)
    const intro = easeInOut(introT)
    if (st.preloaderMounted) {
      loadSmoothed += (st.loadProgress - loadSmoothed) * (1 - Math.exp(-dt * 10))
      uniforms.uLoad.value = loadSmoothed
      uniforms.uStar.value = introStart < 0 ? 1 : 1 - clamp01((now - introStart) / 1500)
    } else {
      uniforms.uStar.value = 0
    }

    // scroll velocity -> turbulence (about 150 ms smoothing)
    const sy = window.scrollY
    const v = Math.abs(sy - lastScroll) / vh / dt
    lastScroll = sy
    const tTarget = Math.min(1, v / 2.5)
    turb += (tTarget - turb) * (1 - Math.exp(-dt / 0.15))
    uniforms.uTurb.value = turb

    // timeline
    mRaw.fill(0)
    const pos = sy / vh
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i]
      const t = clamp01((pos - s.start) / s.len)
      const m = smooth(t)
      if (m > mRaw[s.k]) mRaw[s.k] = m
    }
    // hero copy: with the preloader it waits for the intro swirl; without it
    // (phones, tablets, return visits) it is visible from the first paint
    const heroRaw = mRaw[0]
    mRaw[0] *= intro
    // the ridge is the first thing on its page: it assembles once on opening
    const R = FORMATION_INDEX.ridge
    if (built[R] && mRaw[R] > 0) {
      if (ridgeBorn < 0) ridgeBorn = time
      mRaw[R] *= clamp01((time - ridgeBorn - 0.2) / 2.8)
      // nothing follows it on the page, so it dissolves once its section scrolls off
      const el = ridgeSection?.el
      if (el) mRaw[R] *= smooth(clamp01((el.getBoundingClientRect().bottom / vh - 0.5) / 0.5))
    }
    // the portrait easter egg suits up on the spot, with no scrolling
    suit += ((st.suitUp ? 1 : 0) - suit) * (1 - Math.exp(-dt * 2.4))
    if (suit > 0.001) mRaw[FORMATION_INDEX["astronaut-bust"]] = Math.max(mRaw[FORMATION_INDEX["astronaut-bust"]], smooth(suit))
    for (let k = 0; k < FORMATION_COUNT; k++) mUniform[k] = built[k] ? mRaw[k] : 0

    // readiness CSS vars: formed, and not yet leaving for the next shape
    let graphReady = 0
    for (let k = 0; k < FORMATION_COUNT; k++) {
      if (!present[k]) continue
      const nk = nextPresent[k]
      const leaving = nk >= 0 ? clamp01(mRaw[nk] / 0.15) : 0
      const mk = k === 0 && !st.preloaderMounted ? heroRaw : mRaw[k]
      const ready = clamp01((mk - 0.85) / 0.15) * (1 - leaving)
      if (k === FORMATION_INDEX.graph) graphReady = ready
      const prev = lastReady[k]
      if (Math.abs(ready - prev) > 0.004 || ((ready === 0 || ready === 1) && ready !== prev)) {
        lastReady[k] = ready
        root.style.setProperty(READY_VARS[k], ready.toFixed(3))
      }
    }
    const active = graphReady > 0.35
    if (active !== graphActive) {
      graphActive = active
      if (active) root.setAttribute("data-graph-active", "")
      else root.removeAttribute("data-graph-active")
    }

    // contact outline follows its CTA
    if (contactTarget && mRaw[FORMATION_INDEX.contact] > 0) {
      // cached position: no layout read after the style writes above
      const cx = contactDocCx
      const cy = contactDocCy - sy
      const k = FORMATION_INDEX.contact * 3
      offUniform[k] = ((cx - vw / 2) / vh) * 2
      offUniform[k + 1] = -((cy - vh / 2) / vh) * 2
      // the helmet above the box stays on screen: it slides down toward the
      // box (at most to perch on its top edge) instead of leaving through the
      // top of the viewport, as it did on phones and tablets with a tall form
      const boxTop = offUniform[k + 1] + contactH / 2
      const starAt = offUniform[k + 1] + contactStar
      const limit = 1 - 0.14
      uniforms.uContactStar.value = starAt > limit ? Math.max(limit, boxTop - 0.1) - starAt : 0
    }

    // helix: scrolling through its section turns it about its own axis and
    // slides it along that axis; a slow idle turn keeps it alive when still
    if (helixSection && mRaw[FORMATION_INDEX.helix] > 0) {
      const into = pos - helixSection.start
      helixSpin += (into * 2.6 - helixSpin) * (1 - Math.exp(-dt * 6))
      helixSlide += (into * 0.09 - helixSlide) * (1 - Math.exp(-dt * 6))
      uniforms.uHelix.value.x = helixSpin + time * 0.14
      uniforms.uHelix.value.y = helixSlide
    }

    // globe sway
    uniforms.uGlobeSpin.value = Math.sin(time * 0.16) * 0.38

    // pointer: lerped position, strength springs in and out
    pX += (pointerTX - pX) * (1 - Math.exp(-dt * 9))
    pY += (pointerTY - pY) * (1 - Math.exp(-dt * 9))
    pOn += (pointerActive - pOn) * (1 - Math.exp(-dt * (pointerActive ? 6 : 2.5)))
    uniforms.uPointer.value.set(pX, pY)
    uniforms.uPointerOn.value = pOn

    if (mUniform[FORMATION_INDEX.portrait] > 0) lightPortrait(dt)

    // gentle parallax of the whole field
    const tx = pointerActive ? pX / Math.max(aspect, 0.5) : 0
    const ty = pointerActive ? pY : 0
    parX += (tx - parX) * (1 - Math.exp(-dt * 2))
    parY += (ty - parY) * (1 - Math.exp(-dt * 2))
    points.rotation.y = parX * 0.05
    points.rotation.x = -parY * 0.035

    // graph pan toward the focused star
    panX += (panTargetX - panX) * (1 - Math.exp(-dt * 3))
    panY += (panTargetY - panY) * (1 - Math.exp(-dt * 3))
    uniforms.uGraphPan.value.set(panX, panY)

    scene.updateMatrixWorld()
    if (graphIds.length && (mUniform[FORMATION_INDEX.graph] > 0.01 || graphActive)) projectLabels(graphReady)
    if (lemanLabels.length && mUniform[FORMATION_INDEX.leman] > 0.01) projectLemanLabels()

    renderer.render(scene, camera)
  }

  /*
   * Portrait light. The key light sits in front of the face at the pointer
   * (the glowing dot) or the finger, and drifts back to a soft key from the
   * top left when there is neither. The shader does the shading per particle.
   */
  let lightX = NaN
  let lightY = 0
  let lightZ = 0
  function lightPortrait(dt: number) {
    const o = FORMATION_INDEX.portrait * 3
    const ox = offUniform[o]
    const oy = offUniform[o + 1]
    const sc = sclUniform[o]
    const head = uniforms.uHeadCenter.value
    let tx: number
    let ty: number
    let tz: number
    let follow = 0
    if (pointerActive || touchActive) {
      tx = pointerActive ? pX : touchX
      ty = pointerActive ? pY : touchY
      tz = sc * 1.25
      follow = 1
    } else {
      // default key: top left of the head, a little further out
      tx = ox + (head.x - 1.1) * sc
      ty = oy + (head.y + 1.0) * sc
      tz = sc * 1.5
    }
    const kl = reduceMotion || Number.isNaN(lightX) ? 1 : 1 - Math.exp(-dt * (follow ? 7 : 2))
    if (Number.isNaN(lightX)) {
      lightX = tx
      lightY = ty
      lightZ = tz
    }
    lightX += (tx - lightX) * kl
    lightY += (ty - lightY) * kl
    lightZ += (tz - lightZ) * kl
    uniforms.uLight.value.set(lightX, lightY, lightZ)

    // The head no longer turns towards the pointer (David turned it off); only the light follows.
    uniforms.uHeadYaw.value = 0
    uniforms.uHeadPitch.value = 0
  }

  function projectLabels(visible: number) {
    const listen = hasNodeScreenListeners()
    let changed = false
    const pxPerWorld = vh / 2
    const unit = Math.min(graphSx, graphSy)
    for (let i = 0; i < graphIds.length; i++) {
      const id = graphIds[i]
      const el = graphLabelElements.get(id)
      if (!el && !listen) continue
      proj.set(nodeUniform[i * 3] - panX + graphOx, nodeUniform[i * 3 + 1] - panY + graphOy, nodeUniform[i * 3 + 2])
      proj.applyMatrix4(points.matrixWorld).project(camera)
      const x = (proj.x * 0.5 + 0.5) * vw
      const y = (0.5 - proj.y * 0.5) * vh
      const r = graphR[i] * unit * pxPerWorld
      if (el && (Math.abs(x - lastLabelX[i]) > 0.25 || Math.abs(y - lastLabelY[i]) > 0.25)) {
        lastLabelX[i] = x
        lastLabelY[i] = y
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
        el.style.setProperty("--node-r", `${r.toFixed(1)}px`)
      }
      if (listen && publishNodeScreen(id, x, y, r, visible)) changed = true
    }
    if (changed) flushNodeScreens()
  }

  function start() {
    if (raf || disposed) return
    last = performance.now()
    lastScroll = window.scrollY
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }
  const onVisibility = () => {
    if (document.hidden) stop()
    else start()
  }
  document.addEventListener("visibilitychange", onVisibility)

  /* ---------------- boot ---------------- */

  resizeRenderer()
  scanSections()
  root.setAttribute("data-particles", "on")
  // No portrait on this page: nothing to wait for. Otherwise ensureFormations()
  // (run by scanSections) flips engineReady once the portrait is in.
  if (!present[FORMATION_INDEX.portrait]) particleStore.set({ engineReady: true })
  if (!document.hidden) start()

  return {
    dispose() {
      disposed = true
      stop()
      unsubscribe()
      mutation.disconnect()
      bodyResize.disconnect()
      stageResize.disconnect()
      if (resizeTimer) clearTimeout(resizeTimer)
      if (scanTimer) clearTimeout(scanTimer)
      if (measureTimer) clearTimeout(measureTimer)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerdown", onTouchPointer)
      window.removeEventListener("pointermove", onTouchPointer)
      window.removeEventListener("pointerup", onTouchEnd)
      window.removeEventListener("pointercancel", onTouchEnd)
      document.removeEventListener("pointerleave", onPointerLeave)
      window.removeEventListener("blur", onPointerLeave)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
      canvas.removeEventListener("webglcontextlost", onContextLost)
      for (const name of READY_VARS) root.style.removeProperty(name)
      root.removeAttribute("data-particles")
      root.removeAttribute("data-graph-active")
      graphLabelElements.forEach((el) => {
        el.style.transform = ""
        el.style.removeProperty("--node-r")
      })
      for (const l of lemanLabels) l.el.style.transform = ""
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      particleStore.set({ engineReady: false })
    },
  }
}
