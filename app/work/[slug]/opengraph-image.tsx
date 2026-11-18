import { PRODUCT_SLUGS } from "@/lib/graph"
import { SITE } from "@/lib/site"
import { getProduct, statusLabel } from "@/lib/seo"
import { getFilm } from "@/lib/films"
import { OG_CONTENT_TYPE, OG_SIZE, artCard, ogArt } from "@/lib/og"

export const alt = `A product by ${SITE.name}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

// Prerender one card per product at build, so the art in assets/og is read at
// build time and never needs to ship with a serverless function.
export const dynamicParams = false

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }))
}

/** Per-product card: name, one-liner, status pill and the product's own art (film poster, else hero). */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProduct(slug)
  if (!p) return artCard({ title: SITE.name, line: SITE.tagline, art: { kind: "panel", src: null } })

  const poster = getFilm(slug) ? await ogArt(`${slug}-poster.jpg`) : null
  const art = poster
    ? ({ kind: "poster", src: poster } as const)
    : ({ kind: "panel", src: await ogArt(`${slug}-panel.jpg`) } as const)

  return artCard({
    title: p.name,
    line: p.oneLiner,
    status: { label: statusLabel(p.status), on: p.status === "live" || p.status === "beta" },
    art,
  })
}
