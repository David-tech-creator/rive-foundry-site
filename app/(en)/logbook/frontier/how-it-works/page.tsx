import Link from "next/link"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { FRONTIER, FRONTIER_FEED, FRONTIER_HOW, FRONTIER_OG, FRONTIER_OG_ALT } from "@/lib/frontier"
import { LOGBOOK } from "@/lib/logbook"
import { pageMetadata } from "@/lib/seo"
import { CONTACT_EMAIL } from "@/lib/site"

export const metadata = pageMetadata({
  title: "How Frontier works",
  description: "How an agent on a NAS in my house reads the AI labs every morning and publishes in my voice, from the sources to the fact-check.",
  path: FRONTIER_HOW,
  image: FRONTIER_OG,
  imageAlt: FRONTIER_OG_ALT,
})

const STEPS = [
  {
    title: "It reads",
    text: "Every morning at 07:30 a small program on the NAS at my house goes through 47 sources. Release notes and blogs from Anthropic, OpenAI, Google, Meta, xAI, Mistral, DeepSeek, Alibaba's Qwen, Moonshot, Z.ai, MiniMax, ByteDance, Microsoft, NVIDIA and AWS, the tools I use like Cursor, Cline, VS Code and GitHub, plus people I like reading: Simon Willison, Latent Space, The Pragmatic Engineer, One Useful Thing, Import AI, Interconnects, ChinaTalk, TLDR AI, Superhuman and Hacker News. No AI in this step, just fetching.",
  },
  {
    title: "It checks LinkedIn",
    text: "Engineers and founders at the labs often post the interesting bit there first. So the browser on my NAS, logged in as me, reads my feed once, which covers everyone I follow, and keeps what the people at the labs posted: Boris Cherny, Addy Osmani, Rahul Patil, Jared Kaplan, Greg Brockman, Sherwin Wu, Demis Hassabis, Arthur Mensch, Andrew Ng and more. It can only read. It cannot like, comment, follow or message anyone.",
  },
  {
    title: "It decides",
    text: "Claude looks at what is new and asks one question: does this change how someone works? Routine patch notes do not count. On a quiet day it says so and nothing gets published, which I like more than filler. A newsletter or a LinkedIn post can point at a story, but only an official source can carry it.",
  },
  {
    title: "It writes",
    text: "A researcher lists the facts, a devil's advocate pokes holes in the angle, and a writer drafts the post from my voice samples. It uses the source's own image with a credit and a link, or draws a diagram when there is none.",
  },
  {
    title: "It gets checked",
    text: "A separate fact-checker, which did not write the post, compares every claim with the sources. Then plain code has the last word: it refuses any link the agent never actually read, and anything that sounds like a press release. If a post fails, it dies there.",
  },
  {
    title: "It goes live",
    text: "The post lands in the repo for this site, Vercel builds it, and my phone buzzes on Telegram once the page is up. So yes: I read these when you do.",
  },
]

export default function HowItWorksPage() {
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
              <li>
                <Link href={LOGBOOK.path} className="link-quiet tap">
                  {LOGBOOK.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={FRONTIER.path} className="link-quiet tap">
                  {FRONTIER.name}
                </Link>
              </li>
            </ol>
          </nav>

          <h1 className="mt-8 text-[clamp(2.5rem,6vw,4.75rem)] leading-[1]">How this works</h1>
          <p className="mt-6 max-w-2xl text-xl leading-snug text-text md:text-2xl">
            Nobody writes these posts by hand, me included. Here is the whole machine, from the first fetch to the buzz on my phone.
          </p>

          <ol className="hairline mt-16 grid gap-10 pt-10 md:mt-20 md:grid-cols-2 md:gap-x-16">
            {STEPS.map((s, i) => (
              <li key={s.title} className="max-w-[60ch]">
                <p className="kicker">Step {i + 1}</p>
                <h2 className="mt-2 text-xl text-text md:text-2xl">{s.title}</h2>
                <p className="mt-2 text-lg leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>

          <section aria-labelledby="backend" className="hairline mt-16 pt-10">
            <h2 id="backend" className="text-3xl md:text-4xl">
              Under the hood
            </h2>
            <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-muted-foreground">
              It is a Node container built on the Claude Agent SDK. The models get no tools at all: they read text and write
              text, so a sneaky web page has nothing to grab. The agent has no access to my mail, my messages or my notes. If it
              gets something wrong, that is on me, so{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-quiet text-text">
                tell me
              </a>
              .
            </p>
            <p className="mt-6 text-lg">
              <Link href={FRONTIER_FEED} className="link-line text-text">
                Follow it with RSS
              </Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
