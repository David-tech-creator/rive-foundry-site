import Link from "next/link"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { HelmetMark } from "@/components/site/helmet-mark"

/** The 404 page body, used by app/global-not-found.tsx and app/(en)/not-found.tsx. */
export function NotFoundBody() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex min-h-[80vh] items-center pb-24 pt-36">
        <div className="wrap">
          <HelmetMark className="h-6 w-6 text-azure" />
          <p className="kicker mt-8">Error 404. Signal lost</p>
          <h1 className="mt-6 max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98]">This page drifted out of orbit.</h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Either the link is old or I moved something and forgot to tell anyone. Home and my work are definitely
            still here.
          </p>
          <ul className="mt-10 flex flex-wrap gap-4">
            <li>
              <Link href="/" className="btn-solid">
                Home
              </Link>
            </li>
            <li>
              <Link href="/work" className="btn">
                Work
              </Link>
            </li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
