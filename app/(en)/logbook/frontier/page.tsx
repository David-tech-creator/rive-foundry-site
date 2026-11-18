import Link from "next/link"
import { PostIndex } from "@/components/site/post-index"
import { SubscribeForm } from "@/components/site/subscribe-form"
import { FRONTIER, FRONTIER_FEED, FRONTIER_HOW, FRONTIER_OG, FRONTIER_OG_ALT, getFrontierPosts } from "@/lib/frontier"
import { pageMetadata } from "@/lib/seo"

const base = pageMetadata({
  title: "Frontier",
  description: FRONTIER.description,
  path: FRONTIER.path,
  image: FRONTIER_OG,
  imageAlt: FRONTIER_OG_ALT,
})

export const metadata = {
  ...base,
  alternates: { ...base.alternates, types: { "application/rss+xml": FRONTIER_FEED } },
}

export default function FrontierPage() {
  return (
    <PostIndex
      formation="ridge"
      section={FRONTIER}
      posts={getFrontierPosts()}
      intro={
        <>
          What changed at the labs, and what I would do with it.
          <span className="fm-phone-hide">
            {" "}
            An agent I built reads the release notes, the blogs and the people behind the models every morning, then writes
            it up in my voice.
          </span>
        </>
      }
      lead={
        <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-lg">
          <Link href={FRONTIER_HOW} className="link-line text-text">
            How this works
          </Link>
          <Link href={FRONTIER_FEED} className="link-line text-text">
            RSS
          </Link>
        </p>
      }
      below={<SubscribeForm />}
    />
  )
}
