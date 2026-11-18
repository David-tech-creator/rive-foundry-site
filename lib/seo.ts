/**
 * SEO and GEO helpers: page metadata and one JSON-LD @graph with stable @ids.
 *
 * Every node is generated from lib/graph.ts (content) and lib/site.ts (site
 * facts), so the visible page, the structured data, llms.txt and the sitemap
 * can never disagree. Search engines and answer engines resolve an entity by
 * its @id: keep the IDs below stable forever, even if the copy changes.
 *
 * Usage in a page:
 *   export const metadata = pageMetadata({ title, description, path: "/work" })
 *   <StructuredData data={workIndexJsonLd()} />
 */
import type { Metadata } from "next"
import { PERSON, PRODUCTS, THEMES, FAQS } from "@/lib/graph"
import type { Product } from "@/lib/graph"
import { LOGBOOK, type LogbookPost, type PostSection } from "@/lib/logbook"
import { SERVICES, SERVICES_PATH, HUB_COPY, type Lang, type Service } from "@/lib/services"
import { WORKSHOP, CONTACT_EMAIL, CONTENT_UPDATED, KEYWORDS, SITE, SITE_URL } from "@/lib/site"
import { FILM_SIZE, FILMS_PUBLISHED, filmPaths, getFilm } from "@/lib/films"

/* ------------------------------------------------------------------------- */
/* URLs and IDs                                                                */
/* ------------------------------------------------------------------------- */

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function workPath(slug: string): string {
  // Rive Foundry has one page, the workshop page; /work/rive-foundry redirects there
  return slug === "rive-foundry" ? "/rive-foundry" : `/work/${slug}`
}

/** Stable @ids. Never rename these. */
export const ID = {
  website: `${SITE_URL}/#website`,
  person: `${SITE_URL}/#david`,
  portrait: `${SITE_URL}/#portrait`,
  riveFoundry: `${SITE_URL}/rive-foundry#organization`,
  emineon: `${SITE_URL}/#emineon`,
  romandyCto: `${SITE_URL}/#romandy-cto`,
  geneva: `${SITE_URL}/#geneva`,
  profilePage: `${SITE_URL}/#webpage`,
  faq: `${SITE_URL}/#faq`,
  workList: `${SITE_URL}/work#itemlist`,
  product: (slug: string) => `${SITE_URL}/work/${slug}#product`,
  webPage: (path: string) => `${absoluteUrl(path)}#webpage`,
  breadcrumb: (path: string) => `${absoluteUrl(path)}#breadcrumb`,
  film: (slug: string) => `${SITE_URL}/work/${slug}#film`,
} as const

/** Products whose entity is an Organization with its own stable @id. */
const ORG_ID_BY_SLUG: Record<string, string> = {
  "rive-foundry": ID.riveFoundry,
  emineon: ID.emineon,
}

/**
 * Products where David is not the sole creator: he is listed as
 * contributor, never as creator. None at the moment.
 */
const CONTRIBUTOR_ONLY = new Set<string>([])

/** David's role when he is not the creator, shown on pages and in llms-full.txt. */
export const CONTRIBUTOR_ROLE: Record<string, string> = {}

/**
 * Organizations David verifiably founded. Only these get `founder` in JSON-LD.
 * Rive Foundry is the name of his workshop and Haystack is a tech recruitment
 * agency whose site he built; neither is stated as founded in the sources, so
 * they never claim it.
 */
export const FOUNDED_BY_DAVID: ReadonlySet<string> = new Set<string>(["emineon"])

/** Topical knowsAbout for organization nodes (real topics, not slogans). */
const ORG_TOPICS: Record<string, string[]> = {
  "rive-foundry": ["AI agents", "Product development", "Self-hosted software"],
  haystack: ["Technology recruitment", "Engineering hiring", "Tech leadership search"],
}

export function isContributorOnly(slug: string): boolean {
  return CONTRIBUTOR_ONLY.has(slug)
}

export function productId(slug: string): string {
  if (ORG_ID_BY_SLUG[slug]) return ORG_ID_BY_SLUG[slug]
  return getProduct(slug)?.schemaType === "Organization" ? `${SITE_URL}/work/${slug}#organization` : ID.product(slug)
}

/* ------------------------------------------------------------------------- */
/* Data accessors (tolerant of the exact shape graph.ts ends up with)          */
/* ------------------------------------------------------------------------- */

export type FaqPair = { q: string; a: string }

/** FAQS in graph.ts may be {q,a} or {question,answer}; normalise both. */
export function faqPairs(): FaqPair[] {
  const list = (FAQS as unknown as Array<Record<string, unknown>>) ?? []
  return list
    .map((f) => ({
      q: String(f.q ?? f.question ?? ""),
      a: String(f.a ?? f.answer ?? ""),
    }))
    .filter((f) => f.q && f.a)
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

/** Products in display order: highest weight first. */
export function productsByWeight(): Product[] {
  return [...PRODUCTS].sort((a, b) => b.weight - a.weight)
}

export function portraitUrl(): string {
  return absoluteUrl(PERSON?.portrait?.src ?? SITE.portrait)
}

function themeLabels(ids: string[]): string[] {
  return ids.map((id) => THEMES.find((t) => t.id === id)?.label).filter((x): x is string => Boolean(x))
}

function startedToIso(started: string | undefined): string | undefined {
  if (!started) return undefined
  return /^\d{4}(-\d{2})?$/.test(started) ? started : undefined
}

function hostOf(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

/* ------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* ------------------------------------------------------------------------- */

export type PageMetaInput = {
  /** Page title without the site suffix; the layout template appends it. */
  title?: string
  /** Use this exact <title>, bypassing the layout template (home page). */
  absoluteTitle?: string
  description: string
  /** Path starting with "/", e.g. "/work/lodestar". Becomes the canonical. */
  path: string
  /**
   * Optional explicit OG image (path or absolute URL). Leave empty for the
   * site-wide /opengraph-image; a route's own opengraph-image.tsx wins over it.
   */
  image?: string
  imageAlt?: string
  type?: "website" | "profile" | "article"
  noindex?: boolean
  keywords?: string[]
  /** language of the page; "fr" pages get fr_CH and the html lang fix */
  lang?: Lang
  /** the same page in each language, for hreflang */
  languages?: Record<Lang, string>
}

/**
 * Pages with their own file-based opengraph-image.tsx, and that card's alt
 * text. /work/[slug] passes its card explicitly (workMetadata). Every other
 * page falls back to the site-wide card at /opengraph-image.
 */
const OWN_CARD: Record<string, string> = {
  "/": `${SITE.name}, ${SITE.headline}`,
  "/work": `Work by ${SITE.name}: products, ventures and concepts`,
  [WORKSHOP.path]: `${WORKSHOP.name}, the workshop of ${SITE.name} in Geneva`,
}

/** Social cards prefer descriptions under ~155 characters. */
export const META_DESCRIPTION_MAX = 155

export function pageMetadata(input: PageMetaInput): Metadata {
  const { title, absoluteTitle, description, path, image, imageAlt, type = "website", noindex, keywords, lang = "en", languages } = input
  const locale = lang === "fr" ? "fr_CH" : SITE.locale
  const url = absoluteUrl(path)
  const ogTitle = absoluteTitle ?? (title ? `${title} | ${SITE.siteName}` : SITE.siteName)
  // A page's own openGraph object replaces its parent's, file-based image
  // included, so always name the card: the page's own when it has one, else
  // the site-wide card. Absolute URLs, because LinkedIn and WhatsApp do not
  // resolve relative ones.
  const ownCard = OWN_CARD[path]
  const cardPath = image ?? (ownCard ? `${path === "/" ? "" : path}/opengraph-image` : "/opengraph-image")
  const images = [
    {
      url: absoluteUrl(cardPath),
      width: 1200,
      height: 630,
      alt: imageAlt ?? ownCard ?? (image ? ogTitle : OWN_CARD["/"]),
      type: "image/png",
    },
  ]

  const openGraph: Metadata["openGraph"] =
    type === "profile"
      ? {
          type: "profile",
          firstName: SITE.givenName,
          lastName: SITE.familyName,
          username: "David-tech-creator",
          title: ogTitle,
          description,
          url,
          siteName: SITE.siteName,
          locale,
          images,
        }
      : {
          type,
          title: ogTitle,
          description,
          url,
          siteName: SITE.siteName,
          locale,
          images,
        }

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    keywords: keywords ?? KEYWORDS,
    alternates: {
      canonical: url,
      ...(languages
        ? { languages: { en: absoluteUrl(languages.en), fr: absoluteUrl(languages.fr), "x-default": absoluteUrl(languages.en) } }
        : {}),
    },
    authors: [{ name: SITE.name, url: SITE_URL }],
    creator: SITE.name,
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: images.map(({ url, alt, width, height }) => ({ url, alt, width, height })),
    },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
        },
  }
}

/** Metadata for /work/[slug], straight from the product record. */
export function workMetadata(slug: string): Metadata {
  const p = getProduct(slug)
  if (!p) return pageMetadata({ title: "Work", description: SITE.description, path: "/work" })
  return pageMetadata({
    // Layout template appends " | David Vinkenroye"; keep the whole <title> near 60 chars.
    title: `${p.name}: ${p.oneLiner}`.length <= 42 ? `${p.name}: ${p.oneLiner}` : p.name,
    description: workDescription(p),
    path: workPath(p.slug),
    image: `${workPath(p.slug)}/opengraph-image`,
    imageAlt: `${p.name} by ${SITE.name}. ${p.oneLiner}`,
    type: "article",
    keywords: [p.name, `${p.name} ${SITE.name}`, SITE.name, ...p.stack.slice(0, 6)],
  })
}

/**
 * The product description when it fits a share card, else the one-liner with
 * a byline: never a sentence cut in half.
 */
function workDescription(p: Product): string {
  if (p.description.length <= META_DESCRIPTION_MAX) return p.description
  const withBy = `${p.oneLiner} By ${SITE.name}.`
  return withBy.length <= META_DESCRIPTION_MAX ? withBy : p.oneLiner
}

/** Whole sentences up to META_DESCRIPTION_MAX; never a sentence cut in half. */
export function sentenceTrim(text: string, max = META_DESCRIPTION_MAX): string {
  if (text.length <= max) return text
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? []
  let out = ""
  for (const s of sentences) {
    if ((out + s).trim().length > max) break
    out += s
  }
  return out.trim() || text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…"
}

/* ------------------------------------------------------------------------- */
/* JSON-LD nodes                                                               */
/* ------------------------------------------------------------------------- */

type Node = Record<string, unknown>
const ref = (id: string) => ({ "@id": id })

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: `${SITE_URL}/`,
    name: SITE.siteName,
    alternateName: ["Vinkenroye", "David Vinkenroye's website"],
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: ref(ID.person),
    author: ref(ID.person),
    about: ref(ID.person),
  }
}

export function personNode(): Node {
  const languages = PERSON?.languages ?? ["Dutch", "French", "English", "German"]
  const sameAs = Array.from(new Set([...(PERSON?.sameAs ?? []), ...SITE.sameAs]))

  return {
    "@type": "Person",
    "@id": ID.person,
    name: SITE.name,
    givenName: PERSON?.givenName ?? SITE.givenName,
    familyName: PERSON?.familyName ?? SITE.familyName,
    alternateName: ["Vinkenroye"],
    email: `mailto:${CONTACT_EMAIL}`,
    url: `${SITE_URL}/`,
    mainEntityOfPage: ref(ID.profilePage),
    image: {
      "@type": "ImageObject",
      "@id": ID.portrait,
      url: portraitUrl(),
      caption: PERSON?.portrait?.alt ?? `Portrait of ${SITE.name}`,
    },
    description: PERSON?.bio ?? SITE.description,
    disambiguatingDescription: PERSON?.headline ?? SITE.headline,
    worksFor: [ref(ID.riveFoundry), ref(ID.emineon)],
    memberOf: [ref(ID.romandyCto)],
    homeLocation: ref(ID.geneva),
    workLocation: ref(ID.geneva),
    jobTitle: "AI product builder",
    knowsLanguage: languages.map((name) => ({ "@type": "Language", name })),
    makesOffer: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: ref(serviceId(s)),
      areaServed: [ref(ID.geneva), { "@type": "Country", name: "Switzerland" }],
    })),
    knowsAbout: [...(PERSON?.knowsAbout ?? []), ...(PERSON?.interests ?? [])],
    sameAs,
    subjectOf: [ref(ID.profilePage), ref(ID.website)],
  }
}

export function genevaNode(): Node {
  return {
    "@type": "Place",
    "@id": ID.geneva,
    name: "Geneva, Switzerland",
    address: { "@type": "PostalAddress", addressLocality: "Geneva", addressRegion: "Geneva", addressCountry: "CH" },
    sameAs: ["https://www.wikidata.org/wiki/Q71", "https://en.wikipedia.org/wiki/Geneva"],
  }
}

function organizationFromProduct(id: string, p: Product | undefined, fallback: Node): Node {
  return {
    "@type": "Organization",
    "@id": id,
    ...fallback,
    ...(p
      ? {
          name: p.name,
          description: p.description,
          ...(p.url && !p.url.startsWith(SITE_URL) ? { sameAs: [p.url] } : {}),
          subjectOf: ref(ID.webPage(workPath(p.slug))),
          ...(startedToIso(p.started) ? { foundingDate: startedToIso(p.started) } : {}),
          ...(ORG_TOPICS[p.slug] ? { knowsAbout: ORG_TOPICS[p.slug] } : {}),
        }
      : {}),
    ...(p && FOUNDED_BY_DAVID.has(p.slug) ? { founder: ref(ID.person) } : {}),
    location: ref(ID.geneva),
  }
}

export function riveFoundryNode(): Node {
  const p = getProduct("rive-foundry")
  return organizationFromProduct(ID.riveFoundry, p, {
    name: WORKSHOP.name,
    description: WORKSHOP.description,
    url: absoluteUrl(WORKSHOP.path),
    logo: absoluteUrl("/logo.png"),
    areaServed: { "@type": "Country", name: "Switzerland" },
  })
}

export function emineonNode(): Node {
  const p = getProduct("emineon")
  const url = p?.url ?? "https://www.emineon.com"
  return {
    ...organizationFromProduct(ID.emineon, p, { name: "Emineon", description: "Emineon is the company David Vinkenroye founded." }),
    url,
    sameAs: [url],
  }
}

export function romandyCtoNode(): Node {
  const p = getProduct("romandy-cto")
  return {
    "@type": "Organization",
    "@id": ID.romandyCto,
    name: "Romandy CTO",
    description: "A community of CTOs and engineering leaders in French-speaking Switzerland.",
    url: p?.url ?? "https://romandycto.org",
    sameAs: [p?.url ?? "https://romandycto.org"],
    areaServed: { "@type": "Place", name: "Romandy, Switzerland" },
    member: ref(ID.person),
  }
}

/** One node per product. Organisation-type products reuse the org @ids above. */
export function productNode(p: Product): Node {
  const page = absoluteUrl(workPath(p.slug))
  const isContributor = CONTRIBUTOR_ONLY.has(p.slug)
  const people = isContributor ? { contributor: ref(ID.person) } : { creator: ref(ID.person), author: ref(ID.person) }
  const common: Node = {
    name: p.name,
    description: p.description,
    abstract: p.oneLiner,
    url: p.url ?? page,
    mainEntityOfPage: ref(ID.webPage(workPath(p.slug))),
    image: absoluteUrl(p.image),
    keywords: [...p.stack, ...themeLabels(p.themes)].join(", "),
    ...(startedToIso(p.started) ? { dateCreated: startedToIso(p.started) } : {}),
    ...(p.url ? { sameAs: [p.url] } : {}),
    creativeWorkStatus: p.status,
    ...(p.slug === "romandy-cto" ? { about: ref(ID.romandyCto) } : {}),
  }

  if (p.slug === "rive-foundry") return riveFoundryNode()
  if (p.slug === "emineon") return emineonNode()

  if (p.schemaType === "Organization") {
    const { creativeWorkStatus: _s, abstract: _a, mainEntityOfPage: _m, ...org } = common
    return {
      "@type": "Organization",
      "@id": productId(p.slug),
      ...org,
      ...(FOUNDED_BY_DAVID.has(p.slug) ? { founder: ref(ID.person) } : {}),
      subjectOf: ref(ID.webPage(workPath(p.slug))),
    }
  }

  if (p.schemaType === "CreativeWork") {
    return {
      "@type": "CreativeWork",
      "@id": productId(p.slug),
      ...common,
      ...people,
      genre: p.kind === "concept" ? "Product concept" : undefined,
    }
  }

  const os = p.operatingSystem ?? (p.platforms.length ? p.platforms.join(", ") : undefined)
  return {
    "@type": p.schemaType,
    "@id": productId(p.slug),
    ...common,
    ...people,
    applicationCategory: p.applicationCategory ?? (p.schemaType === "MobileApplication" ? "MultimediaApplication" : "BusinessApplication"),
    ...(os ? { operatingSystem: os } : {}),
  }
}

/** The product film on /work/[slug], for products that have one (lib/films.ts). */
export function filmNode(p: Product): Node | null {
  const film = getFilm(p.slug)
  if (!film) return null
  const files = filmPaths(p.slug)
  return {
    "@type": "VideoObject",
    "@id": ID.film(p.slug),
    name: `${p.name}, running`,
    description: film.description,
    thumbnailUrl: absoluteUrl(files.poster),
    contentUrl: absoluteUrl(files.src),
    uploadDate: film.published ?? FILMS_PUBLISHED,
    duration: `PT${film.seconds}S`,
    width: FILM_SIZE.width,
    height: FILM_SIZE.height,
    encodingFormat: "video/mp4",
    isFamilyFriendly: true,
    inLanguage: SITE.language,
    about: ref(productId(p.slug)),
    creator: ref(ID.person),
    isPartOf: ref(ID.webPage(workPath(p.slug))),
  }
}

/** Sitemap video entry for a product film, or none. */
export function filmSitemapVideos(slug: string) {
  const p = getProduct(slug)
  const film = getFilm(slug)
  if (!p || !film) return undefined
  const files = filmPaths(slug)
  return [
    {
      title: `${p.name}, running`,
      description: film.description,
      thumbnail_loc: absoluteUrl(files.poster),
      content_loc: absoluteUrl(files.src),
      duration: film.seconds,
      publication_date: film.published ?? FILMS_PUBLISHED,
      family_friendly: "yes" as const,
    },
  ]
}

export function faqNode(): Node {
  return {
    "@type": "FAQPage",
    "@id": ID.faq,
    url: absoluteUrl("/#faq"),
    isPartOf: ref(ID.website),
    about: ref(ID.person),
    mainEntity: faqPairs().map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
}

export type Crumb = { name: string; path: string }

export function breadcrumbNode(path: string, crumbs: Crumb[]): Node {
  const all = crumbs[0]?.path === "/" ? crumbs : [{ name: SITE.name, path: "/" }, ...crumbs]
  return {
    "@type": "BreadcrumbList",
    "@id": ID.breadcrumb(path),
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}

export function webPageNode(opts: {
  path: string
  name: string
  description: string
  type?: string
  about?: string
  mainEntity?: string
  breadcrumb?: boolean
  image?: string
  video?: string
}): Node {
  return {
    "@type": opts.type ?? "WebPage",
    "@id": ID.webPage(opts.path),
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    isPartOf: ref(ID.website),
    inLanguage: SITE.language,
    dateModified: `${CONTENT_UPDATED}T00:00:00Z`,
    ...(opts.about ? { about: ref(opts.about) } : {}),
    ...(opts.mainEntity ? { mainEntity: ref(opts.mainEntity) } : {}),
    ...(opts.breadcrumb ? { breadcrumb: ref(ID.breadcrumb(opts.path)) } : {}),
    ...(opts.image ? { primaryImageOfPage: absoluteUrl(opts.image) } : {}),
    ...(opts.video ? { video: ref(opts.video) } : {}),
    author: ref(ID.person),
  }
}

export function workItemListNode(): Node {
  const list = productsByWeight()
  return {
    "@type": "ItemList",
    "@id": ID.workList,
    name: `Work by ${SITE.name}`,
    numberOfItems: list.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: list.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(workPath(p.slug)),
      name: p.name,
      item: ref(productId(p.slug)),
    })),
  }
}

/* ------------------------------------------------------------------------- */
/* Graphs                                                                      */
/* ------------------------------------------------------------------------- */

export type JsonLd = { "@context": "https://schema.org"; "@graph": Node[] }

/** Drop undefined values and de-duplicate nodes by @id (first wins). */
export function jsonLd(...nodes: Node[]): JsonLd {
  const seen = new Set<string>()
  const out: Node[] = []
  for (const n of nodes) {
    const id = n["@id"] as string | undefined
    if (id && seen.has(id)) continue
    if (id) seen.add(id)
    out.push(n)
  }
  return { "@context": "https://schema.org", "@graph": JSON.parse(JSON.stringify(out)) }
}

/** The entity core every page carries: website, person, place, organisations. */
function coreNodes(): Node[] {
  return [websiteNode(), personNode(), genevaNode(), riveFoundryNode(), emineonNode(), romandyCtoNode()]
}

/** The whole site as one graph: core entities plus every product. */
export function buildGraph(): JsonLd {
  return jsonLd(...coreNodes(), ...PRODUCTS.map(productNode))
}

export function homeJsonLd(): JsonLd {
  return jsonLd(
    ...coreNodes(),
    { ...webPageNode({ path: "/", type: "ProfilePage", name: `${SITE.name}: ${SITE.homeTitle}`, description: SITE.description, about: ID.person, mainEntity: ID.person, image: PERSON?.portrait?.src ?? SITE.portrait }), dateCreated: "2026-10-25T00:00:00Z" },
    ...SERVICES.map((s) => serviceNode(s)),
    workItemListNode(),
    ...PRODUCTS.map(productNode),
  )
}

export function workIndexJsonLd(): JsonLd {
  return jsonLd(
    ...coreNodes(),
    webPageNode({ path: "/work", name: `Work by ${SITE.name}`, description: `Products, ventures and concepts built by ${SITE.name}.`, type: "CollectionPage", about: ID.person, mainEntity: ID.workList, breadcrumb: true }),
    workItemListNode(),
    breadcrumbNode("/work", [{ name: "Work", path: "/work" }]),
    ...PRODUCTS.map(productNode),
  )
}

export function workJsonLd(slug: string): JsonLd {
  const p = getProduct(slug)
  if (!p) return buildGraph()
  const path = workPath(slug)
  const film = filmNode(p)
  return jsonLd(
    webPageNode({ path, name: `${p.name} by ${SITE.name}`, description: p.description, type: "ItemPage", about: productId(slug), mainEntity: productId(slug), breadcrumb: true, image: p.image, video: film ? ID.film(slug) : undefined }),
    productNode(p),
    ...(film ? [film] : []),
    ...coreNodes(),
    breadcrumbNode(path, [
      { name: "Work", path: "/work" },
      { name: p.name, path },
    ]),
  )
}

export function riveFoundryJsonLd(): JsonLd {
  const p = getProduct("rive-foundry")
  const film = p ? filmNode(p) : null
  return jsonLd(
    webPageNode({ path: WORKSHOP.path, name: `${WORKSHOP.name}, the workshop of ${SITE.name}`, description: WORKSHOP.description, type: "AboutPage", about: ID.riveFoundry, mainEntity: ID.riveFoundry, breadcrumb: true, image: p?.image, video: film ? ID.film("rive-foundry") : undefined }),
    ...(film ? [film] : []),
    ...coreNodes(),
    breadcrumbNode(WORKSHOP.path, [{ name: WORKSHOP.name, path: WORKSHOP.path }]),
  )
}

/** Generic page (privacy, terms): core entities + a WebPage + breadcrumb. */
export function simplePageJsonLd(path: string, name: string, description: string): JsonLd {
  return jsonLd(
    webPageNode({ path, name, description, breadcrumb: true }),
    websiteNode(),
    personNode(),
    breadcrumbNode(path, [{ name, path }]),
  )
}

/* ------------------------------------------------------------------------- */
/* Services                                                                    */
/* ------------------------------------------------------------------------- */

export const serviceId = (s: Service) => `${absoluteUrl(s.path.en)}#service`

const LANGUAGE_CODES = ["fr", "en", "de", "nl"]

export function serviceNode(s: Service, lang: Lang = "en"): Node {
  const c = s.copy[lang]
  return {
    "@type": "Service",
    "@id": serviceId(s),
    name: s.copy.en.short,
    alternateName: s.copy.fr.short,
    serviceType: s.serviceType,
    description: c.description,
    url: absoluteUrl(s.path[lang]),
    provider: ref(ID.person),
    brand: ref(ID.riveFoundry),
    areaServed: [ref(ID.geneva), { "@type": "Country", name: "Switzerland" }],
    availableLanguage: LANGUAGE_CODES,
    isRelatedTo: c.proof.map((p) => ref(productId(p.slug))),
  }
}

/** /services and /fr: the list of offers. */
export function servicesHubJsonLd(lang: Lang): JsonLd {
  const path = SERVICES_PATH[lang]
  const hub = HUB_COPY[lang]
  return jsonLd(
    { ...webPageNode({ path, name: hub.title, description: hub.description, type: "CollectionPage", about: ID.person, breadcrumb: true }), inLanguage: lang },
    {
      "@type": "ItemList",
      "@id": `${absoluteUrl(path)}#services`,
      name: hub.h1,
      itemListElement: SERVICES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(s.path[lang]),
        name: s.copy[lang].short,
        item: ref(serviceId(s)),
      })),
    },
    ...SERVICES.map((s) => serviceNode(s, lang)),
    ...coreNodes(),
    breadcrumbNode(path, [{ name: lang === "fr" ? "En français" : "Services", path }]),
  )
}

/** One service page, with its visible questions as FAQPage. */
export function servicePageJsonLd(s: Service, lang: Lang): JsonLd {
  const path = s.path[lang]
  const c = s.copy[lang]
  return jsonLd(
    { ...webPageNode({ path, name: c.title, description: c.description, about: serviceId(s), mainEntity: serviceId(s), breadcrumb: true }), inLanguage: lang },
    serviceNode(s, lang),
    {
      "@type": "FAQPage",
      "@id": `${absoluteUrl(path)}#faq`,
      inLanguage: lang,
      mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    ...coreNodes(),
    breadcrumbNode(path, [
      { name: lang === "fr" ? "En français" : "Services", path: SERVICES_PATH[lang] },
      { name: c.short, path },
    ]),
  )
}

/** A post section's list page: the Blog, with every published post. */
export function postSectionJsonLd(section: PostSection, posts: LogbookPost[]): JsonLd {
  const blogId = `${absoluteUrl(section.path)}#blog`
  const urlOf = (slug: string) => absoluteUrl(`${section.path}/${slug}`)
  return jsonLd(
    webPageNode({ path: section.path, name: `${section.name} by ${SITE.name}`, description: section.description, type: "CollectionPage", about: ID.person, mainEntity: blogId, breadcrumb: true }),
    {
      "@type": "Blog",
      "@id": blogId,
      name: `${section.name}, ${SITE.name}`,
      description: section.description,
      url: absoluteUrl(section.path),
      inLanguage: SITE.language,
      author: ref(ID.person),
      publisher: ref(ID.person),
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        "@id": `${urlOf(p.slug)}#post`,
        headline: p.title,
        url: urlOf(p.slug),
        datePublished: p.date,
      })),
    },
    websiteNode(),
    personNode(),
    breadcrumbNode(section.path, [...(section.parent ? [section.parent] : []), { name: section.name, path: section.path }]),
  )
}

/** One post in a section: a BlogPosting by David. */
export function postJsonLd(p: LogbookPost, section: PostSection = LOGBOOK): JsonLd {
  const path = `${section.path}/${p.slug}`
  return jsonLd(
    webPageNode({ path, name: p.title, description: p.summary || p.title, type: "WebPage", mainEntity: `${absoluteUrl(path)}#post`, breadcrumb: true }),
    {
      "@type": "BlogPosting",
      "@id": `${absoluteUrl(path)}#post`,
      headline: p.title,
      description: p.summary || undefined,
      url: absoluteUrl(path),
      datePublished: p.date,
      dateModified: p.date,
      inLanguage: SITE.language,
      author: ref(ID.person),
      publisher: ref(ID.person),
      isPartOf: { "@id": `${absoluteUrl(section.path)}#blog` },
      mainEntityOfPage: ref(ID.webPage(path)),
    },
    websiteNode(),
    personNode(),
    breadcrumbNode(path, [
      ...(section.parent ? [section.parent] : []),
      { name: section.name, path: section.path },
      { name: p.title, path },
    ]),
  )
}

/** For external links back to products: "Built by David Vinkenroye" anchors. */
export function productHost(slug: string): string | undefined {
  return hostOf(getProduct(slug)?.url)
}

/* ------------------------------------------------------------------------- */
/* OG image font                                                               */
/* ------------------------------------------------------------------------- */

/**
 * Loads Inter Tight from Google Fonts as TTF for next/og. Passing `text`
 * subsets the font to just those glyphs. Returns null when offline so the OG
 * route falls back to the default sans instead of failing the build.
 */
export async function loadOgFont(weight: 300 | 400 | 500, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Inter+Tight:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text()
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    if (!src) return null
    const res = await fetch(src)
    return res.ok ? await res.arrayBuffer() : null
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------------- */
/* Shared text helpers (llms.txt, llms-full.txt, OG images)                    */
/* ------------------------------------------------------------------------- */

const STATUS_LABEL: Record<Product["status"], string> = {
  live: "Live",
  beta: "Beta",
  prototype: "Working prototype",
  concept: "Concept, in progress",
  private: "Private tool, in daily use",
}

export function statusLabel(status: Product["status"]): string {
  return STATUS_LABEL[status] ?? status
}

export function themeLabelList(ids: string[]): string[] {
  return themeLabels(ids)
}
