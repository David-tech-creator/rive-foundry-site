import { SITE } from "@/lib/site"
import { OG_CONTENT_TYPE, OG_SIZE, portraitCard } from "@/lib/og"

export const alt = `${SITE.name}, ${SITE.headline}: a particle astronaut under the lodestar star`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Site-wide share card: name, one line, David's cutout in an azure glow. */
export default function Image() {
  return portraitCard({
    title: SITE.name,
    line: "I build AI products in Geneva. Agents, MCP servers, iPhone apps.",
  })
}
