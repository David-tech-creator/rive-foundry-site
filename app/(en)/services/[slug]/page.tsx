import { notFound } from "next/navigation"
import { ServiceView } from "@/components/site/service-view"
import { pageMetadata } from "@/lib/seo"
import { SERVICES } from "@/lib/services"

export const dynamicParams = false

const bySlug = (slug: string) => SERVICES.find((s) => s.path.en === `/services/${slug}`)

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.path.en.split("/").pop()! }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = bySlug((await params).slug)
  if (!s) return {}
  return pageMetadata({
    title: s.copy.en.title,
    description: s.copy.en.description,
    path: s.path.en,
    languages: s.path,
    keywords: [s.copy.en.short, s.serviceType, "Geneva", "Switzerland", "David Vinkenroye"],
  })
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = bySlug((await params).slug)
  if (!s) notFound()
  return <ServiceView service={s} lang="en" />
}
