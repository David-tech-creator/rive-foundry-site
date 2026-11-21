import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { GraphLabel, LemanLabels, StaticGraph, StaticHelix, StaticLeman, StaticPortrait } from "@/components/particles"
import { Magnetic, Preloader } from "@/components/motion"
import { ContactForm } from "@/components/contact-form"
import { StructuredData } from "@/components/structured-data"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { AstronautFilm } from "@/components/site/astronaut-film"
import { WorkGallery, type GalleryItem } from "@/components/site/work-gallery"
import { FILMS } from "@/lib/films"
import { MISSION_LOG, PERSON, PRODUCTS } from "@/lib/graph"
import { GRAPH_LAYOUT, GRAPH_LAYOUT_PORTRAIT, HUB_SIDES, STAR_NODES } from "@/lib/graph-layout"
import { GraphLayoutSwitch } from "@/components/site/graph-layout-switch"
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, SITE, WORKSHOP } from "@/lib/site"
import { homeJsonLd, pageMetadata, statusLabel } from "@/lib/seo"

export const metadata = pageMetadata({
  absoluteTitle: `${SITE.name}: ${SITE.homeTitle}`,
  description: SITE.description,
  path: "/",
})

/** Text in a section fades in once its particle shape has formed. */
function ready(formation: string, height?: string): CSSProperties {
  return {
    ["--ready" as string]: `var(--${formation}-ready, 1)`,
    ...(height ? { ["--fm-h" as string]: height } : {}),
  } as CSSProperties
}

function Kicker({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="kicker flex items-center gap-3">
      <span className="text-azure-light">{n}</span>
      <span aria-hidden="true" className="h-px w-6 bg-line" />
      <span>{children}</span>
    </p>
  )
}

/** The seven heaviest products, each shown with its real interface when it has a film. */
const SELECTED: GalleryItem[] = [...PRODUCTS]
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 7)
  .map((p) => ({
    slug: p.slug,
    name: p.name,
    src: FILMS[p.slug] ? `/work/${p.slug}/film-poster.webp` : p.image,
    alt: FILMS[p.slug] ? `${p.name} on screen, a still from its product film` : p.imageAlt,
    meta: p.started ? `${statusLabel(p.status)} · ${p.started.slice(0, 4)}` : statusLabel(p.status),
    line: p.oneLiner,
    logo: p.logo,
  }))

const WHAT_I_BUILD = [
  { name: "AI agents", line: "A personal AI assistant that answers my mail, looks up trains and fills shopping baskets. It can even make phone calls.", href: "/services/ai-automation" },
  { name: "MCP servers", line: "Connections that let AI assistants work with real things, like my camera, my photo library and my notes.", href: "/services/mcp-servers" },
  { name: "Self-hosted stacks", line: "My personal data runs on my own server at home, not in someone else's cloud.", href: "/services/private-ai-switzerland" },
  { name: "iOS apps", line: "Native iPhone and iPad apps in Swift, like Lodestar, which sets up my camera for the shot I describe.", href: "/services/ai-app-development" },
]

/** Habits that run through every build. One line each. */

export default function HomePage() {
  const staticNodes = STAR_NODES.map((n) => ({
    id: n.id,
    x: n.x,
    y: n.y,
    r: n.r,
    weight: n.weight,
    label: n.kind === "person" || n.kind === "product" || n.hub ? n.label : undefined,
    href: n.href,
    kind: n.kind,
  }))
  const labelled = STAR_NODES.filter((n) => n.kind === "person" || n.kind === "product" || n.hub)

  return (
    <>
      <StructuredData data={homeJsonLd()} />
      <Preloader />
      <SiteHeader />

      <main id="main">
        {/* 00 Portrait: the field forms David's face */}
        <section
          data-formation="portrait"
          aria-labelledby="hero-title"
          className="fm fm-hero"
          style={ready("portrait", "150vh")}
        >
          <div className="fm-stage">
            <div className="wrap grid items-center gap-12 md:grid-cols-12">
              <div className="fm-copy md:col-span-7 lg:col-span-6">
                <p className="kicker">Mission log. Geneva, Switzerland</p>
                <h1 id="hero-title" className="mt-6 text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.92] text-text">
                  <span className="block">David</span> <span className="block">Vinkenroye</span>
                </h1>
                <p className="hero-headline mt-6 max-w-xl text-xl leading-snug text-text md:mt-8 md:text-2xl">{PERSON.headline}.</p>
                <p className="fm-phone-hide mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground md:mt-4 md:text-lg">{PERSON.intro}</p>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground md:text-lg">
                  <Link href={WORKSHOP.path} className="link-line text-text">
                    Rive Foundry
                  </Link>
                  {WORKSHOP.line.replace(/^Rive Foundry/, "")}
                </p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {/* first sentence, then the rest on its own line */}
                  {PERSON.note.split(/(?<=\.) /).map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <div className="mt-7 flex flex-wrap gap-4 md:mt-10">
                  <Magnetic>
                    <a href="#work" className="btn-solid">
                      See the work
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <a href="#contact" className="btn">
                      Say hello
                    </a>
                  </Magnetic>
                </div>
              </div>
              <div className="pf-static mx-auto w-full max-w-md md:col-span-5 md:col-start-8 md:max-w-none">
                <StaticPortrait src={PERSON.portrait.cutout} alt={PERSON.portrait.alt} size={960} hideWhenParticles={false} priority={false} />
              </div>
            </div>
            <AstronautFilm />
          </div>
        </section>

        {/* 01 Suit up: portrait becomes an astronaut bust */}
        <section data-formation="astronaut-bust" aria-labelledby="approach-title" className="fm" style={ready("astronaut-bust")}>
          <div className="fm-stage">
            <div className="wrap">
              <div className="fm-copy max-w-xl">
                <Kicker n="01">Suit up</Kicker>
                <h2 id="approach-title" className="mt-6 text-4xl leading-[1.02] md:text-6xl">
                  It always starts with a problem I experience myself.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  Neonduck runs my errands, Dbrain remembers things for me and Lightbox sorts my photos. I use them
                  every day, and when one works really well, I turn it into a product.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 02 Spacewalk: the floating astronaut */}
        <section
          data-formation="astronaut-float"
          aria-labelledby="build-title"
          className="fm"
          style={ready("astronaut-float")}
        >
          <div className="fm-stage">
            <div className="wrap">
              <div className="fm-copy max-w-xl">
                <Kicker n="02">Spacewalk</Kicker>
                <h2 id="build-title" className="mt-6 text-4xl leading-[1.02] md:text-6xl">
                  What I build
                </h2>
                <ul className="mt-8 divide-y divide-line border-y border-line">
                  {WHAT_I_BUILD.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6">
                        <span className="w-48 shrink-0 text-lg text-text transition-colors group-hover:text-azure-light">
                          {item.name}
                        </span>
                        <span className="fm-phone-hide text-sm text-muted-foreground md:text-base">{item.line}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm">
                  <Link href="/services" className="link-line tap text-text">
                    Everything I can help with
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 03 Globe: Geneva lights up */}
        <section data-formation="globe" aria-labelledby="geneva-title" className="fm" style={ready("globe")}>
          <div className="fm-stage">
            <div className="wrap">
              <div className="fm-copy max-w-xl">
                <Kicker n="03">Ground station</Kicker>
                <h2 id="geneva-title" className="mt-6 text-4xl leading-[1.02] md:text-6xl">
                  Mission log.
                </h2>
                <p className="fm-phone-hide mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                  What I have been working on lately, newest first.
                </p>
                <ol className="mt-6 divide-y divide-line border-y border-line">
                  {MISSION_LOG.map((e, i) => (
                    <li key={e.date + e.text} className={`flex flex-col gap-1 py-3 sm:flex-row sm:gap-6${i >= 3 ? " fm-phone-hide" : ""}`}>
                      <time dateTime={e.date} className="kicker w-24 shrink-0 pt-1">
                        {e.label}
                      </time>
                      <span className="text-sm text-text md:text-base">
                        {e.href ? (
                          <Link href={e.href} className="link-quiet">
                            {e.text}
                          </Link>
                        ) : (
                          e.text
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 04 Lac Leman */}
        <section data-formation="leman" aria-labelledby="leman-title" className="fm" style={ready("leman")}>
          <div className="fm-stage">
            <div className="wrap">
              <div className="fm-copy max-w-lg">
                <Kicker n="04">Lac Léman</Kicker>
                <h2 id="leman-title" className="mt-6 text-4xl leading-[1.02] md:text-6xl">
                  Why I love living here.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                  I love Switzerland and life by the lake. Geneva is a city on a human scale with the airport right
                  next to town. The tech scene is vibrant and I keep meeting new people, many of them through{" "}
                  <Link href="/work/romandy-cto" className="link-line text-text">
                    romandycto.org
                  </Link>
                  .
                </p>
                <p className="fm-phone-hide mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                  And my favourite hobbies are close by: skiing, mountaineering and trail running. The Côte
                  d&apos;Azur is about five hours away, and Milan and the rest of Italy are close too.
                </p>
                <dl className="fm-phone-hide mt-8 grid grid-cols-2 gap-6">
                  <div>
                    <dt className="kicker">Home base</dt>
                    <dd className="mt-2 text-base text-text md:text-lg">
                      {PERSON.location.city}, {PERSON.location.country}
                    </dd>
                  </div>
                  <div>
                    <dt className="kicker">Languages</dt>
                    <dd className="mt-2 text-base text-text md:text-lg">{PERSON.languages.join(", ")}</dd>
                  </div>
                </dl>
              </div>
              <div className="pf-static mt-12 w-full max-w-md">
                <StaticLeman />
              </div>
            </div>
          </div>
          {/* Landmark names. With the field running each one sits on its spot of the map. */}
          <LemanLabels />
        </section>

        {/* 05 Constellation: the knowledge graph (signature) */}
        <section data-formation="graph" aria-labelledby="map-title" className="fm" style={ready("graph", "190vh")}>
          <GraphLayoutSwitch wide={GRAPH_LAYOUT} portrait={GRAPH_LAYOUT_PORTRAIT} />
          <div className="fm-stage !items-start">
            <div className="wrap pt-24 md:pt-16">
              <div className="fm-copy max-w-md">
                <Kicker n="05">Constellation</Kicker>
                <h2 id="map-title" className="mt-5 text-3xl leading-[1.05] md:text-5xl">
                  How it all connects.
                </h2>
                <p className="graph-intro mt-4 text-base leading-relaxed text-muted-foreground">
                  {PRODUCTS.length} products, ventures and concepts in seven groups: my home stack, cameras and photos,
                  tech people, communities, my workshop and company, family, and ideas I am still working on. The lines show how they are linked. Click a
                  star to open a project.
                </p>
              </div>
              <StaticGraph
                nodes={staticNodes}
                edges={GRAPH_LAYOUT.edges}
                className="mt-12 h-auto w-full max-w-5xl"
                title="Star map of David Vinkenroye's products, themes and tools"
              />
            </div>
          </div>
          {/* Real links. With the field running each one floats on its star. */}
          <ul className="graph-labels wrap" aria-label="Products on the map">
            {labelled.map((n) => (
              <GraphLabel
                key={n.id}
                id={n.id}
                className={n.hub ? "graph-hub" : undefined}
                side={n.hub ? HUB_SIDES[n.id] : undefined}
              >
                {n.href ? <a href={n.href}>{n.label}</a> : <span>{n.label}</span>}
              </GraphLabel>
            ))}
          </ul>
        </section>

        {/* 06 Selected work: scrolling slides the cards sideways, and they ripple while they move */}
        <WorkGallery
          items={SELECTED}
          head={
            <>
              <div>
                <Kicker n="06">Selected work</Kicker>
                <h2 id="work-title" className="mt-6 text-4xl leading-[1.02] md:text-6xl">
                  A few favourites
                </h2>
              </div>
              <Link href="/work" className="link-line tap text-sm text-muted-foreground">
                All {PRODUCTS.length} projects
              </Link>
            </>
          }
        />

        {/* 07 My DNA: a double helix turns and slides as you scroll */}
        <section id="dna" data-formation="helix" aria-labelledby="dna-title" className="fm" style={ready("helix")}>
          <div className="fm-stage">
            <div className="wrap grid items-center gap-12 lg:grid-cols-12">
              <div className="fm-copy max-w-lg lg:col-span-5 lg:max-w-none">
                <Kicker n="07">My DNA</Kicker>
                <h2 id="dna-title" className="mt-6 text-4xl leading-[1.02] md:text-6xl">
                  Creativity and problem solving.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  I am passionate about what I do because I can let my creativity run free, and I love solving
                  problems.
                </p>
                <p className="mt-6 text-3xl leading-tight text-foreground md:text-4xl">The future is now!</p>
              </div>
              <div className="pf-static mx-auto w-full max-w-xs lg:col-span-5 lg:col-start-8 lg:max-w-sm">
                <StaticHelix />
              </div>
            </div>
          </div>
        </section>

        {/* 08 Orbit: Rive Foundry */}
        <section data-formation="orbits" aria-labelledby="rf-title" className="fm" style={ready("orbits")}>
          <div className="fm-stage">
            <div className="wrap">
              <div className="fm-copy max-w-lg">
                <Kicker n="08">Orbit</Kicker>
                <h2 id="rf-title" className="mt-6 text-4xl leading-[1.02] md:text-6xl">
                  Rive Foundry, my workshop.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  Everything on this site was made at Rive Foundry, from Neonduck and Lodestar to the family recipe
                  website. It is not a company with staff. It is the name I put on the things I build.
                </p>
                <div className="mt-8">
                  <Magnetic>
                    <Link href="/rive-foundry" className="btn">
                      Inside the workshop
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 09 Contact: the field outlines the form, the helmet returns */}
        <section
          id="contact"
          data-formation="contact"
          data-outline-target="contact-cta"
          aria-labelledby="contact-title"
          className="fm fm-flow"
          style={ready("contact")}
        >
          <div className="wrap grid gap-16 md:grid-cols-12">
            <div className="fm-copy md:col-span-5">
              <Kicker n="09">Send a signal</Kicker>
              <h2 id="contact-title" className="mt-6 text-4xl leading-[1.02] md:text-6xl">
                Say hello.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                <span className="block">I am always happy to share advice.</span>
                <span className="block">Write to me if you want to:</span>
              </p>
              <ul className="mt-4 max-w-md list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-azure-light">
                <li>
                  <Link href="/services/ai-automation" className="link-quiet">
                    automate a workflow in your company with AI agents
                  </Link>
                </li>
                <li>
                  <Link href="/services/ai-app-development" className="link-quiet">
                    build a product from the first idea to launch
                  </Link>
                </li>
                <li>
                  <Link href="/services/mcp-servers" className="link-quiet">
                    connect AI models and agents to your own tools and data
                  </Link>
                </li>
                <li>
                  <Link href="/services/private-ai-switzerland" className="link-quiet">
                    keep your data private, hosted in Switzerland or on your own servers
                  </Link>
                </li>
                <li>
                  <Link href="/work/haystack" className="link-quiet">
                    hire senior tech people, or find your next role
                  </Link>
                </li>
                <li>
                  <Link href="/work/romandy-cto" className="link-quiet">
                    organise an event with Romandy CTO, or speak at one
                  </Link>
                </li>
                <li>or just have a chat and swap ideas</li>
              </ul>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                Send me a few lines with the form or email me at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="link-line tap text-text">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
              <ul className="mt-8 flex gap-6 text-sm">
                <li>
                  <a href={LINKEDIN_URL} rel="me noopener" target="_blank" className="link-line tap text-muted-foreground">
                    LinkedIn
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={GITHUB_URL} rel="me noopener" target="_blank" className="link-line tap text-muted-foreground">
                    GitHub
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </div>
            <div id="contact-cta" className="contact-box mt-24 p-6 md:col-span-6 md:col-start-7 md:mt-28 md:p-10">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
