import Link from "next/link"
import { GITHUB_URL, LINKEDIN_URL, SITE } from "@/lib/site"
import { HelmetMark } from "./helmet-mark"

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative">
      <div className="wrap">
        <div className="hairline grid gap-10 py-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="flex items-center gap-2.5 text-base text-text">
              <HelmetMark className="h-4 w-4 text-azure" />
              {SITE.name}
            </p>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              I build AI products in {SITE.city}, {SITE.countryName}, mostly for fun.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm md:col-span-7 md:grid-cols-3">
            <ul className="footer-links space-y-3">
              <li>
                <Link href="/work" className="link-quiet tap">
                  Work
                </Link>
              </li>
              <li>
                <Link href="/rive-foundry" className="link-quiet tap">
                  Rive Foundry
                </Link>
              </li>
              <li>
                <Link href="/services" className="link-quiet tap">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/logbook" className="link-quiet tap">
                  Logbook
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="link-quiet tap">
                  Contact
                </Link>
              </li>
            </ul>
            <ul className="footer-links space-y-3">
              <li>
                <a href={LINKEDIN_URL} rel="me noopener" target="_blank" className="link-quiet tap">
                  LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href={GITHUB_URL} rel="me noopener" target="_blank" className="link-quiet tap">
                  GitHub
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href="/llms.txt" className="link-quiet tap">
                  llms.txt
                </a>
              </li>
            </ul>
            <ul className="footer-links space-y-3">
              <li>
                <Link href="/privacy" className="link-quiet tap">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="link-quiet tap">
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.5rem))] text-xs text-muted-foreground">
          © {year} {SITE.name}
        </p>
      </div>
    </footer>
  )
}
