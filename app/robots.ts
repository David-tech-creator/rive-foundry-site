import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

/**
 * Names the AI answer-engine crawlers explicitly (GEO). A crawler that matches
 * a named group ignores the "*" group, so every group repeats the disallows.
 *
 * /login no longer exists: it 308-redirects home (next.config.mjs).
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Googlebot",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "DuckDuckBot",
  "Amazonbot",
  "meta-externalagent",
  "MistralAI-User",
  "cohere-ai",
  "YouBot",
  "CCBot",
]

const DISALLOW = ["/api/"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
