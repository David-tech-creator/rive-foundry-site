/**
 * WebGL layer of the work gallery. Each card's image is drawn as a finely
 * subdivided plane on one transparent canvas laid over the HTML cards. While
 * the row moves, the planes ripple like cloth (a travelling sine along the
 * card width, a soft bulge towards the viewer and a little curl at the edges),
 * all scaled by the smoothed scroll velocity. At rest the bend is 0 and every
 * plane is a flat, pixel-aligned copy of the HTML image under it.
 *
 * The HTML stays the real thing: links, captions, alt text. This module only
 * paints pictures and is loaded with a dynamic import (three.js is already in
 * the particle engine's chunk).
 */
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  WebGLRenderer,
  Vector2,
  Vector4,
} from "three"

const VERT = /* glsl */ `
uniform vec4 uRect;     // x, y, w, h in CSS px, y down, relative to the canvas
uniform vec2 uRes;      // canvas size in CSS px
uniform float uBend;    // -1..1, smoothed scroll velocity
varying vec2 vUv;
varying float vShade;

const float PI = 3.14159265;

void main() {
  vUv = uv;
  vec2 p = uRect.xy + vec2(uv.x, 1.0 - uv.y) * uRect.zw;

  // where this vertex is on screen, so a card changes shape as it travels
  float sx = p.x / uRes.x;
  float b = uBend;

  // cloth ripple: the card waves up and down along its width
  float ph = sx * PI * 2.2 + uv.x * PI * 0.6;
  p.y += sin(ph) * uRect.w * 0.035 * b;

  // soft bulge towards the viewer, strongest mid-card, plus a curl at the
  // trailing edge that lags behind the motion
  float edge = b > 0.0 ? uv.x : 1.0 - uv.x;
  float z = sin(uv.x * PI) * 0.05 * abs(b) + pow(edge, 3.0) * 0.08 * abs(b);
  z *= uRect.z;

  // a simple perspective divide around the canvas centre
  float f = uRes.y * 1.6;
  float s = f / (f - z);
  vec2 c = uRes * 0.5;
  p = c + (p - c) * s;

  vShade = 1.0 + cos(ph) * 0.07 * b - z / uRect.z * 0.12;

  vec2 clip = vec2(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uCover;    // object-fit: cover scale
uniform vec4 uRect;
uniform float uDpr;
uniform float uHover;
varying vec2 vUv;
varying float vShade;

void main() {
  vec2 tuv = (vUv - 0.5) * uCover + 0.5;
  vec3 col = texture2D(uTex, tuv).rgb;
  col *= mix(0.9, 1.0, uHover) * vShade;

  // 1px hairline border, the same as the HTML frame's
  vec2 d = min(vUv, 1.0 - vUv) * uRect.zw * uDpr;
  float e = min(d.x, d.y);
  float line = 1.0 - smoothstep(uDpr - 0.5, uDpr + 0.5, e);
  col = mix(col, vec3(1.0), line * mix(0.16, 0.32, uHover));

  gl_FragColor = vec4(col, 1.0);
}
`

export type GalleryCardRect = { x: number; y: number; w: number; h: number; hover: number }

export type GalleryGL = {
  /** True once card i has a texture and is being painted. */
  ready(i: number): boolean
  resize(w: number, h: number): void
  render(rects: GalleryCardRect[], bend: number): void
  dispose(): void
}

export function createGalleryGL(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
  onReady: (i: number) => void,
  onLost: () => void,
): GalleryGL {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  // create the context first: without WebGL, fail quietly here instead of
  // letting three.js log errors (the caller falls back to the plain images)
  const attrs: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    depth: true,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  }
  const context = canvas.getContext("webgl2", attrs)
  if (!context) throw new Error("no webgl2")
  const renderer = new WebGLRenderer({ canvas, context, ...attrs })
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geometry = new PlaneGeometry(1, 1, 48, 12)
  const res = new Vector2(1, 1)
  const maxAniso = renderer.capabilities.getMaxAnisotropy()

  type Card = { mesh: Mesh; mat: ShaderMaterial; tex: Texture; aspect: number } | null
  const cards: Card[] = images.map(() => null)
  const cleanups: Array<() => void> = []
  let disposed = false

  const add = (i: number, img: HTMLImageElement) => {
    const tex = new Texture(img)
    tex.colorSpace = NoColorSpace
    tex.generateMipmaps = true
    tex.minFilter = LinearMipmapLinearFilter
    tex.magFilter = LinearFilter
    tex.anisotropy = Math.min(8, maxAniso)
    tex.needsUpdate = true
    const mat = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTex: { value: tex },
        uRect: { value: new Vector4() },
        uRes: { value: res },
        uBend: { value: 0 },
        uCover: { value: new Vector2(1, 1) },
        uDpr: { value: dpr },
        uHover: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new Mesh(geometry, mat)
    mesh.frustumCulled = false
    mesh.visible = false
    scene.add(mesh)
    cards[i] = { mesh, mat, tex, aspect: img.naturalWidth / img.naturalHeight }
    onReady(i)
  }

  images.forEach((img, i) => {
    // Draw from a plain copy of the picked srcset candidate: the <img>
    // reports a density-corrected naturalWidth that does not match its
    // bitmap, which breaks the texture upload. The copy comes from cache.
    const make = () => {
      if (cards[i] || !img.currentSrc) return
      const src = new Image()
      src.decoding = "async"
      src.src = img.currentSrc
      src
        .decode()
        .then(() => {
          if (disposed || cards[i]) return
          add(i, src)
        })
        .catch(() => {})
    }
    if (img.complete && img.naturalWidth) make()
    else {
      img.addEventListener("load", make, { once: true })
      cleanups.push(() => img.removeEventListener("load", make))
    }
  })

  const lost = (e: Event) => {
    e.preventDefault()
    onLost()
  }
  canvas.addEventListener("webglcontextlost", lost)

  return {
    ready: (i) => !!cards[i],
    resize(w, h) {
      res.set(Math.max(1, w), Math.max(1, h))
      renderer.setSize(w, h, false)
    },
    render(rects, bend) {
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i]
        const r = rects[i]
        if (!c || !r) continue
        // skip planes that are well off the canvas
        const off = r.x + r.w < -r.w * 0.2 || r.x > res.x + r.w * 0.2
        c.mesh.visible = !off
        if (off) continue
        const u = c.mat.uniforms
        ;(u.uRect.value as Vector4).set(r.x, r.y, r.w, r.h)
        u.uBend.value = bend
        u.uHover.value = r.hover
        // object-fit: cover
        const boxAspect = r.w / r.h
        const cover = u.uCover.value as Vector2
        if (c.aspect > boxAspect) cover.set(boxAspect / c.aspect, 1)
        else cover.set(1, c.aspect / boxAspect)
      }
      renderer.render(scene, camera)
    },
    dispose() {
      disposed = true
      cleanups.forEach((f) => f())
      canvas.removeEventListener("webglcontextlost", lost)
      for (const c of cards) {
        if (!c) continue
        c.tex.dispose()
        c.mat.dispose()
      }
      geometry.dispose()
      renderer.dispose()
    },
  }
}
