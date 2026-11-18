import fs from "node:fs"
import path from "node:path"

/**
 * The Logbook: David's notes and ideas, one Markdown file per post in
 * content/logbook/ (see the README there). Read at build time, so a new
 * post goes live with the next deploy.
 */

export type LogbookPost = {
  slug: string
  title: string
  /** YYYY-MM-DD */
  date: string
  summary: string
  /** rendered HTML, built from escaped text by renderMarkdown */
  html: string
  /** rough reading time in minutes */
  minutes: number
}

export type PostSection = {
  name: string
  path: string
  description: string
  /** the section this one sits under, for breadcrumbs */
  parent?: { name: string; path: string }
}

export const LOGBOOK: PostSection = {
  name: "Logbook",
  path: "/logbook",
  description: "Notes, ideas and things I am figuring out while I build, written by David Vinkenroye in Geneva.",
}

const DIR = path.join(process.cwd(), "content", "logbook")
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function parseFrontmatter(src: string): { data: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src)
  if (!m) return { data: {}, body: src }
  const data: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":")
    if (i < 1) continue
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "")
  }
  return { data, body: m[2] }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Only links that cannot run script: http(s), site paths, anchors and mail. */
function safeHref(href: string): string | null {
  const h = href.trim()
  if (/^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(h)) return h
  return null
}

/** Inline Markdown on already-escaped text. */
function inline(text: string): string {
  const codes: string[] = []
  let s = text.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (all, alt, src) => {
    const href = safeHref(src.replace(/&amp;/g, "&"))
    return href ? `<img src="${escapeHtml(href)}" alt="${alt}" loading="lazy" decoding="async" />` : all
  })
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, label, url) => {
    const href = safeHref(url.replace(/&amp;/g, "&"))
    if (!href) return label
    const external = /^https?:\/\//i.test(href)
    return `<a href="${escapeHtml(href)}"${external ? ' rel="noopener" target="_blank"' : ""}>${label}</a>`
  })
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`)
}

/** A small Markdown subset: headings, paragraphs, lists, quotes, code, images. */
export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md.replace(/\r\n/g, "\n")).split("\n")
  const out: string[] = []
  let para: string[] = []
  let list: { tag: "ul" | "ol"; items: string[] } | null = null
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`)
    para = []
  }
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`)
    list = null
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^```/.test(line)) {
      flushPara()
      flushList()
      const code: string[] = []
      while (++i < lines.length && !/^```/.test(lines[i])) code.push(lines[i])
      out.push(`<pre><code>${code.join("\n")}</code></pre>`)
      continue
    }
    const h = /^(#{2,4})\s+(.*)$/.exec(line)
    if (h) {
      flushPara()
      flushList()
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`)
      continue
    }
    const q = /^&gt;\s?(.*)$/.exec(line)
    if (q) {
      flushPara()
      flushList()
      out.push(`<blockquote><p>${inline(q[1])}</p></blockquote>`)
      continue
    }
    const li = /^\s*(?:([-*])|(\d+)\.)\s+(.*)$/.exec(line)
    if (li) {
      flushPara()
      const tag = li[1] ? "ul" : "ol"
      if (!list || list.tag !== tag) {
        flushList()
        list = { tag, items: [] }
      }
      list.items.push(li[3])
      continue
    }
    if (!line.trim()) {
      flushPara()
      flushList()
      continue
    }
    flushList()
    para.push(line.trim())
  }
  flushPara()
  flushList()
  // consecutive quote lines become one quote
  return out.join("\n").replace(/<\/blockquote>\n<blockquote>/g, "")
}

const cache = new Map<string, LogbookPost[]>()

/** Published posts in a content folder, newest first. Drafts, the README and bad slugs are skipped. */
export function readPosts(dir: string): LogbookPost[] {
  const hit = cache.get(dir)
  if (hit) return hit
  let files: string[] = []
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
  } catch {
    files = []
  }
  const posts: LogbookPost[] = []
  for (const file of files) {
    const slug = file.replace(/\.md$/, "")
    if (!SLUG_RE.test(slug)) continue
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(dir, file), "utf8"))
    if (data.draft === "true" || !data.title || !/^\d{4}-\d{2}-\d{2}$/.test(data.date ?? "")) continue
    const words = body.split(/\s+/).filter(Boolean).length
    posts.push({
      slug,
      title: data.title,
      date: data.date,
      summary: data.summary ?? "",
      html: renderMarkdown(body),
      minutes: Math.max(1, Math.round(words / 220)),
    })
  }
  const sorted = posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)))
  cache.set(dir, sorted)
  return sorted
}

export const getPosts = () => readPosts(DIR)

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug)

export const postPath = (slug: string) => `${LOGBOOK.path}/${slug}`

/** Keep "Dec 14" and similar month-day pairs on one line in titles. */
export function tidyTitle(title: string): string {
  return title.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})\b/g, "$1\u00a0$2")
}

export function formatPostDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  return `${d} ${months[m - 1]} ${y}`
}
