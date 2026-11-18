import { notFound } from "next/navigation"
import { PostArticle } from "@/components/site/post-article"
import { SubscribeForm } from "@/components/site/subscribe-form"
import { FRONTIER, FRONTIER_OG, FRONTIER_OG_ALT, frontierPostPath, getFrontierPost, getFrontierPosts } from "@/lib/frontier"
import { pageMetadata, sentenceTrim } from "@/lib/seo"
import { SITE } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return getFrontierPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getFrontierPost(slug)
  if (!p) return {}
  return pageMetadata({
    // long titles would be cut in search results with the site suffix: drop it
    ...(p.title.length > 50 ? { absoluteTitle: p.title } : { title: p.title }),
    description: sentenceTrim(p.summary || `${p.title}, a Frontier post by ${SITE.name}.`),
    path: frontierPostPath(p.slug),
    image: FRONTIER_OG,
    imageAlt: FRONTIER_OG_ALT,
    type: "article",
    keywords: [SITE.name, p.title],
  })
}

export default async function FrontierPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getFrontierPost(slug)
  if (!p) notFound()
  return <PostArticle section={FRONTIER} post={p} posts={getFrontierPosts()} after={<SubscribeForm />} />
}
