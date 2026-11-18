/**
 * Site-level facts: canonical URL, the person the site is about, and the
 * strings that metadata, JSON-LD, llms.txt and the OG images share.
 *
 * Product, bio and FAQ content lives in lib/graph.ts. This file holds only what
 * is about the site itself, so the two never contradict each other.
 *
 * Publishing rules: no email, phone, address or date of birth here. Everything
 * routes to the contact form (/#contact, POST /api/lead).
 */

/*
 * The apex and the non-hyphenated variants all redirect to www.rive-foundry.com,
 * so that is the canonical host. Pointing canonical tags, sitemap entries and
 * JSON-LD @ids at a redirecting URL splits ranking signals: keep this in sync
 * with whichever domain Vercel actually serves.
 */
export const SITE_URL = "https://www.rive-foundry.com"

export const LINKEDIN_URL = "https://www.linkedin.com/in/david-vinkenroye-1a479468/"
export const GITHUB_URL = "https://github.com/David-tech-creator"
/** Forwards to David's Gmail through Cloudflare Email Routing. Receive only. */
export const CONTACT_EMAIL = "david@rive-foundry.com"
export const EMINEON_URL = "https://www.emineon.com"

/** Bump when site content changes; feeds sitemap lastModified and dateModified. */
export const CONTENT_UPDATED = "2026-11-17"

export const SITE = {
  url: SITE_URL,
  /** The entity the site is about. Use exactly this spelling everywhere. */
  name: "David Vinkenroye",
  siteName: "David Vinkenroye",
  /** Kept for legal pages: the site is operated by David personally. */
  legalName: "David Vinkenroye",
  givenName: "David",
  familyName: "Vinkenroye",
  headline: "I build AI products in Geneva",
  /** what the home page <title> says after the name: the services people search for */
  homeTitle: "AI agents, automation and private AI in Geneva",
  tagline: "I build AI products in Geneva",
  /** ~155 chars: the description search engines and answer engines quote. */
  description:
    "David Vinkenroye builds AI products in Geneva: AI agents and workflow automation, MCP servers, private Swiss-hosted AI, web apps and iPhone apps.",
  locale: "en_US",
  language: "en",
  city: "Geneva",
  region: "Geneva",
  country: "CH",
  countryName: "Switzerland",
  linkedin: LINKEDIN_URL,
  github: GITHUB_URL,
  sameAs: [LINKEDIN_URL, GITHUB_URL] as string[],
  /** No X/Twitter account is published. Left undefined on purpose. */
  twitter: undefined as string | undefined,
  /** Theme colours, shared with manifest.json and the OG images. */
  colors: {
    background: "#1F1E22",
    surface: "#26252A",
    text: "#EDEDEF",
    muted: "#8B8A92",
    accent: "#007FFF",
    accentLight: "#4DA3FF",
  },
  /** Fallbacks if lib/graph.ts PERSON.portrait is not available. */
  portrait: "/portrait/david-stipple.png",
} as const

/**
 * Rive Foundry is the name of David's workshop, where his products get made,
 * and the name of this site's domain. Recruitment lives at Haystack, not here.
 */
export const WORKSHOP = {
  name: "Rive Foundry",
  path: "/rive-foundry",
  /** one line that explains the name; used in the hero, the page and the JSON-LD */
  line: "Rive Foundry is what I call my workshop. Rive is the district by the lake in Geneva, and a foundry is where things get made.",
  description:
    "David Vinkenroye's workshop in Geneva, where he builds his AI products. Rive is the district by the lake, and a foundry is where things get made.",
} as const

/**
 * Primary and long-tail terms. The name variants come first: ranking #1 for
 * "David Vinkenroye" is the job of this site. Mirror them in on-page copy so the
 * page earns them rather than only declaring them.
 */
export const KEYWORDS = [
  "David Vinkenroye",
  "Vinkenroye",
  "David Vinkenroye Geneva",
  "David Vinkenroye AI",
  "AI product builder Geneva",
  "AI products Geneva",
  "AI agents",
  "Claude Agent SDK",
  "MCP servers",
  "Model Context Protocol",
  "self-hosted AI",
  "agentic AI Switzerland",
  "iOS apps",
  "Lodestar camera assistant",
  "Neonduck",
  "Emineon",
  "Emineon OS",
  "Rive Foundry",
  "Romandy CTO",
  "Haystack tech recruitment",
]
