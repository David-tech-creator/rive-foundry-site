import { FRONTIER_OG_ALT } from "@/lib/frontier"
import { OG_CONTENT_TYPE, OG_SIZE, artCard, ogArt } from "@/lib/og"

export const alt = FRONTIER_OG_ALT
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** The Frontier card: the particle mountain range from the page's hero. */
export default async function Image() {
  return artCard({
    kicker: "Logbook",
    title: "Frontier",
    line: "What changed at the AI labs, and what I would do with it.",
    art: { kind: "panel", src: await ogArt("frontier-panel.jpg") },
  })
}
