import type React from "react"
import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ParticleStage } from "@/components/particles/ParticleStage"
import { Cursor, SmoothScroll } from "@/components/motion"
import { KEYWORDS, SITE, SITE_URL } from "@/lib/site"

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-sans",
})

const DEFAULT_TITLE = `${SITE.name}: ${SITE.headline}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set only their own name; the person's name is appended here.
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  manifest: "/manifest.json",
  // Canonicals are set per page by pageMetadata(); a layout default would be
  // inherited by pages that forget theirs and point them all at "/".
  category: "technology",
  formatDetection: { telephone: false, address: false, email: false },
  // No static images here: app/opengraph-image.tsx and the per-work routes
  // generate them, and Next wires them into og:image automatically.
  openGraph: {
    title: DEFAULT_TITLE,
    description: SITE.description,
    url: SITE_URL,
    siteName: SITE.siteName,
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Icons come from the file conventions: app/icon.svg, icon.png, apple-icon.png, favicon.ico.
  // Add when David has them (Google Search Console, Bing Webmaster Tools):
  // verification: { google: "...", other: { "msvalidate.01": "..." } },
}

export const viewport: Viewport = {
  themeColor: SITE.colors.background,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // edge to edge on notched phones; .wrap, the header and the footer pad
  // themselves with env(safe-area-inset-*)
  viewportFit: "cover",
}

/**
 * Sets data-particles="on" before first paint when the field will run, so the
 * sticky formation layout is in place from the start instead of shifting after
 * hydration (CLS). ParticleStage still switches it to "off" on any failure.
 * It only checks that WebGL2 exists: creating a test context here blocked the
 * main thread before first paint (most of a second on a slow phone), and the
 * engine creates the real one later anyway.
 */
const PARTICLES_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'WebGL2RenderingContext' in window){document.documentElement.setAttribute('data-particles','on')}}catch(e){}`

/**
 * The html shell shared by the two root layouts: app/(en)/layout.tsx and
 * app/(fr)/layout.tsx. Two root layouts, so the French pages are served with
 * lang="fr" in the HTML itself rather than switched by a script.
 */
export function RootShell({ lang, children }: { lang: "en" | "fr"; children: React.ReactNode }) {
  return (
    <html lang={lang} className={interTight.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PARTICLES_BOOT }} />
      </head>
      <body className="font-sans">
        <a href="#main" className="skip-link">
          {lang === "fr" ? "Aller au contenu" : "Skip to content"}
        </a>
        {/* One fixed particle field behind every page (decoration, aria-hidden). */}
        <ParticleStage />
        <SmoothScroll />
        <Cursor />
        {children}
        {/* Cookieless and anonymised: no consent banner needed, which is why the
            privacy policy can say there are no tracking cookies. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
