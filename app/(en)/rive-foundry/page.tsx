import Image from "next/image"
import Link from "next/link"
import { ContactForm } from "@/components/contact-form"
import { StructuredData } from "@/components/structured-data"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { CONSTELLATIONS, getProduct, getTheme } from "@/lib/graph"
import { FILM_SIZE, filmPaths, getFilm } from "@/lib/films"
import { ProductFilm } from "@/components/site/product-film"
import { WORKSHOP } from "@/lib/site"
import { pageMetadata, riveFoundryJsonLd, workPath } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Rive Foundry, my workshop in Geneva",
  description: WORKSHOP.description,
  path: WORKSHOP.path,
})

/** Every group on the star map, without Rive Foundry itself. */
const MADE_HERE = CONSTELLATIONS.map((c) => ({
  label: c.label,
  products: c.members
    .filter((slug) => slug !== "rive-foundry")
    .map((slug) => getProduct(slug))
    .filter((p): p is NonNullable<typeof p> => !!p),
})).filter((g) => g.products.length > 0)

/** How things get made, in the words already used on the theme pages. */
const HOW = [
  {
    title: "It starts with my own problem",
    body: "Neonduck runs my errands, Dbrain remembers things for me and Lightbox sorts my photos. I use them every day, and when one works really well, I turn it into a product.",
  },
  { title: "Ask before acting", body: getTheme("human-in-the-loop")?.summary ?? "" },
  { title: "My data stays at home", body: getTheme("self-hosting")?.summary ?? "" },
].filter((h) => h.body)

export default function RiveFoundryPage() {
  const rf = getProduct("rive-foundry")
  const film = getFilm("rive-foundry")

  return (
    <>
      <StructuredData data={riveFoundryJsonLd()} />
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
              <li aria-current="page">Rive Foundry</li>
            </ol>
          </nav>

          <h1 className="mt-8 text-[clamp(3rem,8vw,6.5rem)] leading-[0.95]">Rive Foundry</h1>
          <p className="mt-6 max-w-2xl text-xl leading-snug text-text md:text-2xl">
            My workshop in Geneva, where I build my products. This website is its home.
          </p>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Rive is the district in the centre of Geneva, by the lake. A foundry is a factory, the place where things
            get made. Everything on this site was made here.
          </p>

          {rf ? (
            <div className="relative mt-14 aspect-[3/2] overflow-hidden bg-surface md:mt-20 md:aspect-[21/9]">
              <Image
                quality={85}
                src={rf.image}
                alt={rf.imageAlt}
                width={1536}
                height={1024}
                sizes="(min-width: 1360px) 1280px, 100vw"
                priority
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <section aria-labelledby="made-title" className="mt-24 md:mt-32">
            <div className="hairline grid gap-12 pt-8 md:grid-cols-12">
              <h2 id="made-title" className="text-3xl md:col-span-4 md:text-4xl">
                What gets made here
              </h2>
              <div className="grid gap-10 sm:grid-cols-2 md:col-span-7 md:col-start-6">
                {MADE_HERE.map((g) => (
                  <div key={g.label}>
                    <h3 className="kicker">{g.label}</h3>
                    <ul className="mt-3 space-y-3">
                      {g.products.map((p) => (
                        <li key={p.slug}>
                          <Link href={workPath(p.slug)} className="link-quiet tap text-lg text-text">
                            {p.name}
                          </Link>
                          <p className="text-sm leading-relaxed text-muted-foreground">{p.oneLiner}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="how-title" className="mt-24 md:mt-32">
            <div className="hairline grid gap-12 pt-8 md:grid-cols-12">
              <h2 id="how-title" className="text-3xl md:col-span-4 md:text-4xl">
                How I work
              </h2>
              <ul className="grid gap-10 md:col-span-7 md:col-start-6">
                {HOW.map((h) => (
                  <li key={h.title}>
                    <h3 className="text-xl text-text md:text-2xl">{h.title}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-muted-foreground">{h.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {rf ? (
            <section aria-labelledby="site-title" className="mt-24 md:mt-32">
              <div className="hairline grid gap-12 pt-8 md:grid-cols-12">
                <h2 id="site-title" className="text-3xl md:col-span-4 md:text-4xl">
                  This website
                </h2>
                <div className="md:col-span-7 md:col-start-6">
                  <p className="text-lg leading-relaxed text-muted-foreground">{rf.story[2]}</p>
                  <ul className="mt-6 list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-azure-light">
                    {rf.highlights.slice(1).map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {film ? (
                <div className="mt-12">
                  <ProductFilm {...filmPaths("rive-foundry")} label={film.description} width={FILM_SIZE.width} height={FILM_SIZE.height} smallAspect={film.smallAspect} />
                </div>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="hiring-title" className="mt-24 md:mt-32">
            <div className="hairline grid gap-12 pt-8 md:grid-cols-12">
              <h2 id="hiring-title" className="text-3xl md:col-span-4 md:text-4xl">
                Looking to hire?
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground md:col-span-7 md:col-start-6">
                Rive Foundry is where I build things. If you are hiring tech people or looking for your next role,
                that is{" "}
                <Link href={workPath("haystack")} className="link-line text-text">
                  Haystack
                </Link>
                .
              </p>
            </div>
          </section>

          <section id="contact" aria-labelledby="rf-contact-title" className="mt-24 md:mt-32">
            <div className="hairline grid gap-12 pt-8 md:grid-cols-12">
              <div className="md:col-span-4">
                <h2 id="rf-contact-title" className="text-3xl md:text-4xl">
                  Say hello.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">A few lines are enough.</p>
              </div>
              <div className="border border-line p-6 md:col-span-7 md:col-start-6 md:p-10">
                <ContactForm source="rive-foundry" />
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
