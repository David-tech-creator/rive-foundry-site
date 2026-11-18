import Link from "next/link"
import { StructuredData } from "@/components/structured-data"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import type { ReactNode } from "react"
import { formatPostDate, tidyTitle, type LogbookPost, type PostSection } from "@/lib/logbook"
import { postJsonLd } from "@/lib/seo"
import { SITE } from "@/lib/site"

export function PostArticle({ section, post: p, posts, after }: { section: PostSection; post: LogbookPost; posts: LogbookPost[]; after?: ReactNode }) {
  const i = posts.findIndex((x) => x.slug === p.slug)
  const newer = i > 0 ? posts[i - 1] : null
  const older = i < posts.length - 1 ? posts[i + 1] : null
  const pathOf = (slug: string) => `${section.path}/${slug}`

  return (
    <>
      <StructuredData data={postJsonLd(p, section)} />
      <SiteHeader />
      <main id="main" className="pb-24 pt-36 md:pt-44">
        <article className="wrap">
          <nav aria-label="Breadcrumb" className="kicker">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="link-quiet tap">
                  Home
                </Link>
              </li>
              {section.parent ? (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={section.parent.path} className="link-quiet tap">
                      {section.parent.name}
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden="true">/</li>
              <li>
                <Link href={section.path} className="link-quiet tap">
                  {section.name}
                </Link>
              </li>
            </ol>
          </nav>

          <header className="mt-8 max-w-3xl">
            <h1 className="text-balance text-[clamp(2.5rem,6vw,4.75rem)] leading-[1]">{tidyTitle(p.title)}</h1>
            <p className="kicker mt-6">
              <time dateTime={p.date}>{formatPostDate(p.date)}</time> · {p.minutes} min read ·{" "}
              <span className="whitespace-nowrap">
                by{" "}
                <Link href="/" rel="author" className="link-quiet text-text">
                  {SITE.name}
                </Link>
              </span>
            </p>
          </header>

          <div className="logbook-prose hairline mt-12 max-w-[68ch] pt-10" dangerouslySetInnerHTML={{ __html: p.html }} />

          {after}

          <nav aria-label="More entries" className="hairline mt-20 grid max-w-3xl gap-6 pt-8 text-sm sm:grid-cols-2">
            {older ? (
              <Link href={pathOf(older.slug)} className="link-quiet tap">
                <span className="kicker block">Older</span>
                <span className="mt-1 block text-lg text-text">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link href={pathOf(newer.slug)} className="link-quiet tap sm:text-right">
                <span className="kicker block">Newer</span>
                <span className="mt-1 block text-lg text-text">{newer.title}</span>
              </Link>
            ) : null}
          </nav>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
