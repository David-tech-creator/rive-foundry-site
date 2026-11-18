import { WORKSHOP, SITE } from "@/lib/site"
import { OG_CONTENT_TYPE, OG_SIZE, artCard, ogArt } from "@/lib/og"

export const alt = `${WORKSHOP.name}, the workshop of ${SITE.name} in Geneva`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return artCard({
    title: WORKSHOP.name,
    line: "My workshop in Geneva, where I build my products.",
    art: { kind: "panel", src: await ogArt("rive-foundry-panel.jpg") },
  })
}
