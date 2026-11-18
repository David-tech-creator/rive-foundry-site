import Link from "next/link"
import { PostIndex } from "@/components/site/post-index"
import { FRONTIER, frontierPostPath, getFrontierPosts } from "@/lib/frontier"
import { LOGBOOK, formatPostDate, getPosts, tidyTitle } from "@/lib/logbook"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Logbook",
  description: LOGBOOK.description,
  path: LOGBOOK.path,
})

export default function LogbookPage() {
  const frontier = getFrontierPosts().slice(0, 5)
  return (
    <PostIndex
      section={LOGBOOK}
      posts={getPosts()}
      intro="Notes from the workshop: ideas, things I am trying, and what I learn while I build."
    >
      <section aria-labelledby="frontier" className="hairline mt-20 pt-10 md:mt-28">
        <h2 id="frontier" className="text-3xl md:text-4xl">
          <Link href={FRONTIER.path} className="link-quiet">
            {FRONTIER.name}
          </Link>
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          What changed at the AI labs and what I would do with it, written every morning by an agent I built.{" "}
          <Link href={FRONTIER.path} className="link-quiet text-text">
            See how it works
          </Link>
          .
        </p>
        {frontier.length ? (
          <ol className="mt-8 divide-y divide-line">
            {frontier.map((p) => (
              <li key={p.slug}>
                <Link href={frontierPostPath(p.slug)} className="group grid gap-2 py-6 md:grid-cols-12 md:gap-10">
                  <time dateTime={p.date} className="kicker pt-1 md:col-span-3">
                    {formatPostDate(p.date)}
                  </time>
                  <span className="text-balance text-xl text-text transition-colors group-hover:text-azure-light md:col-span-8 md:text-2xl">
                    {tidyTitle(p.title)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </PostIndex>
  )
}
