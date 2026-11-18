/**
 * Mission log shaders. One Points cloud; every formation is a per-particle
 * target attribute and the vertex shader folds them together in chain order
 * with per-stage 0..1 uniforms. Nothing moves on the CPU per frame.
 */
import { HELIX_RADIUS, HELIX_TURNS } from "@/lib/formations/shapes"

const glslFloat = (v: number) => (Number.isInteger(v) ? v.toFixed(1) : String(v))

export const FORMATION_COUNT = 10

export const vertexShader = /* glsl */ `
attribute vec4 aRand;   // x phase, y delay, z size seed, w azure flag
attribute vec4 aStar;   // preloader helmet (w = fill order, -1 = not in it)
attribute vec4 aEdge;   // graph: from, to, t, kind (0 sky, 1 disc, 2 strand)
attribute vec4 aF0;     // portrait
attribute vec4 aF1;     // astronaut bust
attribute vec4 aF2;     // floating astronaut
attribute vec4 aF3;     // globe
attribute vec4 aF4;     // leman, or the frontier ridge (never on the same page)
attribute vec4 aF5;     // graph
attribute vec4 aF6;     // DNA helix (axis u, angle, radius, brightness)
attribute vec4 aF7;     // orbits
attribute vec4 aF8;     // contact
attribute vec2 aN;      // portrait surface normal xy (z = sqrt(1 - x^2 - y^2))

uniform float uTime;
uniform float uSize;
uniform float uTurb;
uniform float uStar;
uniform float uLoad;
uniform vec3 uStarX;           // star offset xy, scale z
uniform float uM[10];
uniform vec3 uOff[10];
uniform vec3 uScl[10];
uniform vec2 uPointer;         // world xy at z = 0
uniform float uPointerOn;
uniform float uGlowR;
uniform float uHover;          // hovered node index, -1 for none
uniform vec2 uGraphPan;
uniform float uFlow;
uniform vec3 uNodes[MAX_NODES];
uniform float uGlobeSpin;
uniform float uGlobeTilt;
uniform float uOrbitTilt;
uniform float uContactStar;    // contact: helmet y shift that keeps it on screen
uniform vec3 uHelix;           // helix: spin about its axis, slide along it, screen angle
uniform vec3 uLight;           // key light in world space (pointer xy, z towards the viewer)
uniform float uHeadYaw;        // portrait head turn (radians), eased on the CPU
uniform float uHeadPitch;
uniform vec4 uHeadCenter;      // portrait head ellipse in local space: centre xy, radii xy

const float HELIX_TWIST = ${glslFloat(HELIX_TURNS * Math.PI)};
const float HELIX_R = ${glslFloat(HELIX_RADIUS)};

varying float vB;
varying float vAccent;

vec3 P;
float B;
float F;   // how settled into a shape (0 = loose field)
float T;   // how much in transit

vec3 rotY(vec3 p, float a) {
  float c = cos(a); float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}
vec3 rotX(vec3 p, float a) {
  float c = cos(a); float s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}
vec3 rotZ(vec3 p, float a) {
  float c = cos(a); float s = sin(a);
  return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
}

// Lambert from the key light, plus a soft ambient (never black) and a faint
// rim on the edges that turn away from it. Light comes in world space and is
// taken into the formation's local space. About 1 for the default key on a
// front-facing surface, so the portrait keeps its overall brightness.
float lit(vec3 p, vec3 n, vec3 off, vec3 scl) {
  vec3 l = normalize((uLight - off) / scl - p);
  float lam = max(dot(n, l), 0.0);
  float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.0);
  // capped a little above 1 so a lit edge never tips into the azure accent
  return min(0.52 + 0.68 * lam + rim * 0.16 * (1.0 - lam), 1.05);
}

vec3 unpackNormal(vec2 xy) {
  return vec3(xy, sqrt(max(0.0, 1.0 - dot(xy, xy))));
}

// Staggered, swirling arrival: each particle has its own delay, and the
// target is turned around the formation's vertical axis until it lands.
void morph(vec3 tgt, float tb, float m, vec3 off, vec3 scl) {
  if (m <= 0.0) return;
  float l = clamp(m * 1.4 - aRand.y * 0.4, 0.0, 1.0);
  l = l * l * (3.0 - 2.0 * l);
  vec3 t = rotY(tgt * scl, (1.0 - l) * (1.1 + aRand.x * 0.7)) + off;
  P = mix(P, t, l);
  B = mix(B, tb, l);
  F = mix(F, 1.0, l);
  T = max(T * (1.0 - l), l * (1.0 - l) * 4.0);
}

void main() {
  P = position;
  B = 0.28 + 0.32 * aRand.z * aRand.z;
  B *= 0.7 + 0.3 * sin(uTime * (0.6 + aRand.x * 1.8) + aRand.x * 40.0);
  F = 0.0;
  T = 0.0;

  // 0. preloader helmet, fills from the bottom up with the load counter
  if (aStar.w >= 0.0 && uStar > 0.0) {
    float s = uStar * smoothstep(aStar.w - 0.04, aStar.w + 0.02, uLoad);
    morph(aStar.xyz, 1.45, s, vec3(uStarX.xy, 0.0), vec3(uStarX.z));
  }

  // 1. portrait: the head turns towards the pointer and the pointer lights it.
  // For the turn the head is given its real roundness (an ellipsoid over the
  // shallow relief), so the face swings round its centre instead of sliding;
  // the neck follows halfway and the shoulders stay put.
  if (uM[0] > 0.0) {
    vec3 p0 = aF0.xyz;
    vec3 n0 = unpackNormal(aN.xy);
    vec2 hd = (p0.xy - uHeadCenter.xy) / uHeadCenter.zw;
    float hw = smoothstep(-1.5, -0.9, hd.y);
    if (hw > 0.0 && (uHeadYaw != 0.0 || uHeadPitch != 0.0)) {
      float bulge = sqrt(max(0.0, 1.0 - dot(hd, hd))) * uHeadCenter.z * 0.9;
      vec3 c = vec3(uHeadCenter.xy, 0.0);
      vec3 q = vec3(p0.xy, p0.z + bulge) - c;
      p0 = rotX(rotY(q, uHeadYaw * hw), uHeadPitch * hw) + c;
      p0.z -= bulge;
      n0 = rotX(rotY(n0, uHeadYaw * hw), uHeadPitch * hw);
    }
    morph(p0, aF0.w * lit(p0, n0, uOff[0], uScl[0]), uM[0], uOff[0], uScl[0]);
  }
  // 2. astronaut bust, 3. floating astronaut
  morph(aF1.xyz, aF1.w, uM[1], uOff[1], uScl[1]);
  morph(aF2.xyz, aF2.w, uM[2], uOff[2], uScl[2]);

  // 4. globe: sways around the polar axis, tilted so Geneva faces us
  if (uM[3] > 0.0) {
    vec3 g = aF3.xyz;
    float gb = aF3.w;
    if (gb < 2.0) {
      g = rotX(rotY(g, uGlobeSpin), uGlobeTilt);
      gb *= 0.25 + 0.75 * smoothstep(-0.4, 0.7, g.z);
    } else {
      gb -= 2.0;
    }
    morph(g, gb, uM[3], uOff[3], uScl[3]);
  }

  // 5. Lac Leman
  morph(aF4.xyz, aF4.w, uM[4], uOff[4], uScl[4]);

  // 6. constellation graph: strands flow toward the centre
  if (uM[5] > 0.0) {
    vec3 g = aF5.xyz;
    float gb = aF5.w;
    if (aEdge.w > 1.5) {
      int ia = int(aEdge.x + 0.5);
      int ib = int(aEdge.y + 0.5);
      vec3 na = uNodes[ia];
      vec3 nb = uNodes[ib];
      float tt = fract(aEdge.z + uTime * uFlow * (0.5 + aRand.x));
      vec2 d = nb.xy - na.xy;
      vec2 perp = normalize(vec2(-d.y, d.x) + 1e-5);
      g = mix(na, nb, tt);
      g.xy += perp * (fract(aRand.x * 113.7) - 0.5) * (0.008 + uTurb * 0.03);
      gb *= 0.6 + 0.4 * sin(tt * 22.0 - uTime * 2.4 + aRand.x * 6.2831);
    }
    if (aEdge.w > 0.5) {
      float isOn = step(-0.5, uHover) * (1.0 - step(0.5, min(abs(aEdge.x - uHover), abs(aEdge.y - uHover))));
      float dim = step(-0.5, uHover) * (1.0 - isOn);
      gb *= 1.0 + isOn * 1.6 - dim * 0.45;
    }
    g.xy -= uGraphPan;
    morph(g, gb, uM[5], uOff[5], uScl[5]);
  }

  // 7. DNA double helix: scroll turns it about its own axis and slides it
  // along that axis (whole turns, so the wrap is seamless), then the axis is
  // laid diagonally across the screen
  if (uM[6] > 0.0) {
    float u = fract(aF6.x * 0.5 + 0.5 + uHelix.y) * 2.0 - 1.0;
    float a = aF6.y + aF6.x * HELIX_TWIST + uHelix.x;
    vec3 h = vec3(u, aF6.z * cos(a), aF6.z * sin(a));
    // the far side is dimmer and the ends fade out, so the wrap never shows
    float hb = aF6.w * (0.38 + 0.62 * smoothstep(-HELIX_R, HELIX_R, h.z));
    hb *= smoothstep(1.0, 0.72, abs(u));
    // a small helix (phones) packs the same particles into less space: dim
    // it so the strands stay stippled instead of turning solid white
    hb *= clamp(uScl[6].x * 1.5, 0.5, 1.0);
    morph(rotZ(h, uHelix.z), hb, uM[6], uOff[6], uScl[6]);
  }

  // 8. orbits around a cube monolith
  if (uM[7] > 0.0) {
    vec3 o = aF7.xyz;
    float ob = aF7.w;
    if (ob >= 2.0) {
      ob -= 2.0;
      float r = length(o.xz);
      o = rotZ(rotX(rotY(o, uTime * 0.2 / (0.35 + r)), uOrbitTilt), 0.16);
    } else {
      o = rotX(rotY(o, uTime * 0.12), 0.22);
    }
    morph(o, ob, uM[7], uOff[7], uScl[7]);
  }

  // 9. contact outline + helmet (offset follows the CTA every frame)
  // helmet particles are the only contact particles brighter than 1.35
  vec3 c8 = aF8.xyz;
  if (aF8.w > 1.35) c8.y += uContactStar;
  morph(c8, aF8.w, uM[8], uOff[8], uScl[8]);

  // frontier ridge: shares the leman attribute, because a tenth attribute would
  // pass the limit of 16 and take the whole field down. Swells roll through the
  // ranges, and the near ones slide against the far ones.
  if (uM[9] > 0.0) {
    vec3 r9 = aF4.xyz;
    float near = r9.z / 0.3 + 0.5;
    if (abs(r9.z) < 0.2) {
      r9.y += sin(r9.x * 4.5 - uTime * 0.9 + near * 6.0) * 0.035 * (0.4 + near * 0.9);
      r9.y += sin(r9.x * 11.0 + uTime * 0.6 - near * 9.0) * 0.012;
      r9.x += sin(uTime * 0.16 + near * 2.2) * 0.03 * (near - 0.3);
    }
    // drawn small on phones, fewer and tinier points need more light
    // (capped under the azure threshold, or every crest turns blue)
    float r9b = aF4.w;
    if (r9b < 1.25) r9b = min(r9b * mix(1.6, 1.0, smoothstep(0.45, 0.75, uScl[9].x)), 1.2);
    morph(r9, r9b, uM[9], uOff[9], uScl[9]);
  }

  // drift: cross-coupled sine field, looser in the open field and in transit,
  // roughened by scroll speed
  vec3 q = P * 2.3 + aRand.x * 9.0;
  vec3 drift = vec3(
    sin(q.y + uTime * 0.31) + sin(q.z * 1.3 - uTime * 0.17),
    sin(q.z + uTime * 0.27) + sin(q.x * 1.1 + uTime * 0.23),
    sin(q.x + uTime * 0.19) + sin(q.y * 0.9 - uTime * 0.29)
  );
  float amp = 0.0025 + (1.0 - F) * 0.02 + T * 0.03 + uTurb * (0.012 + 0.05 * aRand.x);
  P += drift * amp;

  // pointer: particles flee a soft radius, then spring back as it lerps away
  vec2 dp = P.xy - uPointer;
  float dist = length(dp);
  float fall = 1.0 - smoothstep(0.0, uGlowR, dist);
  P.xy += (dp / max(dist, 1e-4)) * fall * fall * 0.075 * uPointerOn;
  float glow = fall * uPointerOn;
  B += glow * 0.55;

  vec4 mv = modelViewMatrix * vec4(P, 1.0);
  gl_Position = projectionMatrix * mv;
  float depthFade = smoothstep(-6.0, -1.2, mv.z);
  gl_PointSize = uSize * aRand.z * (0.65 + 0.5 * min(B, 1.6)) * (1.0 + glow * 0.6) / -mv.z;
  vB = clamp(B, 0.0, 2.0) * mix(0.35, 1.0, depthFade);
  vAccent = max(aRand.w * 0.85, smoothstep(1.15, 1.45, B));
  vAccent = max(vAccent, glow * 0.5);
}
`

export const fragmentShader = /* glsl */ `
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uOpacity;
varying float vB;
varying float vAccent;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  if (d > 1.0) discard;
  // a sharp core with a faint halo; same total light as the old soft dot,
  // so the shapes keep their brightness but every particle reads crisp
  float s = 1.0 - d;
  float halo = s * s * (0.6 + 0.4 * s);
  float core = 1.0 - smoothstep(0.22, 0.46, d);
  float a = (0.7 * core + 0.15 * halo) * 1.06;
  vec3 col = mix(uColA, uColB, vAccent);
  gl_FragColor = vec4(col, a * min(vB, 1.4) * uOpacity);
}
`
