/** @type {import('next').NextConfig} */
const nextConfig = {
  // A stray package-lock.json in the home directory makes Next infer the wrong
  // workspace root; pin it to this project.
  outputFileTracingRoot: import.meta.dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Type errors fail the build.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  // two root layouts (app/(en) and app/(fr)), so unmatched URLs need app/global-not-found.tsx
  experimental: { globalNotFound: true },
  poweredByHeader: false,
  compress: true,
  // The site is now David Vinkenroye's personal site. The agency's old event
  // and membership routes fold into the agency section with permanent (308)
  // redirects, which search engines treat like 301s and use to pass signals.
  async redirects() {
    return [
      { source: "/events", destination: "/rive-foundry", permanent: true },
      { source: "/events/:slug*", destination: "/rive-foundry", permanent: true },
      { source: "/join", destination: "/rive-foundry", permanent: true },
      { source: "/join/:path*", destination: "/rive-foundry", permanent: true },
      // There are no accounts; the old login page goes home.
      { source: "/login", destination: "/", permanent: true },
      // The about page repeated the home page.
      { source: "/about", destination: "/", permanent: true },
      // Frontier moved into the Logbook.
      { source: "/frontier", destination: "/logbook/frontier", permanent: true },
      { source: "/frontier/:path*", destination: "/logbook/frontier/:path*", permanent: true },
      // One Rive Foundry page: the workshop page.
      { source: "/work/rive-foundry", destination: "/rive-foundry", permanent: true },
      // Sony Camera MCP was Lodestar's first prototype; Daffy is Neonduck; Bicraw and SibionAI are no longer listed.
      { source: "/work/sony-camera-mcp", destination: "/work/lodestar", permanent: true },
      { source: "/work/daffy", destination: "/work/neonduck", permanent: true },
      { source: "/work/bicraw", destination: "/work", permanent: true },
      { source: "/work/sibion-ai", destination: "/work", permanent: true },
      // Emineon OS was rebuilt as Haystack OS.
      { source: "/work/emineon-os", destination: "/work/haystack-os", permanent: true },
      // The 77 concept became Emineon.
      { source: "/work/seventy-seven", destination: "/work/emineon", permanent: true },
    ]
  },
  async headers() {
    return [
      {
        // Files in /public keep their filename when their contents change, so
        // they must never be immutable — that would pin a replaced image in
        // every returning visitor's browser for a year, with no way to release
        // it short of changing the URL. (That happened once already, which is
        // why the brand images carry a -v2 suffix: bump the suffix whenever you
        // replace an image's contents.) Serve from cache but revalidate, and
        // let the CDN hold it until the next deploy.
        source: "/:path*.(jpg|jpeg|png|webp|avif|svg|ico|mp4|bin)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ]
  },
}

export default nextConfig
