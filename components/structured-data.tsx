import { buildGraph, type JsonLd } from "@/lib/seo"

/**
 * Emits one JSON-LD block. Pass the page's graph from lib/seo.ts
 * (homeJsonLd, workIndexJsonLd, workJsonLd(slug),
 * riveFoundryJsonLd, simplePageJsonLd). With no prop it emits the full site
 * graph. Render it once per page, not in the layout, so each page carries the
 * nodes relevant to it.
 *
 * "<" is escaped so no string in the data can close the script tag.
 */
export function StructuredData({ data }: { data?: JsonLd } = {}) {
  const json = JSON.stringify(data ?? buildGraph()).replace(/</g, "\\u003c")
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}

export default StructuredData
