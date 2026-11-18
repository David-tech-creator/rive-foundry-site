/**
 * Social share cards (1200x630) for the file-based opengraph-image routes.
 *
 * Two layouts, both charcoal with one azure accent:
 *   PortraitCard  text left, David's cutout on the right in a soft azure glow,
 *                 the helmet mark above the shoulder (home, /about)
 *   ArtCard       text left, the product's own art on the right: its film
 *                 poster, its hero art, or a few hero tiles (/work, /work/[slug],
 *                 /rive-foundry)
 *
 * The art is read from assets/og/, pre-sized JPEG/PNG made by
 * scripts/og-art.mjs, because next/og cannot draw WebP and every image is
 * inlined into the render. Missing art just leaves the panel empty.
 */
import { readFile } from "node:fs/promises"
import { HELMET_PATHS } from "@/components/site/helmet-mark"
import path from "node:path"
import { ImageResponse } from "next/og"
import { SITE } from "@/lib/site"
import { loadOgFont } from "@/lib/seo"

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const C = SITE.colors
const HOST = "rive-foundry.com"
const PAD = 72
/** Right panel for hero art. Keep in sync with scripts/og-art.mjs PANEL. */
const PANEL = { width: 620, height: 630 }

/** One OG asset as a data URI, or null when it is not there. */
export async function ogArt(file: string): Promise<string | null> {
  try {
    const buf = await readFile(path.join(process.cwd(), "assets/og", file))
    const type = file.endsWith(".png") ? "image/png" : "image/jpeg"
    return `data:${type};base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}

async function fonts(light: string, regular: string) {
  const [l, r] = await Promise.all([loadOgFont(300, light), loadOgFont(400, regular)])
  return [
    ...(l ? [{ name: "Inter Tight", data: l, weight: 300 as const, style: "normal" as const }] : []),
    ...(r ? [{ name: "Inter Tight", data: r, weight: 400 as const, style: "normal" as const }] : []),
  ]
}

/** The helmet mark from components/site/helmet-mark.tsx. */
function Helmet({ size, glow = false }: { size: number; glow?: boolean }) {
  const fill = glow ? C.accentLight : C.accent
  const icon = (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={HELMET_PATHS.shell} fill={fill} fillRule="evenodd" />
      <path d={HELMET_PATHS.glint} fill={fill} />
      <path d={HELMET_PATHS.collar} fill={fill} />
    </svg>
  )
  if (!glow) return <div style={{ display: "flex", width: size, height: size }}>{icon}</div>
  // A soft halo drawn as a radial gradient (box-shadow on a transparent box renders a dark disc).
  const halo = size * 3
  return (
    <div style={{ display: "flex", width: halo, height: halo, alignItems: "center", justifyContent: "center", backgroundImage: "radial-gradient(circle, rgba(0,127,255,0.38) 0%, rgba(0,127,255,0.12) 30%, rgba(0,127,255,0) 62%)" }}>
      {icon}
    </div>
  )
}

/** Small helmet and the host, top left of every card. */
function Mark({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Helmet size={26} />
      <div style={{ display: "flex", fontSize: 24, color: C.muted, letterSpacing: 0.5 }}>{label ?? HOST}</div>
    </div>
  )
}

function Frame({ children, family }: { children: React.ReactNode; family: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        background: C.background,
        color: C.text,
        fontFamily: family,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  )
}

function TextColumn({
  top,
  title,
  titleSize,
  line,
  foot,
  width,
}: {
  top: React.ReactNode
  title: string
  titleSize: number
  line: string
  foot?: React.ReactNode
  width: number
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        top: 64,
        bottom: 64,
        width,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {top}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: titleSize, fontWeight: 300, letterSpacing: -2.5, lineHeight: 1.02 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: C.muted, lineHeight: 1.3 }}>{line}</div>
      </div>
      {foot ?? <div style={{ display: "flex" }} />}
    </div>
  )
}

/* ------------------------------------------------------------------------- */

export async function portraitCard(opts: { title: string; line: string; kicker?: string }) {
  const { title, line, kicker } = opts
  const [portrait, f] = await Promise.all([ogArt("portrait.png"), fonts(title, `${line}${kicker ?? ""}${HOST}`)])

  return new ImageResponse(
    (
      <Frame family={f.length ? "Inter Tight" : "sans-serif"}>
        {/* azure glow behind the portrait */}
        <div
          style={{
            position: "absolute",
            right: -160,
            top: -40,
            width: 900,
            height: 900,
            display: "flex",
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0,127,255,0.30) 0%, rgba(0,127,255,0.10) 38%, rgba(31,30,34,0) 66%)",
          }}
        />
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait} width={560} height={560} alt="" style={{ position: "absolute", right: 20, bottom: 0 }} />
        ) : null}
        {/* fade the suit into the floor */}
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 640,
            height: 120,
            display: "flex",
            backgroundImage: `linear-gradient(to bottom, rgba(31,30,34,0), ${C.background})`,
          }}
        />
        <div style={{ position: "absolute", right: 32, top: 38, display: "flex" }}>
          <Helmet size={54} glow />
        </div>
        <TextColumn
          width={520}
          top={<Mark label={kicker} />}
          title={title}
          titleSize={title.length > 18 ? 84 : 96}
          line={line}
          foot={<div style={{ display: "flex", width: 72, height: 3, borderRadius: 2, background: C.accent }} />}
        />
      </Frame>
    ),
    { ...OG_SIZE, fonts: f },
  )
}

type Art =
  | { kind: "poster"; src: string | null }
  | { kind: "panel"; src: string | null }
  | { kind: "tiles"; srcs: Array<string | null> }

function ArtLayer({ art }: { art: Art }) {
  if (art.kind === "panel") {
    if (!art.src) return null
    return (
      <div style={{ position: "absolute", right: 0, top: 0, width: PANEL.width, height: PANEL.height, display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art.src} width={PANEL.width} height={PANEL.height} alt="" />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 260,
            height: PANEL.height,
            display: "flex",
            backgroundImage: `linear-gradient(to right, ${C.background}, rgba(31,30,34,0))`,
          }}
        />
      </div>
    )
  }
  if (art.kind === "poster") {
    if (!art.src) return null
    // 720x450 whole frame. Its margins are the poster's own charcoal, a shade
    // off the card's, so feather the edges into the card.
    const edge = (side: "top" | "bottom" | "left") => {
      const box =
        side === "left"
          ? { left: 0, top: 0, width: 110, height: 450 }
          : { left: 0, [side]: 0, width: 720, height: 70 }
      const to = side === "left" ? "to right" : side === "top" ? "to bottom" : "to top"
      return (
        <div
          style={{
            position: "absolute",
            display: "flex",
            ...box,
            backgroundImage: `linear-gradient(${to}, ${C.background}, rgba(31,30,34,0))`,
          }}
        />
      )
    }
    return (
      <div style={{ position: "absolute", right: -48, top: 90, width: 720, height: 450, display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art.src} width={720} height={450} alt="" />
        {edge("top")}
        {edge("bottom")}
        {edge("left")}
      </div>
    )
  }
  const tiles = art.srcs.filter((s): s is string => Boolean(s)).slice(0, 4)
  return (
    <div
      style={{
        position: "absolute",
        right: PAD - 8,
        top: 120,
        width: 2 * 264 + 16,
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {tiles.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          width={264}
          height={176}
          alt=""
          style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}
        />
      ))}
    </div>
  )
}

function Pill({ label, on }: { label: string; on: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 22,
        color: C.text,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(31,30,34,0.72)",
        borderRadius: 999,
        padding: "8px 18px 8px 14px",
      }}
    >
      <div style={{ display: "flex", width: 10, height: 10, borderRadius: 5, background: on ? C.accent : C.muted }} />
      {label}
    </div>
  )
}

export async function artCard(opts: {
  title: string
  line: string
  art: Art
  /** Status pill, e.g. "Live" or "Concept, in progress". */
  status?: { label: string; on: boolean }
  /** Top-left label next to the star; defaults to the host. */
  kicker?: string
}) {
  const { title, line, art, status, kicker } = opts
  const byline = `by ${SITE.name}`
  const f = await fonts(title, `${line}${status?.label ?? ""}${kicker ?? ""}${byline}${HOST}`)
  const textWidth = art.kind === "tiles" ? 500 : 520

  return new ImageResponse(
    (
      <Frame family={f.length ? "Inter Tight" : "sans-serif"}>
        <ArtLayer art={art} />
        <TextColumn
          width={textWidth}
          top={<Mark label={kicker} />}
          title={title}
          titleSize={title.length > 18 ? 62 : title.length > 14 ? 76 : title.length > 9 ? 92 : 108}
          line={line}
          foot={
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {status ? <Pill label={status.label} on={status.on} /> : null}
              <div style={{ display: "flex", fontSize: 22, color: C.muted }}>{byline}</div>
            </div>
          }
        />
      </Frame>
    ),
    { ...OG_SIZE, fonts: f },
  )
}
