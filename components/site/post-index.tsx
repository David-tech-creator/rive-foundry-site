import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"
import { StructuredData } from "@/components/structured-data"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { formatPostDate, tidyTitle, type LogbookPost, type PostSection } from "@/lib/logbook"
import { postSectionJsonLd } from "@/lib/seo"

export function PostIndex({ section, posts, intro, lead, below, children, formation }: { section: PostSection; posts: LogbookPost[]; intro: ReactNode; lead?: ReactNode; below?: ReactNode; children?: ReactNode; formation?: "ridge" }) {
  const head = (
    <>
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
          <li aria-current="page">{section.name}</li>
        </ol>
      </nav>

      <h1 className="mt-8 text-[clamp(3rem,8vw,6.5rem)] leading-[0.95]">{section.name}</h1>
      <p className="mt-6 max-w-2xl text-xl leading-snug text-text md:text-2xl">{intro}</p>
      {lead}
      {below ? <div className={formation ? "hidden md:block" : undefined}>{below}</div> : null}
    </>
  )
  return (
    <>
      <StructuredData data={postSectionJsonLd(section, posts)} />
      <SiteHeader />
      <main id="main" className={formation ? "pb-24" : "pb-24 pt-36 md:pt-44"}>
        {formation ? (
          <section
            data-formation={formation}
            className="fm"
            style={{ ["--ready" as string]: `var(--${formation}-ready, 1)`, ["--fm-h" as string]: "112vh" } as CSSProperties}
          >
            <div className="fm-stage">
              <div className="wrap grid items-center gap-12 md:grid-cols-12">
                <div className="fm-copy md:col-span-7 lg:col-span-6">{head}</div>
              </div>
            </div>
          </section>
        ) : null}
        <div className="wrap">
          {/* on phones the hero keeps the screen for the shape, so this sits under it */}
          {formation ? below ? <div className="mb-14 md:hidden">{below}</div> : null : head}

          {posts.length ? (
            <ol className="hairline mt-16 divide-y divide-line md:mt-24">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link href={`${section.path}/${p.slug}`} className="group grid gap-2 py-8 md:grid-cols-12 md:gap-10">
                    <time dateTime={p.date} className="kicker pt-1.5 md:col-span-3">
                      {formatPostDate(p.date)}
                    </time>
                    <span className="md:col-span-8">
                      <span className="block text-balance text-2xl text-text transition-colors group-hover:text-azure-light md:text-3xl">
                        {tidyTitle(p.title)}
                      </span>
                      {p.summary ? (
                        <span className="mt-2 block text-lg leading-relaxed text-muted-foreground">{p.summary}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : children ? null : (
            <p className="hairline mt-16 max-w-2xl pt-8 text-lg leading-relaxed text-muted-foreground md:mt-24">
              Nothing here yet. The first entry is on its way.
            </p>
          )}

          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
