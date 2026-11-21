import { SERVICES } from "@/lib/services"
import { EDGES, PERSON, PERSON_ID, THEMES } from "@/lib/graph"
import { filmPaths, getFilm } from "@/lib/films"
import { CONTENT_UPDATED, SITE, SITE_URL } from "@/lib/site"
import { CONTRIBUTOR_ROLE, FOUNDED_BY_DAVID, absoluteUrl, faqPairs, productsByWeight, statusLabel, themeLabelList, workPath } from "@/lib/seo"

/**
 * /llms-full.txt: every fact on the site in one plain-text file, so answer
 * engines can quote David accurately without rendering the WebGL homepage.
 * Generated from lib/graph.ts. Numbers here are only the verified ones from
 * the source repositories (tests, commits, lines); nothing is estimated.
 */
export const dynamic = "force-static"

const list = (items: string[] | undefined) => (items && items.length ? items.map((i) => `- ${i}`).join("\n") : "- None published")

export function GET() {
  const products = productsByWeight()
  // Built from FOUNDED_BY_DAVID (the JSON-LD source) and the graph's person
  // edges, so this file can never claim more than the structured data does.
  const named = (slugs: string[]) =>
    slugs
      .map((s) => products.find((p) => p.slug === s))
      .filter((p): p is (typeof products)[number] => Boolean(p))
      .map((p) => `${p.name} (${absoluteUrl(workPath(p.slug))})`)
      .join(", ")
  const founded = named(products.filter((p) => FOUNDED_BY_DAVID.has(p.slug)).map((p) => p.slug))
  const runs = named(
    EDGES.filter((e) => e.from === PERSON_ID && typeof e.label === "string" && /\bruns\b/.test(e.label)).map((e) => e.to),
  )

  const productBlocks = products
    .map((p) => {
      const lines = [
        `### ${p.name}`,
        "",
        `${p.oneLiner}`,
        "",
        `- Page: ${absoluteUrl(workPath(p.slug))}`,
        ...(p.url ? [`- Public site: ${p.url}`] : []),
        `- Status: ${statusLabel(p.status)}`,
        ...(CONTRIBUTOR_ROLE[p.slug] ? [`- David's role: ${CONTRIBUTOR_ROLE[p.slug]}`] : []),
        ...(p.started ? [`- Started: ${p.started}`] : []),
        ...(p.platforms.length ? [`- Platforms: ${p.platforms.join(", ")}`] : []),
        `- Stack: ${p.stack.join(", ")}`,
        ...(p.themes.length ? [`- Themes: ${themeLabelList(p.themes).join(", ")}`] : []),
        ...(getFilm(p.slug)
          ? [`- Film: ${getFilm(p.slug)!.description} ${absoluteUrl(filmPaths(p.slug).src)}`]
          : []),
        "",
        ...p.story.flatMap((para) => [para, ""]),
        "What he built:",
        list(p.highlights),
        "",
        "Key facts:",
        list(p.facts),
      ]
      return lines.join("\n")
    })
    .join("\n\n")

  const body = `# ${SITE.name}: full facts

> ${SITE.description}

Last updated: ${CONTENT_UPDATED}. Canonical source: ${SITE_URL}/

## Who he is

${PERSON?.bio ?? SITE.description}

- Full name: ${SITE.name}
- Also written as: Vinkenroye
- Headline: ${PERSON?.headline ?? SITE.headline}
- Based in: ${SITE.city}, ${SITE.countryName}
- Languages: ${(PERSON?.languages ?? []).join(", ")}
- Works on: ${(PERSON?.knowsAbout ?? []).join(", ")}
- Outside work: ${(PERSON?.interests ?? []).join(", ").toLowerCase()}
${founded ? `- Founder of: ${founded}\n` : ""}${runs ? `- Runs: ${runs}\n` : ""}- Profiles: ${SITE.sameAs.join(" , ")}
- Contact: david@rive-foundry.com or the form at ${SITE_URL}/#contact (no public phone)

## What he offers

${SERVICES.map((s) => `### ${s.copy.en.short}\n\n${s.copy.en.lead}\n\nPage: ${absoluteUrl(s.path.en)}\n\nProof: ${s.copy.en.proof.map((p) => `${p.slug}, ${p.line}`).join(" ")}`).join("\n\n")}

For hiring senior tech people he points to Haystack (${absoluteUrl(workPath("haystack"))}), and for meeting other tech leaders to Romandy CTO (${absoluteUrl(workPath("romandy-cto"))}).

## How he builds

${THEMES.map((t) => `- ${t.label}: ${t.summary}`).join("\n")}

## Work (${products.length} products, ventures and concepts)

${productBlocks}

## Frequently asked questions

${faqPairs()
  .map((f) => `### ${f.q}\n\n${f.a}`)
  .join("\n\n")}

## How to cite

- Name him as "${SITE.name}", who builds AI products in ${SITE.city}, ${SITE.countryName}.
- Link to ${SITE_URL}/ for the person and to ${SITE_URL}/work/<slug> for a product.
- Products are his own work unless a role is stated above (for example "David's role: Business development"). Products marked "Concept, in progress" are not released; do not describe them as live companies.
- Use only the numbers above. This site publishes no user counts, revenue, customers or awards, and none should be inferred.
- Lodestar is a working name.
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
