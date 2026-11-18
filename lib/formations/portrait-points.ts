/**
 * The portrait as baked dot positions (scripts/portrait-points.mjs), so the
 * site never ships the photo. Browser-only (fetch + DecompressionStream).
 */
import type { HeadFrame } from "./image"
import type { Rng } from "./random"

export type PortraitPoints = {
  count: number
  size: number
  head: HeadFrame | null
  /** source pixel index per point, in weight order */
  index: Uint32Array
  bright: Uint8Array
  depth: Int8Array
  nx: Int8Array
  ny: Int8Array
}

async function gunzip(buf: ArrayBuffer): Promise<ArrayBuffer> {
  const bytes = new Uint8Array(buf)
  // a host that serves it with Content-Encoding has already unpacked it
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return buf
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))
  return new Response(stream).arrayBuffer()
}

/** Resolves to null when the file is missing or unreadable, so callers can skip the formation. */
export async function loadPortraitPoints(url: string): Promise<PortraitPoints | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = await gunzip(await res.arrayBuffer())
    const view = new DataView(buf)
    const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))
    if (magic !== "RFP1") return null
    const count = view.getUint32(4, true)
    const size = view.getUint16(8, true)
    const rx = view.getFloat32(20, true)
    const head =
      rx > 0
        ? { cx: view.getFloat32(12, true), cy: view.getFloat32(16, true), rx, ry: view.getFloat32(24, true) }
        : null
    const bytes = new Uint8Array(buf)
    const index = new Uint32Array(count)
    let o = 28
    let at = 0
    for (let p = 0; p < count; p++) {
      let d = 0
      let shift = 0
      let b: number
      do {
        b = bytes[o++]
        d |= (b & 0x7f) << shift
        shift += 7
      } while (b & 0x80)
      at += d
      index[p] = at
    }
    const bright = bytes.slice(o, o + count)
    o += count
    const depth = new Int8Array(buf.slice(o, o + count))
    o += count
    const nx = new Int8Array(buf.slice(o, o + count))
    o += count
    const ny = new Int8Array(buf.slice(o, o + count))
    return { count, size, head, index, bright, depth, nx, ny }
  } catch {
    return null
  }
}

/**
 * Writes `count` portrait particles into out (vec4) and their surface normals
 * into normalOut (vec2). Takes an evenly spaced subset of the baked points so
 * fewer particles still spread evenly, then shuffles them so particle order
 * stays random for the morphs.
 */
export function buildPortraitFromPoints(
  pts: PortraitPoints,
  out: Float32Array,
  count: number,
  rng: Rng,
  normalOut?: Float32Array,
): HeadFrame | null {
  const pick = new Uint32Array(count)
  for (let i = 0; i < count; i++) pick[i] = Math.min(pts.count - 1, Math.floor(((i + 0.5) * pts.count) / count))
  for (let j = count - 1; j > 0; j--) {
    const k = Math.floor(rng() * (j + 1))
    const t = pick[j]
    pick[j] = pick[k]
    pick[k] = t
  }
  const s = pts.size
  for (let p = 0; p < count; p++) {
    const q = pick[p]
    const lo = pts.index[q]
    const o = p * 4
    out[o] = (((lo % s) + rng()) / s) * 2 - 1
    out[o + 1] = 1 - ((((lo / s) | 0) + rng()) / s) * 2
    out[o + 2] = pts.depth[q] / 400
    out[o + 3] = pts.bright[q] / 160
    if (normalOut) {
      normalOut[p * 2] = pts.nx[q] / 127
      normalOut[p * 2 + 1] = pts.ny[q] / 127
    }
  }
  return pts.head
}
