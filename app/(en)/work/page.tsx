import Link from "next/link"
import { StructuredData } from "@/components/structured-data"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { WorkTile } from "@/components/site/work-tile"
import { PRODUCTS, type Product } from "@/lib/graph"
import { SITE } from "@/lib/site"
import { pageMetadata, workIndexJsonLd } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Work",
  description: `Products, ventures and concepts built by ${SITE.name}: AI agents, automations, MCP servers, self-hosted stacks and iOS apps, made in Geneva.`,
  path: "/work",
})

const GROUPS: Array<{ id: string; title: string; intro: string; match: (p: Product) => boolean }> = [
  {
    id: "products",
    title: "Products",
    intro: "Software I designed and built, from tools only I use to apps other people can try.",
    match: (p) => p.kind === "product",
  },
  {
    id: "ventures",
    title: "Ventures and platforms",
    intro: "Companies and communities, plus the sites and systems I built for them.",
    match: (p) => p.kind === "venture" || p.kind === "community",
  },
  {
    id: "concepts",
    title: "Concepts",
    intro: "Ideas I am still working on. None of them has launched yet.",
    match: (p) => p.kind === "concept",
  },
]

export default function WorkIndexPage() {
  return (
    <>
      <StructuredData data={workIndexJsonLd()} />
      <SiteHeader />
      <main id="main" className="pb-24 pt-36 md:pt-44">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="kicker">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="link-quiet tap">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Work</li>
            </ol>
          </nav>
          <h1 className="mt-8 text-[clamp(3rem,8vw,6.5rem)] leading-[0.95]">Work</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {PRODUCTS.length} things I have built, run or am still working on. Some I use every day, some are in
            beta and a few are still concepts. Each page tells the story and shows what it is built with.
          </p>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {GROUPS.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="link-line tap text-muted-foreground">
                  {g.title} ({PRODUCTS.filter(g.match).length})
                </a>
              </li>
            ))}
          </ul>

          {GROUPS.map((g, gi) => {
            const items = PRODUCTS.filter(g.match)
            return (
              <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="mt-24 md:mt-32">
                <div className="hairline grid gap-4 pt-6 md:grid-cols-12">
                  <h2 id={`${g.id}-title`} className="text-3xl md:col-span-5 md:text-4xl">
                    {g.title}
                  </h2>
                  <p className="text-muted-foreground md:col-span-6 md:col-start-7">{g.intro}</p>
                </div>
                <div className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p, i) => (
                    <WorkTile
                      key={p.slug}
                      product={p}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      // only the first tile is above the fold on a phone; preloading three
                      // delayed the phone LCP. The other two load eagerly enough on desktop.
                      priority={gi === 0 && i === 0}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
