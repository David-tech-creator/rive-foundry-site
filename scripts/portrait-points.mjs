/**
 * Bakes the particle portrait into public/portrait/david-points.bin, so the
 * site ships dot positions and never the photo itself.
 *
 *   node scripts/portrait-points.mjs
 *
 * Reads assets/portrait-src/david-cutout.png (800 px, not published), stipples
 * it with the same code the engine uses, and writes the picks in weight order:
 * any evenly spaced subset is still stratified, so phones (fewer particles)
 * keep an even spread. lib/formations/portrait-points.ts reads the file.
 *
 * Layout (little endian), gzipped as a whole:
 *   "RFP1", u32 count, u16 size, u16 0, f32 head cx, cy, rx, ry
 *   then columns of `count`: pixel index deltas (varint), brightness (u8 / 160),
 *   z (i8 / 400), normal x, normal y (i8 / 127)
 */
import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { registerHooks } from "node:module"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SRC = path.join(ROOT, "assets/portrait-src/david-cutout.png")
const OUT = path.join(ROOT, "public/portrait/david-points.bin")
const SIZE = 800
/** The most particles any device draws (ParticleStage desktop count). */
const COUNT = 130000

// lib/formations imports siblings without an extension; Node strips the types
// itself, it only needs the ".ts" added
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts") && !path.extname(specifier)) {
      return next(`${specifier}.ts`, context)
    }
    return next(specifier, context)
  },
})
const { findHead, stippleImage, surfaceNormals } = await import("../lib/formations/image.ts")
const { createRng } = await import("../lib/formations/random.ts")

const { data } = await sharp(SRC)
  .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const n = SIZE * SIZE
const mask = new Float32Array(n)
const lum = new Float32Array(n)
for (let i = 0; i < n; i++) {
  const o = i * 4
  const a = data[o + 3] / 255
  mask[i] = a
  lum[i] = ((0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255) * a
}
const field = { w: SIZE, h: SIZE, mask, lum }

const head = findHead(field)
const normals = surfaceNormals(field, head)
const pts = new Float32Array(COUNT * 4)
const nrm = new Float32Array(COUNT * 2)
stippleImage(field, pts, 0, COUNT, createRng(21), {
  normals,
  normalOut: nrm,
  ordered: true,
  // twice the density on the face; dimmer dots draw smaller, so the extra
  // ones add detail instead of burning white
  focus: head ? { ...head, gain: 2 } : undefined,
  // steeper gamma and stronger edges so eyes, brows and mouth carry the
  // dots; a lower base dims flat areas like the shirt
  floor: 0.04,
  gamma: 2.3,
  edgeGain: 1.2,
  lumCap: 0.78,
  depth: 0.18,
  brightBase: 0.12,
  brightGain: 0.75,
})

const clampByte = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)))
const deltas = []
const bright = new Uint8Array(COUNT)
const depth = new Int8Array(COUNT)
const nx = new Int8Array(COUNT)
const ny = new Int8Array(COUNT)
let prev = 0
for (let p = 0; p < COUNT; p++) {
  const x = pts[p * 4]
  const y = pts[p * 4 + 1]
  const px = Math.min(SIZE - 1, Math.floor(((x + 1) / 2) * SIZE))
  const py = Math.min(SIZE - 1, Math.floor(((1 - y) / 2) * SIZE))
  // float32 rounding can put a dot on a pixel edge one pixel back; keep the order
  const idx = Math.max(prev, py * SIZE + px)
  let d = idx - prev
  prev = idx
  while (d >= 0x80) {
    deltas.push((d & 0x7f) | 0x80)
    d >>>= 7
  }
  deltas.push(d)
  bright[p] = clampByte(pts[p * 4 + 3] * 160, 0, 255)
  depth[p] = clampByte(pts[p * 4 + 2] * 400, -127, 127)
  nx[p] = clampByte(nrm[p * 2] * 127, -127, 127)
  ny[p] = clampByte(nrm[p * 2 + 1] * 127, -127, 127)
}

const header = Buffer.alloc(28)
header.write("RFP1", 0, "ascii")
header.writeUInt32LE(COUNT, 4)
header.writeUInt16LE(SIZE, 8)
const h = head ?? { cx: 0, cy: 0, rx: 0, ry: 0 }
header.writeFloatLE(h.cx, 12)
header.writeFloatLE(h.cy, 16)
header.writeFloatLE(h.rx, 20)
header.writeFloatLE(h.ry, 24)

const raw = Buffer.concat([
  header,
  Buffer.from(deltas),
  Buffer.from(bright.buffer),
  Buffer.from(depth.buffer),
  Buffer.from(nx.buffer),
  Buffer.from(ny.buffer),
])
const gz = zlib.gzipSync(raw, { level: 9 })
fs.writeFileSync(OUT, gz)
console.log(`${path.relative(ROOT, OUT)}: ${COUNT} points, ${raw.length} B raw, ${gz.length} B gzipped`)
