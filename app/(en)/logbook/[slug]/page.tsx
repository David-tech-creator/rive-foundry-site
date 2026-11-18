import { notFound } from "next/navigation"
import { PostArticle } from "@/components/site/post-article"
import { LOGBOOK, getPost, getPosts, postPath } from "@/lib/logbook"
import { pageMetadata } from "@/lib/seo"
import { SITE } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getPost(slug)
  if (!p) return {}
  return pageMetadata({
    title: p.title,
    description: p.summary || `${p.title}, a Logbook entry by ${SITE.name}.`,
    path: postPath(p.slug),
    type: "article",
    keywords: [SITE.name, p.title],
  })
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getPost(slug)
  if (!p) notFound()
  return <PostArticle section={LOGBOOK} post={p} posts={getPosts()} />
}
