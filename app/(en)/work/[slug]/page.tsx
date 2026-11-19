import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { StructuredData } from "@/components/structured-data"
import { Magnetic } from "@/components/motion"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { CONSTELLATIONS, EDGES, PERSON_ID, PRODUCTS, PRODUCT_SLUGS, getProduct, getTheme, type Product } from "@/lib/graph"
import { CONTRIBUTOR_ROLE, statusLabel, workJsonLd, workMetadata, workPath } from "@/lib/seo"
import { FILM_SIZE, filmPaths, getFilm } from "@/lib/films"
import { ProductFilm } from "@/components/site/product-film"
import { NeonduckDiagram } from "@/components/site/neonduck-diagram"
import { DbrainDiagram } from "@/components/site/dbrain-diagram"

export const dynamicParams = false

export function generateStaticParams() {
  // Rive Foundry lives at /rive-foundry (see next.config.mjs)
  return PRODUCT_SLUGS.filter((slug) => slug !== "rive-foundry").map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return workMetadata(slug)
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function formatStarted(started: string) {
  const [y, m] = started.split("-")
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y
}

/** Edge labels read as `from <label> to`; turn them into a sentence verb. */
const RELATION_VERB: Record<string, string> = {
  "public fork of": "is the public fork of",
  "first experiment behind": "was the first experiment behind",
}

/** Pairs that must never be shown as connected work (FDE Club is independent of Haystack). */
const NEVER_PAIR = new Set(["haystack|fde-club", "fde-club|haystack"])

/** Themes nearly every product has; they say nothing about how two products relate. */
const WEAK_THEMES = new Set(["agentic-ai"])

const constellationOf = (slug: string) => CONSTELLATIONS.find((c) => (c.members as string[]).includes(slug))?.theme

function relationSentence(from: Product, label: string, to: Product) {
  return { from, verb: RELATION_VERB[label] ?? label, to }
}

/** Visible byline that ties the product to David in the main content. */
function bylinePrefix(p: Product): string {
  if (p.slug === "rive-foundry") return "Run by"
  if (p.slug === "emineon") return "Founded by"
  if (CONTRIBUTOR_ROLE[p.slug]) return `${CONTRIBUTOR_ROLE[p.slug]} by`
  if (p.kind === "concept" || p.status === "concept") return "A concept by"
  return "Built by"
}

function roleFor(slug: string) {
  if (CONTRIBUTOR_ROLE[slug]) return CONTRIBUTOR_ROLE[slug]
  const label = EDGES.find((e) => e.from === PERSON_ID && e.to === slug)?.label ?? "built"
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProduct(slug)
  if (!p) notFound()

  const index = PRODUCTS.findIndex((x) => x.slug === p.slug)
  const prev = PRODUCTS[(index - 1 + PRODUCTS.length) % PRODUCTS.length]
  const next = PRODUCTS[(index + 1) % PRODUCTS.length]

  // explicit product-to-product links first
  const relations = EDGES.filter((e) => e.label && (e.from === p.slug || e.to === p.slug))
    .map((e) => {
      const from = getProduct(e.from)
      const to = getProduct(e.to)
      return from && to && e.label ? relationSentence(from, e.label, to) : null
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
  const linked = new Set(relations.flatMap((r) => [r.from.slug, r.to.slug]))

  // then the products closest to this one: same star-map group first, then shared themes
  const home = constellationOf(p.slug)
  const shared = PRODUCTS.filter((o) => o.slug !== p.slug && !linked.has(o.slug) && !NEVER_PAIR.has(`${p.slug}|${o.slug}`))
    .map((o) => ({
      o,
      n: (home && constellationOf(o.slug) === home ? 10 : 0) + o.themes.filter((t) => !WEAK_THEMES.has(t) && p.themes.includes(t)).length,
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || b.o.weight - a.o.weight)
    .slice(0, 3)
    .map((x) => x.o)

  const film = getFilm(p.slug)
  const themes = p.themes.map(getTheme).filter((t): t is NonNullable<typeof t> => Boolean(t))
  const host = p.url ? new URL(p.url).hostname.replace(/^www\./, "") : null

  const facts: Array<[string, string]> = [
    ["Status", statusLabel(p.status)],
    ["Role", roleFor(p.slug)],
    ...(p.started ? ([["Started", formatStarted(p.started)]] as Array<[string, string]>) : []),
    ...(p.platforms.length ? ([["Platforms", p.platforms.join(", ")]] as Array<[string, string]>) : []),
  ]

  return (
    <>
      <StructuredData data={workJsonLd(p.slug)} />
      <SiteHeader />
      <main id="main" className="pb-24 pt-36 md:pt-44">
        <article>
          <header className="wrap">
            <nav aria-label="Breadcrumb" className="kicker">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="link-quiet tap">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/work" className="link-quiet tap">
                    Work
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">{p.name}</li>
              </ol>
            </nav>
            <h1 className="mt-8 text-balance text-[clamp(3rem,8vw,6.5rem)] leading-[0.95]">{p.name}</h1>
            <div className="mt-6 grid gap-8 md:grid-cols-12">
              <div className="md:col-span-8">
                <p className="max-w-2xl text-xl leading-snug text-text md:text-2xl">{p.oneLiner}</p>
                <p className="mt-5 text-base text-muted-foreground">
                  {bylinePrefix(p)}{" "}
                  <Link href="/" rel="author" className="link-quiet text-text">
                    David Vinkenroye
                  </Link>{" "}
                  in Geneva.
                </p>
              </div>
              {p.slug === "rive-foundry" ? (
                <div className="md:col-span-4 md:self-end md:justify-self-end">
                  <Magnetic>
                    <Link href="/rive-foundry" className="btn">
                      The agency page
                    </Link>
                  </Magnetic>
                </div>
              ) : p.url && host ? (
                <div className="md:col-span-4 md:self-end md:justify-self-end">
                  <Magnetic>
                    <a href={p.url} target="_blank" rel="noopener" className="btn">
                      {p.urlLabel ?? `Visit ${host}`}
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </Magnetic>
                  {p.urlNote ? <p className="mt-3 text-sm text-muted-foreground md:text-right">{p.urlNote}</p> : null}
                </div>
              ) : null}
            </div>
          </header>

          {p.slug === "dbrain" ? (
            // Dbrain has no screen worth filming: its architecture is the hero.
            <section aria-label={`${p.name} architecture`} className="wrap mt-14 md:mt-20">
              <DbrainDiagram />
            </section>
          ) : film ? (
            // Products with a film lead with the real thing: the film is the hero.
            <section aria-label={`${p.name} film`} className="wrap mt-14 md:mt-20">
              <ProductFilm {...filmPaths(p.slug)} label={film.description} width={FILM_SIZE.width} height={FILM_SIZE.height} smallAspect={film.smallAspect} />
              {film.note ? <p className="mt-4 text-sm text-muted-foreground">{film.note}</p> : null}
            </section>
          ) : (
            <div className="wrap mt-14 md:mt-20">
              <div className="relative aspect-[3/2] overflow-hidden bg-surface">
                <Image
                  quality={85}
                  src={p.image}
                  alt={p.imageAlt}
                  width={1536}
                  height={1024}
                  sizes="(min-width: 1360px) 1280px, 100vw"
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {p.slug === "neonduck" ? (
            // the architecture straight under the film: what you just saw, and what runs it
            <section aria-labelledby="architecture-title" className="wrap mt-16 md:mt-24">
              <h2 id="architecture-title" className="kicker">
                How it fits together
              </h2>
              <div className="mt-6">
                <NeonduckDiagram />
              </div>
            </section>
          ) : null}

          <div className="wrap mt-16 grid gap-16 md:mt-24 md:grid-cols-12">
            <aside className="md:col-span-4" aria-label="Facts">
              <dl className="divide-y divide-line border-y border-line">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-4">
                    <dt className="kicker pt-0.5">{k}</dt>
                    <dd className="text-right text-text">{v}</dd>
                  </div>
                ))}
              </dl>
              {p.slug === "rive-foundry" ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  What the agency does, for candidates and companies:{" "}
                  <Link href="/rive-foundry" className="link-line text-text">
                    Rive Foundry
                  </Link>
                  .
                </p>
              ) : null}
            </aside>

            <div className="md:col-span-7 md:col-start-6">
              <h2 className="kicker">The story</h2>
              <div className="mt-6 space-y-6 text-lg leading-relaxed text-text/90 md:text-xl md:leading-relaxed">
                {p.story.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {film?.second ? (
                <section aria-labelledby="second-film-title" className="mt-20">
                  <h2 id="second-film-title" className="kicker">
                    {film.second.title}
                  </h2>
                  <div className="mt-6">
                    <ProductFilm {...filmPaths(p.slug, film.second.name)} label={film.second.description} width={FILM_SIZE.width} height={FILM_SIZE.height} />
                  </div>
                  {film.second.note ? <p className="mt-3 text-sm text-muted-foreground">{film.second.note}</p> : null}
                </section>
              ) : null}

              {p.screens?.length ? (
                <section aria-labelledby="screens-title" className="mt-20">
                  <h2 id="screens-title" className="kicker">
                    Screens
                  </h2>
                  {p.screensNote ? <p className="mt-3 text-sm text-muted-foreground">{p.screensNote}</p> : null}
                  <div className="mt-6 space-y-12">
                    {p.screens.map((s) => (
                      <figure key={s.src}>
                        <div className="overflow-hidden border border-line bg-surface">
                          <Image
                            quality={85}
                            src={s.src}
                            alt={s.alt}
                            width={s.width}
                            height={s.height}
                            sizes="(min-width: 768px) 56vw, 100vw"
                            className="h-auto w-full"
                          />
                        </div>
                        <figcaption className="mt-3 text-sm text-muted-foreground">{s.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              ) : null}

              <section aria-labelledby="built-title" className="mt-20">
                <h2 id="built-title" className="kicker">
                  {p.kind === "concept" ? "What was worked out" : "What was built"}
                </h2>
                <ul className="mt-6 divide-y divide-line border-y border-line">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-4 py-4 text-base text-text/90 md:text-lg">
                      <span aria-hidden="true" className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-azure-light" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {p.facts.length ? (
                <section aria-labelledby="numbers-title" className="mt-20">
                  <h2 id="numbers-title" className="kicker">
                    Key facts
                  </h2>
                  <ul className={`mt-6 grid gap-6 ${p.facts.length > 1 ? "sm:grid-cols-2" : ""}`}>
                    {p.facts.map((f) => (
                      <li key={f} className="hairline pt-4 text-lg text-text">
                        {f}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {p.stack.length ? (
                <section aria-labelledby="stack-title" className="mt-20">
                  <h2 id="stack-title" className="kicker">
                    Stack
                  </h2>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {themes.length ? (
                <section aria-labelledby="themes-title" className="mt-20">
                  <h2 id="themes-title" className="kicker">
                    Themes
                  </h2>
                  <ul className="mt-6 space-y-6">
                    {themes.map((t) => (
                      <li key={t.id}>
                        <h3 className="text-lg text-text">{t.label}</h3>
                        <p className="mt-1 text-muted-foreground">{t.summary}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {relations.length || shared.length ? (
                <section aria-labelledby="related-title" className="mt-20">
                  <h2 id="related-title" className="kicker">
                    Connected work
                  </h2>
                  <ul className="mt-6 divide-y divide-line border-y border-line">
                    {relations.map((r) => (
                      <li key={`${r.from.slug}-${r.to.slug}`} className="py-4 text-lg text-muted-foreground">
                        <RelName product={r.from} current={p.slug} /> {r.verb} <RelName product={r.to} current={p.slug} />.
                      </li>
                    ))}
                    {shared.map((o) => (
                      <li key={o.slug} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                        <Link href={workPath(o.slug)} className="tap text-lg text-text transition-colors hover:text-azure-light">
                          {o.name}
                        </Link>
                        <span className="text-sm text-muted-foreground sm:text-right">{o.oneLiner}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>
        </article>

        <nav aria-label="More work" className="wrap mt-24 md:mt-32">
          <div className="hairline grid gap-8 pt-8 sm:grid-cols-2">
            <Link href={workPath(prev.slug)} className="group">
              <span className="kicker">Previous</span>
              <span className="mt-2 block text-2xl text-text transition-colors group-hover:text-azure-light md:text-3xl">
                {prev.name}
              </span>
            </Link>
            <Link href={workPath(next.slug)} className="group sm:text-right">
              <span className="kicker">Next</span>
              <span className="mt-2 block text-2xl text-text transition-colors group-hover:text-azure-light md:text-3xl">
                {next.name}
              </span>
            </Link>
          </div>
          <p className="mt-12">
            <Link href="/work" className="link-line tap text-sm text-muted-foreground">
              All work
            </Link>
          </p>
        </nav>
      </main>
      <SiteFooter />
    </>
  )
}

function RelName({ product, current }: { product: Product; current: string }) {
  if (product.slug === current) return <span className="text-text">{product.name}</span>
  return (
    <Link href={workPath(product.slug)} className="link-line tap-inline text-text">
      {product.name}
    </Link>
  )
}
