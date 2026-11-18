import path from "node:path"
import { LOGBOOK, readPosts, type PostSection } from "@/lib/logbook"

/**
 * Frontier: the part of the Logbook on what changed at the AI labs. One Markdown
 * file per post in content/frontier/, written and published by the agent in
 * nas/frontier/. Same format as the Logbook.
 */

export const FRONTIER: PostSection = {
  name: "Frontier",
  path: `${LOGBOOK.path}/frontier`,
  description: "What changed at the AI labs and how to work with it: Claude Code, Codex, Gemini and friends. Written by an agent David Vinkenroye built, in his voice.",
  parent: { name: LOGBOOK.name, path: LOGBOOK.path },
}

export const FRONTIER_FEED = `${FRONTIER.path}/rss.xml`
export const FRONTIER_HOW = `${FRONTIER.path}/how-it-works`
export const FRONTIER_OG = `${FRONTIER.path}/opengraph-image`
export const FRONTIER_OG_ALT = "Frontier: a mountain range drawn in particles"

const DIR = path.join(process.cwd(), "content", "frontier")

export const getFrontierPosts = () => readPosts(DIR)

export const getFrontierPost = (slug: string) => getFrontierPosts().find((p) => p.slug === slug)

export const frontierPostPath = (slug: string) => `${FRONTIER.path}/${slug}`
