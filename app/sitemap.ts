import type { MetadataRoute } from "next"
import { PERSON } from "@/lib/graph"
import { FRONTIER, FRONTIER_HOW, frontierPostPath, getFrontierPosts } from "@/lib/frontier"
import { LOGBOOK, getPosts, postPath } from "@/lib/logbook"
import { SERVICES, SERVICES_PATH } from "@/lib/services"
import { WORKSHOP, CONTENT_UPDATED, SITE, SITE_URL } from "@/lib/site"
import { absoluteUrl, filmSitemapVideos, productsByWeight, workPath } from "@/lib/seo"


/**
 * Every indexable route. Privacy and terms stay indexable but are left out. The retired /login (308 to /), /events and /join
 * routes (308 to /rive-foundry) are deliberately absent.
 * lastModified is CONTENT_UPDATED, not the build time: a date that changes on
 * every deploy teaches crawlers to ignore it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(CONTENT_UPDATED)
  const posts = getPosts()
  const frontierPosts = getFrontierPosts()
  const portrait = absoluteUrl(PERSON?.portrait?.src ?? SITE.portrait)

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1, images: [portrait] },
    { url: `${SITE_URL}/work`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    ...productsByWeight()
      .filter((p) => p.slug !== "rive-foundry")
      .map((p) => ({
      url: absoluteUrl(workPath(p.slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: Math.round((0.6 + 0.2 * Math.min(1, Math.max(0, p.weight))) * 10) / 10,
      images: p.image ? [absoluteUrl(p.image)] : undefined,
      videos: filmSitemapVideos(p.slug),
    })),
    {
      url: absoluteUrl(WORKSHOP.path),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [absoluteUrl("/work/rive-foundry/hero.webp")],
      videos: filmSitemapVideos("rive-foundry"),
    },
    {
      url: absoluteUrl(SERVICES_PATH.en),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...SERVICES.map((s) => ({
      url: absoluteUrl(s.path.en),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    {
      url: absoluteUrl(LOGBOOK.path),
      lastModified: posts[0] ? new Date(posts[0].date) : lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((p) => ({
      url: absoluteUrl(postPath(p.slug)),
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    {
      url: absoluteUrl(FRONTIER.path),
      lastModified: frontierPosts[0] ? new Date(frontierPosts[0].date) : lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: absoluteUrl(FRONTIER_HOW),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...frontierPosts.map((p) => ({
      url: absoluteUrl(frontierPostPath(p.slug)),
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ]
}
