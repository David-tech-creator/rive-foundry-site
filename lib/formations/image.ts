/**
 * Image-driven formations: sample particle positions from a mask and size /
 * brightness from a luminance image, so a photo reads like a stippled engraving.
 * Browser-only (uses a 2D canvas); call from client code.
 */
import { gauss, type Rng } from "./random"

export type ImageField = {
  w: number
  h: number
  /** 0..1 coverage */
  mask: Float32Array
  /** 0..1 luminance, already multiplied by alpha */
  lum: Float32Array
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image failed: ${url}`))
    img.src = url
  })
}

function readPixels(img: HTMLImageElement, size: number): Uint8ClampedArray {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new Error("2d context unavailable")
  // "contain" fit, centred
  const s = Math.min(size / img.naturalWidth, size / img.naturalHeight)
  const dw = img.naturalWidth * s
  const dh = img.naturalHeight * s
  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh)
  return ctx.getImageData(0, 0, size, size).data
}

/**
 * Loads a mask (white = particle) and an optional luminance image.
 * Resolves to null when the mask cannot be loaded, so callers can skip the
 * formation gracefully.
 */
export async function loadImageField(maskUrl: string, lumUrl?: string, size = 360): Promise<ImageField | null> {
  let maskImg: HTMLImageElement
  try {
    maskImg = await loadImage(maskUrl)
  } catch {
    return null
  }
  let lumImg: HTMLImageElement | null = null
  if (lumUrl) {
    try {
      lumImg = await loadImage(lumUrl)
    } catch {
      lumImg = null
    }
  }
  const n = size * size
  const mask = new Float32Array(n)
  const lum = new Float32Array(n)
  const m = readPixels(maskImg, size)
  for (let i = 0; i < n; i++) {
    const o = i * 4
    const a = m[o + 3] / 255
    mask[i] = (Math.max(m[o], m[o + 1], m[o + 2]) / 255) * a
  }
  if (lumImg) {
    const l = readPixels(lumImg, size)
    for (let i = 0; i < n; i++) {
      const o = i * 4
      const a = l[o + 3] / 255
      lum[i] = ((0.2126 * l[o] + 0.7152 * l[o + 1] + 0.0722 * l[o + 2]) / 255) * a
    }
  } else {
    lum.set(mask)
  }
  return { w: size, h: size, mask, lum }
}

export type StippleOptions = {
  /** weight floor inside the mask, keeps dark regions faintly populated */
  floor?: number
  /** luminance exponent; >1 pushes particles to highlights */
  gamma?: number
  /** how strongly luminance edges (features, silhouette) attract particles */
  edgeGain?: number
  /** z extent derived from luminance */
  depth?: number
  brightBase?: number
  brightGain?: number
  /** output scale (local space is [-1,1] * scale) */
  scale?: number
  /** local offset */
  ox?: number
  oy?: number
  /** add to w (e.g. FLAG) */
  wOffset?: number
  /**
   * Per-pixel surface normals (from `surfaceNormals`). When given, each
   * particle's normal xy is written to normalOut[p * 2]. No random numbers
   * are drawn for it, so positions stay exactly the same.
   */
  normals?: Float32Array
  normalOut?: Float32Array
  /** luminance above this weighs no more than this (keeps a white shirt from taking every dot) */
  lumCap?: number
  /** extra density inside an ellipse in local space (the face), fading out at its edge */
  focus?: { cx: number; cy: number; rx: number; ry: number; gain: number }
  /** keep the picks in weight order (no shuffle), so any evenly spaced subset stays stratified */
  ordered?: boolean
}

/** Writes stippled particles into out[start..end) (vec4 per particle). */
export function stippleImage(field: ImageField, out: Float32Array, start: number, end: number, rng: Rng, opts: StippleOptions = {}) {
  const {
    floor = 0.05,
    gamma = 1.5,
    edgeGain = 1.2,
    depth = 0.16,
    brightBase = 0.32,
    brightGain = 0.85,
    scale = 1,
    ox = 0,
    oy = 0,
    wOffset = 0,
    normals,
    normalOut,
    lumCap = 1,
    focus,
    ordered = false,
  } = opts
  const { w, h, mask, lum } = field
  const n = w * h
  const cdf = new Float64Array(n)
  const edge = new Float32Array(n)
  let total = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      let wt = 0
      if (mask[i] > 0.5) {
        const l = lum[i]
        const xl = x > 0 ? i - 1 : i
        const xr = x < w - 1 ? i + 1 : i
        const yu = y > 0 ? i - w : i
        const yd = y < h - 1 ? i + w : i
        const gl = Math.abs(lum[xr] - lum[xl]) + Math.abs(lum[yd] - lum[yu])
        const gm = Math.abs(mask[xr] - mask[xl]) + Math.abs(mask[yd] - mask[yu])
        const e = Math.min(1, gl * 2.2 + gm * 0.8)
        edge[i] = e
        wt = floor + Math.pow(Math.min(l, lumCap), gamma) + e * edgeGain * 0.35
        if (focus) {
          const fx = ((x + 0.5) / w) * 2 - 1 - focus.cx
          const fy = 1 - ((y + 0.5) / h) * 2 - focus.cy
          const d = (fx / focus.rx) ** 2 + (fy / focus.ry) ** 2
          if (d < 1.6) wt *= 1 + focus.gain * Math.min(1, (1.6 - d) / 0.6)
        }
      }
      total += wt
      cdf[i] = total
    }
  }
  if (total <= 0) {
    for (let p = start; p < end; p++) {
      const o = p * 4
      out[o] = gauss(rng) * 0.3 * scale + ox
      out[o + 1] = gauss(rng) * 0.3 * scale + oy
      out[o + 2] = 0
      out[o + 3] = 0.3 + wOffset
    }
    return
  }
  // stratified: one sample per equal slice of the weight, so the dots spread
  // evenly instead of clumping (it matters most on phones, with fewer dots).
  // The picks are shuffled so particle order stays random for the morphs.
  const m = end - start
  const picks = new Int32Array(m)
  const u = rng()
  let c = 0
  for (let j = 0; j < m; j++) {
    const target = ((j + u) / m) * total
    while (c < n - 1 && cdf[c] < target) c++
    picks[j] = c
  }
  for (let j = ordered ? 0 : m - 1; j > 0; j--) {
    const k = Math.floor(rng() * (j + 1))
    const t = picks[j]
    picks[j] = picks[k]
    picks[k] = t
  }
  for (let p = start; p < end; p++) {
    const lo = picks[p - start]
    const px = lo % w
    const py = (lo / w) | 0
    const l = lum[lo]
    const x = ((px + rng()) / w) * 2 - 1
    const y = 1 - ((py + rng()) / h) * 2
    // gentle dome so the face has volume, plus luminance relief
    const dome = Math.sqrt(Math.max(0, 1 - (x * x + y * y) * 0.9)) * 0.08
    const o = p * 4
    out[o] = x * scale + ox
    out[o + 1] = y * scale + oy
    out[o + 2] = ((l - 0.5) * depth + dome + gauss(rng) * 0.006) * scale
    out[o + 3] = brightBase + brightGain * l + edge[lo] * 0.25 + wOffset
    if (normals && normalOut) {
      normalOut[p * 2] = normals[lo * 2]
      normalOut[p * 2 + 1] = normals[lo * 2 + 1]
    }
  }
}

/* ------------------------------------------------------------------ */
/* Surface for lighting                                                */
/* ------------------------------------------------------------------ */

/** Head ellipse in the field's local space ([-1, 1], y up). */
export type HeadFrame = { cx: number; cy: number; rx: number; ry: number }

/**
 * Finds the head of a centred bust from its mask: the top of the silhouette
 * down to the narrowest row (the neck) in the upper half.
 */
export function findHead(field: ImageField): HeadFrame | null {
  const { w, h, mask } = field
  const left = new Int32Array(h).fill(-1)
  const right = new Int32Array(h).fill(-1)
  let top = -1
  let bottom = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x] <= 0.5) continue
      if (left[y] < 0) left[y] = x
      right[y] = x
    }
    if (left[y] >= 0) {
      if (top < 0) top = y
      bottom = y
    }
  }
  if (top < 0 || bottom - top < 20) return null
  const span = bottom - top
  let neck = -1
  let minW = Infinity
  for (let y = top + Math.round(span * 0.25); y <= top + Math.round(span * 0.55); y++) {
    if (left[y] < 0) continue
    const wd = right[y] - left[y]
    if (wd < minW) {
      minW = wd
      neck = y
    }
  }
  if (neck < 0) return null
  let mid = 0
  let rows = 0
  let half = 0
  for (let y = top; y <= neck; y++) {
    if (left[y] < 0) continue
    mid += (left[y] + right[y] + 1) / 2
    half = Math.max(half, (right[y] - left[y] + 1) / 2)
    rows++
  }
  mid /= Math.max(1, rows)
  return {
    cx: (mid / w) * 2 - 1,
    cy: 1 - ((top + neck) / 2 / h) * 2,
    rx: (half / w) * 2,
    ry: ((neck - top) / 2 / h) * 2,
  }
}

/** In-place separable box blur (running sums), `passes` times. */
function boxBlur(src: Float32Array, w: number, h: number, r: number, passes = 2) {
  const tmp = new Float32Array(src.length)
  const inv = 1 / (r * 2 + 1)
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < h; y++) {
      const row = y * w
      let acc = 0
      for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))]
      for (let x = 0; x < w; x++) {
        tmp[row + x] = acc * inv
        acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)]
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0
      for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]
      for (let y = 0; y < h; y++) {
        src[y * w + x] = acc * inv
        acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]
      }
    }
  }
}

export type SurfaceOptions = {
  /** height of the silhouette "inflation" (rounds the body towards its edges) */
  inflate?: number
  /** mask blur radius for the inflation, as a fraction of the field width */
  inflateR?: number
  /** fine relief from the (blurred) luminance */
  relief?: number
  /** extra ellipsoid over the head, as a fraction of its width */
  dome?: number
}

/**
 * Per-pixel surface normals (xy, z implied: sqrt(1 - x^2 - y^2)) for shading
 * a stippled image as if lit: a height field made of the silhouette rounded
 * towards its edges, an ellipsoid over the head and a little luminance
 * relief, differentiated and normalised. Built once with the formation.
 */
export function surfaceNormals(field: ImageField, head: HeadFrame | null, opts: SurfaceOptions = {}): Float32Array {
  const { inflate = 0.22, inflateR = 0.035, relief = 0.05, dome = 0.75 } = opts
  const { w, h, mask, lum } = field
  const n = w * h
  const body = Float32Array.from(mask)
  boxBlur(body, w, h, Math.max(1, Math.round(w * inflateR)))
  const fine = Float32Array.from(lum)
  boxBlur(fine, w, h, Math.max(1, Math.round(w * 0.006)))
  const height = new Float32Array(n)
  for (let y = 0; y < h; y++) {
    const ly = 1 - ((y + 0.5) / h) * 2
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      let z = Math.sqrt(Math.max(0, body[i])) * inflate + fine[i] * relief
      if (head) {
        const dx = ((x + 0.5) / w) * 2 - 1 - head.cx
        const dy = ly - head.cy
        const q = (dx * dx) / (head.rx * head.rx) + (dy * dy) / (head.ry * head.ry)
        if (q < 1) z += Math.sqrt(1 - q) * head.rx * dome
      }
      height[i] = z
    }
  }
  // smooth the dome's rim and the relief so the shading reads as surface,
  // not as an emboss of the photo
  boxBlur(height, w, h, Math.max(1, Math.round(w * 0.008)))
  const out = new Float32Array(n * 2)
  const px2 = (2 / w) * 2 // two pixels in local units (central difference)
  const maxSlope = 3
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const xl = x > 0 ? i - 1 : i
      const xr = x < w - 1 ? i + 1 : i
      const yu = y > 0 ? i - w : i
      const yd = y < h - 1 ? i + w : i
      let gx = (height[xr] - height[xl]) / px2
      // image rows run down, local y runs up
      let gy = (height[yu] - height[yd]) / px2
      const g = Math.hypot(gx, gy)
      if (g > maxSlope) {
        gx *= maxSlope / g
        gy *= maxSlope / g
      }
      const inv = 1 / Math.sqrt(gx * gx + gy * gy + 1)
      out[i * 2] = -gx * inv
      out[i * 2 + 1] = -gy * inv
    }
  }
  return out
}
