import { PRODUCTS } from "@/lib/graph"
import { SITE } from "@/lib/site"
import { productsByWeight } from "@/lib/seo"
import { OG_CONTENT_TYPE, OG_SIZE, artCard, ogArt } from "@/lib/og"

export const alt = `Work by ${SITE.name}: products, ventures and concepts`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** The /work card: four hero tiles from the heaviest products. */
export default async function Image() {
  const top = productsByWeight().slice(0, 4)
  const srcs = await Promise.all(top.map((p) => ogArt(`${p.slug}-tile.jpg`)))
  return artCard({
    kicker: "Work",
    title: `${PRODUCTS.length} things I built`,
    line: "AI agents, MCP servers, iPhone apps and a few concepts I am still working on.",
    art: { kind: "tiles", srcs },
  })
}
