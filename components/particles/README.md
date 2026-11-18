# Particle engine ("Mission log")

One fixed, full-viewport three.js `Points` cloud behind the page. It re-forms
as you scroll: lodestar preloader, David's portrait, astronaut bust, floating
astronaut, globe with Geneva, a small map of Lac Léman, the constellation knowledge graph,
a DNA double helix, orbits around a cube monolith, and an outline around
the contact CTA with the lodestar above it.

Everything meaningful stays server-rendered HTML. The field is decoration
(`aria-hidden`, `pointer-events: none`) and three.js is loaded with a dynamic
import after hydration, so it is not in the initial JS.

## Mount once (root layout)

```tsx
import { ParticleStage } from "@/components/particles"
import { Preloader, Cursor, SmoothScroll } from "@/components/motion"

<body>
  <Preloader />          {/* optional: only on pages that should show it */}
  <ParticleStage />
  <SmoothScroll />
  <Cursor />
  {children}
</body>
```

The canvas sits at `z-index: -1` (painted over the body background, under
normal content), so sections must not have opaque backgrounds where the field
should show. The canvas clears to `#1F1E22`.

## Scroll contract

Mark sections, in this order (chain order), with `data-formation`:

| value             | shape                                              |
| ----------------- | -------------------------------------------------- |
| `portrait`        | David's stippled portrait (hero)                   |
| `astronaut-bust`  | astronaut bust, same framing (suit-up)             |
| `astronaut-float` | full-body floating astronaut                       |
| `globe`           | globe, Geneva cluster, small astronaut beside it   |
| `leman`           | Lac Léman map: the lake, GVA, EPFL, Alps, Zurich   |
| `graph`           | constellation knowledge graph                      |
| `helix`           | DNA double helix on a diagonal (My DNA)            |
| `orbits`          | concentric orbits around a cube monolith           |
| `contact`         | outline around the CTA + lodestar above it         |
| `ridge`           | ranges in perspective (Frontier hero)              |

```html
<section data-formation="contact" data-outline-target="contact-cta">
  <a id="contact-cta" href="#contact">…</a>
</section>
```

Timing: a shape starts forming when its section's top is 0.8 viewport heights
below the top of the viewport and is complete 0.6 viewport heights of scroll
later. Tall or sticky sections hold the shape. Optional per-section overrides:

- `data-formation-start` (vh, added to the window start), `data-formation-length` (vh)
- `data-formation-x` (fraction of the half-width, -1..1), `data-formation-y`
  (world units, viewport half-height = 1), `data-formation-scale` (multiplier)

Placement depends on the viewport class (`components/particles/layout.ts`):

- **wide** (desktop, 1280px and up): portrait, astronauts, globe and orbits
  on the right half (`x ≈ 0.45`), Léman slightly right; copy on the left.
  These are the original desktop values.
- **compact** (landscape under 1280px wide or 560px tall: iPads held
  sideways, phones held sideways): a tablet branch of the same idea. The
  engine measures each section's `.fm-copy` text and fits the shape into the
  free area to its right (shrinks it, never below 55%, and moves it as little
  as possible).
- **portrait** (width/height < 0.9: phones, portrait tablets): shapes in the
  upper part of the screen, copy in the lower part; each shape is fitted into
  the space left above its section's copy (never below 62% of its size).

The DNA helix runs top left to bottom right in every layout: corner to
corner through the right half on wide screens, fitted right of the copy on
compact ones, and fitted into the space above the copy on portrait screens
(a little flatter on portrait tablets, `helixAngle()`). Its extent is
computed from that angle (`helixBounds()`), not measured from the buffer.

Shape extents come from the built buffers (`measureBounds`), so a new mask
fits without new numbers. `data-formation-x/y/scale` overrides skip the fit.

The knowledge graph uses the wide layout on desktop and the compact portrait
layout everywhere else (`GraphLayoutSwitch`, same thresholds); on compact
screens it is fitted to the right of the copy, on portrait tablets under it.
On every screen, a star or label that would land on the section copy hops
just past it. Before that, the engine measures every star with its real label
box and shrinks or slides the whole map so it stays inside the screen (under
the header, right of the copy on compact screens, under it on portrait
tablets); a label that still pokes out after the hop is pulled back in.
Constellation names sit on the side of their hub with no lines through it
(`HUB_SIDES` in lib/graph-layout.ts, passed to `GraphLabel` as `side`).

Missing pieces degrade quietly: a section that is not on the page or whose mask
image fails to load is skipped (the field blends straight to the next shape).

### Readiness variables

The engine writes `--<formation>-ready` (0..1) on `<html>` every frame:
1 when the shape has formed, falling back to 0 as the next shape starts.
Drive text reveals with it and always give a fallback of 1 so text shows
without WebGL:

```css
.hero-copy { opacity: var(--portrait-ready, 1); }
```

Names: `--portrait-ready`, `--astronaut-bust-ready`, `--astronaut-float-ready`,
`--globe-ready`, `--leman-ready`, `--graph-ready`, `--helix-ready`,
`--orbits-ready`, `--contact-ready`.

`<html>` attributes: `data-particles="on" | "off"`, `data-graph-active` (graph
formed), `data-preloading` (preloader running).

## Knowledge graph

Publish the layout (normalized -1..1, y up) and render labels as real links:

```tsx
import { GraphLayoutSource, GraphLabel, StaticGraph } from "@/components/particles"

<section data-formation="graph">
  <GraphLayoutSource layout={{ nodes, edges }} />      {/* nodes: {id,x,y,r,weight} */}
  <ul>
    {products.map((p) => (
      <GraphLabel key={p.slug} id={p.slug}>
        <a href={`/work/${p.slug}`}>{p.name}</a>
      </GraphLabel>
    ))}
  </ul>
  <StaticGraph nodes={nodesWithLabels} edges={edges} />   {/* fallback, hidden when WebGL runs */}
</section>
```

- With WebGL, each `GraphLabel` becomes `position: fixed` and the engine moves
  it onto its projected star (`transform`), with `--node-r` = star radius in
  px. Its content (`.pf-label-inner`) sits to the right of the star. Labels are
  hidden and unclickable until `data-graph-active`.
- Hover/focus on a label brightens that star's constellation lines.
- `setGraphFocus(id | null)` pans the sky toward a star (the selected-work
  gallery uses it, so the sky follows the card in the middle of the screen).
- `useGraphNodeScreen(id)` returns `{ x, y, r, visible }` in CSS px for custom
  overlays (re-renders per frame while the graph is formed).
- Node radius `r` is in the same -1..1 space (0.02 to 0.08 reads well), `weight`
  0..1 sets brightness; the heaviest node gets an azure core. Edges flow from
  the outer node to the inner one. Max 96 nodes.

## Lac Léman map

`buildLeman` draws a small, compact map around the lake. The lake is the
hero: it keeps about the size it had on its own, so only the lake and the
points right on it are to scale (real lon/lat through the lake's
equirectangular projection, 1 unit is about 30 km); what lies further out is
drawn schematically:

- the stippled lake (hand-traced shoreline, Geneva azure at the south-west
  tip, Lausanne and Montreux as two quiet dots on the north shore);
- Geneva airport just north-west of the tip: a runway glyph (two rows of edge
  lights and a dashed centre line, on its true 45 degree heading, drawn a
  little longer than scale);
- EPFL on the shore at the west edge of Lausanne, a small four-point star;
- the Alps as one stippled ridge just south of the lake and along it, Mont
  Blanc pulled in as its tallest, brightest peak near the south-west end
  (south-east of Geneva), then the Chablais peaks to the Dents du Midi at the
  east end. Heights are exaggerated; the silhouette comes from `silhouette()`
  with a hash, not the rng, so the static SVG draws the same ridge;
- Zurich: a short dotted trail from EPFL on the true bearing to ETH, ending
  at a small star;
- Milan and the Côte d'Azur: short dotted stubs with arrowheads on their true
  bearings, leaving the map from the east end of the ridge and from Geneva.

Labels are server-rendered by `<LemanLabels />` (inside the leman section,
`aria-hidden`, the copy says it all) from `LEMAN_LABELS` in static.tsx, keyed
to `LEMAN_MARKS` in shapes.ts. With the field running each `[data-leman-label]`
is `position: fixed` and the engine moves it onto its projected landmark every
frame, the same way it moves the star map's labels; `data-side` and
`data-gap` (px, plus the star's radius for `data-star` labels, so EPFL and
ETH keep clear of their stars at any size) put the text beside the landmark.
They fade in with
`--leman-ready`.

Fit (`fitLeman` in engine.ts): the engine measures the labels once per layout
(never in the frame loop), then shrinks the map, labels included, until it
fits right of the copy (wide and compact) or above it (portrait), under the
header (at its scrolled height), and centres it there. The extent comes from `lemanBounds()`, not from
the buffer, so a sparse trail is never trimmed. On portrait phones
(under 600px wide) the Milan and Côte d'Azur labels are hidden, the engine
sees that and rebuilds the map without their trails, and "GVA airport" shortens
to "GVA". A map drawn small (phones, tablets) lights fewer of its lake
particles (`thin`, the rest get brightness 0) so the outline stays crisp.

## Portrait light and gaze

While the portrait is formed, the pointer (the glowing dot) is a light in
front of the face and the head turns to look at it. Both are folded into the
portrait's target, so they fade out with the portrait morph as the bust takes
over; every other formation is untouched.

- **Normals.** `buildPortrait` also writes one `aN` attribute (normal xy, z
  implied) from `surfaceNormals()` in `lib/formations/image.ts`: a height
  field of the silhouette rounded towards its edges, an ellipsoid over the
  head and a little blurred luminance relief, differentiated once at build
  time. No random numbers are drawn for it, so positions are unchanged.
- **Light.** `uLight` (world space) sits at the pointer xy with z towards the
  viewer and eases after it. The shader takes it into the portrait's local
  space and shades each particle with Lambert plus a soft ambient and a faint
  rim (`lit()` in shaders.ts), capped just above 1 so lit edges do not tip
  into the azure accent. With no pointer (idle desktop, pointer left the
  window) it drifts back to a soft key from the top left.
- **Gaze.** `findHead()` finds the head ellipse in the mask (top of the
  silhouette down to the neck), sent as `uHeadCenter` (centre xy, radii xy).
  `uHeadYaw` (up to about 15 degrees) and `uHeadPitch` (about 8) ease towards
  the pointer at about 0.08 per frame. For the turn the head gets an
  ellipsoid of depth on top of its shallow relief, so it swings round its
  centre instead of sliding; the neck follows halfway, the shoulders stay.
- **Touch.** No hover: while a finger is down the light (and the gaze)
  follow it, and on release both drift back to the default. The glow and the
  push stay mouse only.
- **Reduced motion.** The field does not run (static portrait). Should the
  engine ever run there, the head does not turn and the light jumps instead
  of easing.

Per frame this is three uniforms (`lightPortrait()` in engine.ts), only while
the portrait is showing.

## DNA helix

`buildHelix` writes cylindrical coordinates (axis position, angle, signed
radius, brightness): two stippled backbones, a brighter bead where each base
pair meets them (every seventh pair in azure), faint rungs through the axis
and a little dust. The shader adds the twist (`HELIX_TURNS` whole turns, so
sliding wraps without a seam), then `uHelix` = (spin about the axis, slide
along it, screen angle). The engine drives spin and slide from how far the
page has scrolled into the section (smoothed, plus a slow idle turn); scroll
speed roughens it through the shared turbulence like every other shape. The
far strand is dimmer and both ends fade out.

## Fallbacks

Reduced motion or no WebGL2: `ParticleStage` renders nothing and sets
`data-particles="off"`. Use `<StaticPortrait />` (halftone CSS of the cutout)
`<StaticGraph nodes edges />` (SVG, nodes with `href` are links),
`<StaticHelix />` (a still, decorative SVG helix) and `<StaticLeman />` (the
lake map as a dotted SVG with its labels, drawn from the same geometry,
`lemanMapGeometry()`). All of them carry `.pf-static` and hide themselves when
the field runs; the floating map labels are hidden without the field.

## Assets

- `/portrait/david-points.bin`: the portrait as baked dot positions, written by `node scripts/portrait-points.mjs` from assets/portrait-src/david-cutout.png (800 px, never published)
- `/particles/astronaut-bust-mask.png`, `/particles/astronaut-bust-lum.webp` (1024 px)
- `/particles/astronaut-float-mask.png`

Square PNGs, subject centred. Override with `<ParticleStage assets={{ … }} />`.

## Performance notes

Device tiers (`ParticleStage`): 60 000 particles on desktop (pixel ratio
capped at 2), 30 000 on tablets (touch, shorter side 600px or more) and
20 000 on phones, both capped at 1.5; x0.6 on 4 cores or fewer or 2 GB of
memory or less. Fewer particles are drawn slightly larger. If frames keep
running slower than ~45 fps for two seconds, the pixel ratio steps down by
0.25, never below 1.

Formations are built on the CPU only when a section on the page asks for them
(text pages build none), graph and contact again on resize; per frame only
uniforms change. The loop pauses when the tab is hidden and everything is
disposed on unmount.

Phones and tablets skip the preloader (CSS hides it from the first paint,
`motion.css`), so the hero text is the first thing painted and stays visible
while the field forms the portrait behind it.

Shapes live in `lib/formations/` (pure functions writing into Float32Arrays).
