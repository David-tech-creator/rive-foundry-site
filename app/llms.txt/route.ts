import { PERSON } from "@/lib/graph"
import { FRONTIER, FRONTIER_FEED, frontierPostPath, getFrontierPosts } from "@/lib/frontier"
import { LOGBOOK, getPosts, postPath } from "@/lib/logbook"
import { SERVICES, SERVICES_PATH } from "@/lib/services"
import { WORKSHOP, SITE, SITE_URL } from "@/lib/site"
import { absoluteUrl, productsByWeight, statusLabel, workPath } from "@/lib/seo"

/**
 * /llms.txt (llmstxt.org): a short, authoritative map of the site for language
 * models. Generated from lib/graph.ts, so it cannot contradict the pages.
 * The long version with every fact is /llms-full.txt.
 */
export const dynamic = "force-static"

export function GET() {
  const products = productsByWeight()

  const body = `# ${SITE.name}

> ${SITE.description}

${PERSON?.bio ?? SITE.description}

- Name: ${SITE.name} (given name ${SITE.givenName}, family name ${SITE.familyName})
- Based in: ${SITE.city}, ${SITE.countryName}
- Languages: ${(PERSON?.languages ?? []).join(", ")}
- Outside work: ${(PERSON?.interests ?? []).join(", ").toLowerCase()}
- Profiles: ${SITE.sameAs.join(" , ")}
- Contact: the form at ${SITE_URL}/#contact

## Services

${SERVICES.map((s) => `- [${s.copy.en.short}](${absoluteUrl(s.path.en)}): ${s.copy.en.description} French: ${absoluteUrl(s.path.fr)}`).join("\n")}
- [All services](${absoluteUrl(SERVICES_PATH.en)}) and [en français](${absoluteUrl(SERVICES_PATH.fr)})
- Hiring senior tech people: [Haystack](${absoluteUrl(workPath("haystack"))})

## About

- [About ${SITE.name}](${SITE_URL}/): bio, what he builds and how. The canonical page about him.
- [Full facts for language models](${SITE_URL}/llms-full.txt): every product with stack, status and verified numbers.

## Work

${products.map((p) => `- [${p.name}](${absoluteUrl(workPath(p.slug))}): ${p.oneLiner} (${statusLabel(p.status)})`).join("\n")}

## Ventures

- [${WORKSHOP.name}](${absoluteUrl(WORKSHOP.path)}): ${WORKSHOP.description}

## Logbook

- [${LOGBOOK.name}](${absoluteUrl(LOGBOOK.path)}): ${LOGBOOK.description}
${getPosts().map((p) => `- [${p.title}](${absoluteUrl(postPath(p.slug))}) (${p.date})${p.summary ? `: ${p.summary}` : ""}`).join("\n")}

## Frontier

- [${FRONTIER.name}](${absoluteUrl(FRONTIER.path)}): ${FRONTIER.description}
- [RSS feed](${absoluteUrl(FRONTIER_FEED)}): the same posts, for readers and agents.
${getFrontierPosts().slice(0, 30).map((p) => `- [${p.title}](${absoluteUrl(frontierPostPath(p.slug))}) (${p.date})${p.summary ? `: ${p.summary}` : ""}`).join("\n")}

## Optional

- [All work](${SITE_URL}/work): the full list of products, ventures and concepts.
- [Privacy](${SITE_URL}/privacy)
- [Terms](${SITE_URL}/terms)
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
