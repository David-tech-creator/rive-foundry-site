import { FRONTIER, frontierPostPath, getFrontierPosts } from "@/lib/frontier"
import { SITE, SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Site paths in post HTML need the host once they are read outside the site. */
const absolute = (html: string) => html.replace(/(src|href)="\/(?!\/)/g, `$1="${SITE_URL}/`)

export function GET() {
  const posts = getFrontierPosts().slice(0, 50)
  const updated = posts[0] ? new Date(posts[0].date) : new Date()
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}${frontierPostPath(p.slug)}`
      return `    <item>
      <title>${xml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <dc:creator>${xml(SITE.name)}</dc:creator>
      <description>${xml(p.summary)}</description>
      <content:encoded>${xml(absolute(p.html))}</content:encoded>
    </item>`
    })
    .join("\n")
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(FRONTIER.name)}, ${xml(SITE.name)}</title>
    <link>${SITE_URL}${FRONTIER.path}</link>
    <atom:link href="${SITE_URL}${FRONTIER.path}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${xml(FRONTIER.description)}</description>
    <language>en</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`
  return new Response(body, { headers: { "content-type": "application/rss+xml; charset=utf-8" } })
}
