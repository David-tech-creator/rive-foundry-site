import Link from "next/link"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"

/**
 * Shared shell for the legal pages so Privacy and Terms stay consistent with
 * each other and with the rest of the site.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  /** ISO date; rendered as both a machine-readable and a human-readable stamp. */
  updated: string
  children: React.ReactNode
}) {
  const updatedLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(updated))

  return (
    <>
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
              <li aria-current="page">{title}</li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h1 className="text-[clamp(2.5rem,5vw,4rem)] leading-[0.98] lg:sticky lg:top-32">{title}</h1>
            </div>

            <div className="lg:col-span-8">
              <p className="kicker hairline mb-12 pt-4">
                Last updated <time dateTime={updated}>{updatedLabel}</time>
              </p>
              <div
                className="max-w-[64ch] space-y-12 text-lg leading-relaxed text-muted-foreground
                  [&>p]:mb-6
                  [&_section]:space-y-5
                  [&_h2]:mb-5 [&_h2]:border-t [&_h2]:border-line [&_h2]:pt-5 [&_h2]:text-2xl [&_h2]:text-text
                  [&_a]:text-text [&_a]:underline [&_a]:decoration-line [&_a]:underline-offset-4 hover:[&_a]:decoration-azure-light
                  [&_strong]:font-normal [&_strong]:text-text
                  [&_ul]:my-6 [&_ul]:space-y-4
                  [&_li]:relative [&_li]:pl-6
                  [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.75em] [&_li]:before:h-1 [&_li]:before:w-1 [&_li]:before:rounded-full [&_li]:before:bg-azure-light [&_li]:before:content-['']"
              >
                {children}
              </div>
              <p className="hairline mt-16 pt-6 text-muted-foreground">
                Questions about this page? Use the{" "}
                <Link href="/#contact" className="link-line text-text">
                  contact form
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
