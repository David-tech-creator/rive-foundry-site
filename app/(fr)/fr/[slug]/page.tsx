import { notFound } from "next/navigation"
import { ServiceView } from "@/components/site/service-view"
import { pageMetadata } from "@/lib/seo"
import { SERVICES } from "@/lib/services"

export const dynamicParams = false

const bySlug = (slug: string) => SERVICES.find((s) => s.path.fr === `/fr/${slug}`)

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.path.fr.split("/").pop()! }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = bySlug((await params).slug)
  if (!s) return {}
  return pageMetadata({
    title: s.copy.fr.title,
    description: s.copy.fr.description,
    path: s.path.fr,
    lang: "fr",
    languages: s.path,
    keywords: [s.copy.fr.short, "Genève", "Suisse romande", "David Vinkenroye"],
  })
}

export default async function FrenchServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = bySlug((await params).slug)
  if (!s) notFound()
  return <ServiceView service={s} lang="fr" />
}
