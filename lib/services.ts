/**
 * What David can do for people, one page per offer, in English and French.
 *
 * Each offer gets its own URL so it can rank for the searches people actually
 * make ("AI agents Geneva", "IA souveraine Suisse", "MCP server developer").
 * Proof is always his own work under /work. Rules: no client names, no
 * metrics, no prices, no testimonials. The French copy should be read by David.
 */

import type { ProductSlug } from "@/lib/graph"

export type Lang = "en"

export type ServiceCopy = {
  /** <title> without the site suffix, and the H1 */
  title: string
  h1: string
  /** meta description, under 155 characters */
  description: string
  /** short name for lists and nav */
  short: string
  lead: string
  /** what it looks like in practice */
  examples: string[]
  steps: Array<{ title: string; body: string }>
  /** why it is safe, where it runs, languages */
  notes: string[]
  proof: Array<{ slug: ProductSlug; line: string }>
  faq: Array<{ q: string; a: string }>
}

export type Service = {
  id: string
  /** schema.org serviceType */
  serviceType: string
  path: Record<Lang, string>
  copy: Record<Lang, ServiceCopy>
}

export const SERVICES_PATH: Record<Lang, string> = { en: "/services" }

const LANGS_EN = "I work in French, English, German and Dutch."

export const SERVICES: Service[] = [
  {
    id: "ai-automation",
    serviceType: "AI workflow automation",
    path: { en: "/services/ai-automation" },
    copy: {
      en: {
        title: "AI agents and workflow automation in Geneva",
        h1: "AI agents that take work off your plate",
        description:
          "I build AI agents and automations for companies in Geneva and Switzerland: email, quotes, CRM updates, reports and follow-ups, with a human in the loop.",
        short: "AI agents and automation",
        lead:
          "Most teams have a few tasks that eat hours every week: sorting email, preparing quotes, copying data from one tool to another, writing the same report again. I build AI agents that do this work for you, and they ask before they send, pay or delete anything.",
        examples: [
          "Read incoming email, sort it and draft the replies for you to check",
          "Prepare quotes and documents from a short brief",
          "Keep the CRM up to date after calls and meetings",
          "Write weekly reports or newsletters from your own sources",
          "Follow up on open tasks and remind the right person",
          "Make phone calls or fill in web forms for routine errands",
        ],
        steps: [
          { title: "Pick one workflow", body: "We look at one task together and decide what a good result looks like." },
          { title: "Build a pilot", body: "I build a small version that runs on your real tools and data, so you can see it work before you commit to more." },
          { title: "Run it for real", body: "If the pilot does the job, we put it into daily use, with logs you can read and a clear way to switch it off." },
        ],
        notes: [
          "The agent asks before it sends, pays, deletes or invites anything. You see what it changed and why.",
          "I use whichever models and tools fit best: Claude, OpenAI, Gemini, open models and plenty of plain code.",
          "If your data has to stay in Switzerland, the agent can run on Swiss servers or on your own.",
          LANGS_EN,
        ],
        proof: [
          { slug: "neonduck", line: "My personal AI assistant. It does things online for me, can make phone calls, and asks before it acts." },
          { slug: "romandy-cto", line: "A weekly newsletter drafted automatically from RSS feeds, plus event reminders that send themselves." },
        ],
        faq: [
          { q: "Which tasks are a good fit?", a: "Tasks that repeat, follow rules you could explain to a new colleague, and live in tools with an API or a web interface: email, documents, CRM, spreadsheets, forms. Tasks that need a judgement call every time stay with people, and the agent prepares them." },
          { q: "Do I have to change my tools?", a: "Usually not. The agent works with the tools you already use. If a tool has no way in, I tell you at the start rather than after the build." },
          { q: "What happens to my data?", a: "It goes only to the services you agree to. Where that matters, everything runs in Switzerland or on your own server, with no data used for training." },
        ],
      },
    },
  },
  {
    id: "ai-apps",
    serviceType: "AI product and app development",
    path: { en: "/services/ai-app-development" },
    copy: {
      en: {
        title: "AI products and iPhone apps, from idea to launch",
        h1: "From idea to launch: AI products, web apps and iPhone apps",
        description:
          "I design and build AI products in Geneva, from the first idea to launch: web apps in Next.js and native iPhone and iPad apps in Swift.",
        short: "Products from idea to launch",
        lead:
          "If you have an idea for a product, I can take it from a rough sketch to something people use. I design it, build it and ship it myself, so the person you talk to is the person who writes the code.",
        examples: [
          "A first version (MVP) you can put in front of real users",
          "Native iPhone and iPad apps in Swift and SwiftUI",
          "Web apps and internal tools in Next.js and TypeScript",
          "An AI feature added to a product you already have",
          "Websites that search engines and AI tools can read",
        ],
        steps: [
          { title: "Sharpen the idea", body: "We agree on the problem, who it is for and the smallest version worth building." },
          { title: "Build in short rounds", body: "You see a working version early and often, and we change course while it is still cheap." },
          { title: "Launch and hand over", body: "I ship it, set up hosting and monitoring, and leave you with the code and documentation." },
        ],
        notes: [
          "Swift and SwiftUI for iOS, Next.js and TypeScript for the web, Python and Node.js on the server.",
          "Hosting in Switzerland or the EU by default, or wherever you need it.",
          LANGS_EN,
        ],
        proof: [
          { slug: "lodestar", line: "An iPhone and iPad app that sets up a Sony camera from one sentence and takes the shot." },
          { slug: "retouch-studio", line: "A web app that retouches a whole photo shoot at once." },
          { slug: "haystack-os", line: "The ATS and CRM my recruitment agency runs on, with Claude reading CVs and drafting the paperwork." },
          { slug: "babytalk", line: "An iOS app that tells bedtime stories in a parent's voice." },
        ],
        faq: [
          { q: "Do you build the whole thing yourself?", a: "Yes, from design to launch, so the person you talk to is the person who writes the code." },
          { q: "Can you add AI to an app I already have?", a: "Yes. I often start with one feature that saves users time and build from there." },
        ],
      },
    },
  },
  {
    id: "mcp-servers",
    serviceType: "MCP server development",
    path: { en: "/services/mcp-servers" },
    copy: {
      en: {
        title: "MCP server development: connect AI to your tools and data",
        h1: "MCP servers: connect AI to your own tools and data",
        description:
          "I build MCP servers that let Claude, ChatGPT and other AI assistants work with your own tools and data, safely, from Geneva, Switzerland.",
        short: "MCP servers and integrations",
        lead:
          "An AI assistant is only as useful as what it can reach. The Model Context Protocol (MCP) is the standard way to connect assistants like Claude and ChatGPT to your own systems. I build MCP servers that give them exactly the access they need, and nothing more.",
        examples: [
          "Let your team ask questions of your own documents, CRM or database",
          "Connect an assistant to an internal tool that has an API",
          "Give an agent read-only access to records it should never change",
          "Search your archive word for word, so answers quote the original",
          "Control hardware, like a camera, from a chat",
        ],
        steps: [
          { title: "Map the access", body: "We list what the assistant should be able to read and do, and what it must never touch." },
          { title: "Build small", body: "Each server gets a few clear tools. Read-only where that matters, with an approval step for anything that changes data." },
          { title: "Test on real questions", body: "I test it against the questions your team actually asks, and check the answers come from your records." },
        ],
        notes: [
          "Works with Claude, ChatGPT and other assistants and agents that support MCP.",
          "Servers can run in Switzerland, on your own hardware or behind a signed-in tunnel.",
          LANGS_EN,
        ],
        proof: [
          { slug: "dbrain", line: "My self-hosted memory: records stored word for word and served to AI assistants over MCP." },
          { slug: "lightbox", line: "An MCP server that lets an assistant browse my photo library." },
          { slug: "lodestar", line: "It started as an MCP server with eight tools that drove a Sony camera over USB." },
          { slug: "haystack-os", line: "A recruiting tool with a 51-tool MCP server that reads and writes, behind scoped tokens." },
        ],
        faq: [
          { q: "What is MCP?", a: "The Model Context Protocol is an open standard for connecting AI assistants to tools and data. One server can be used by any assistant that supports it." },
          { q: "Is it safe to connect AI to company data?", a: "It is when the access is narrow. I give each server only the tools it needs, keep it read-only where possible, and put an approval step in front of anything that changes data." },
          { q: "Which assistants does it work with?", a: "Claude, ChatGPT and a growing list of agents and IDEs support MCP. I build to the standard, so you are not tied to one vendor." },
        ],
      },
    },
  },
  {
    id: "private-ai",
    serviceType: "Private, self-hosted AI",
    path: { en: "/services/private-ai-switzerland" },
    copy: {
      en: {
        title: "Private AI hosted in Switzerland or on your own servers",
        h1: "Private AI, hosted in Switzerland or on your own servers",
        description:
          "Private, self-hosted AI for Swiss companies: assistants and agents that run in Switzerland or on your own hardware, with your data kept apart.",
        short: "Private AI in Switzerland",
        lead:
          "Some data should not travel. If you work with client files, health data or anything confidential, I set up AI that runs in Switzerland or on your own servers, so you decide where your data lives and who can reach it.",
        examples: [
          "An internal assistant that answers from your own documents",
          "AI that runs on a Swiss cloud server, or on a machine in your office",
          "Open models for the tasks where they are good enough",
          "A separate, isolated server per client or per team",
          "Backups you have actually tested restoring",
        ],
        steps: [
          { title: "Decide what stays where", body: "We sort your data into what may use a cloud model, what must stay in Switzerland and what must never leave your servers." },
          { title: "Set it up", body: "I install the stack, the models and the connections, behind proper sign-in." },
          { title: "Keep it running", body: "Nightly backups, a restore test you can see, and updates you know about." },
        ],
        notes: [
          "Personal and business data can be kept apart in the same system.",
          "It is built to help you meet the Swiss data protection act (nLPD). The legal assessment stays with you or your lawyer.",
          LANGS_EN,
        ],
        proof: [
          { slug: "dbrain", line: "My own data runs on a server at home, with nightly backups and a weekly restore test." },
          { slug: "neonduck", line: "For customers in Switzerland, every person gets their own isolated server. Delete the account and the server goes too." },
          { slug: "lightbox", line: "AI photo sorting for a self-hosted photo library, inside the same home stack." },
        ],
        faq: [
          { q: "Is a local model as good as ChatGPT?", a: "For many tasks, like sorting, searching and drafting, open models are good enough. For the hardest tasks a cloud model can still be better, and we decide case by case which data may go there." },
          { q: "Where exactly does it run?", a: "On a Swiss cloud server or on your own hardware, whichever you prefer. You know the location and you hold the keys." },
          { q: "Does this make me nLPD compliant?", a: "It helps, because you control where data goes. Compliance also depends on your processes, so the legal check stays with you." },
        ],
      },
    },
  },
  {
    id: "ai-advice",
    serviceType: "AI advice and workshops",
    path: { en: "/services/ai-advice" },
    copy: {
      en: {
        title: "AI advice for teams and founders in Geneva",
        h1: "AI advice for teams and founders",
        description:
          "Practical AI advice in Geneva: what to automate first, which tools to use and how to keep your data safe. In French, English, German or Dutch.",
        short: "AI advice",
        lead:
          "I am always happy to share advice. If you are wondering where AI could help your team, which tools are worth it, or whether an idea holds up, I can help you think it through, based on what I have built and what I have seen work.",
        examples: [
          "Find the two or three tasks in your company worth automating first",
          "Choose between tools and models without the hype",
          "Review a product idea or a plan before you spend money on it",
          "A hands-on workshop with your team, using your own examples",
          "Set simple rules for using AI safely with company data",
        ],
        steps: [
          { title: "Tell me where you are", body: "A few lines about your team, your tools and what you want to change." },
          { title: "Talk it through", body: "We go through it together, in person in Geneva or on a call." },
          { title: "Leave with next steps", body: "What to try first, what to skip and what to watch out for." },
        ],
        notes: ["In person in Geneva, or on a call from anywhere.", LANGS_EN],
        proof: [
          { slug: "romandy-cto", line: "I built the platform for a peer network of senior tech leaders in French-speaking Switzerland." },
          { slug: "neonduck", line: "Most of what I advise, I have built and run myself first." },
        ],
        faq: [
          { q: "Do I need to be technical?", a: "No. I explain things in plain words, and we start from your work, not from the technology." },
          { q: "Can you train my team?", a: "Yes, with a practical workshop built around your own tasks and tools." },
        ],
      },
    },
  },
]

/** Things David points people to rather than doing on this site. */
export const ELSEWHERE: Record<Lang, Array<{ title: string; body: string; href: string; label: string }>> = {
  en: [
    { title: "Hiring senior tech people", body: "Looking for an engineer or a tech leader, or for your next role? That is Haystack, the tech recruitment agency.", href: "/work/haystack", label: "Haystack" },
    { title: "Meeting other tech leaders", body: "Romandy CTO is a peer network of senior tech leaders in French-speaking Switzerland. Write to me if you want to organise an event with us or speak at one.", href: "/work/romandy-cto", label: "Romandy CTO" },
  ],
}

export const HUB_COPY: Record<Lang, { title: string; h1: string; description: string; lead: string; kicker: string }> = {
  en: {
    title: "AI services in Geneva: agents, apps, MCP, private AI",
    h1: "How I can help",
    description:
      "What David Vinkenroye can do for you in Geneva and Switzerland: AI agents and automation, apps from idea to launch, MCP servers, private AI and advice.",
    kicker: "Services",
    lead:
      "Everything here is something I have already built for myself first. If one of these sounds like your problem, write to me. A few lines are enough.",
  },
}

export const UI: Record<Lang, Record<string, string>> = {
  en: {
    home: "Home",
    services: "Services",
    examples: "What it looks like",
    how: "How it works",
    good: "Good to know",
    proof: "Things I have built",
    faq: "Questions",
    contact: "Tell me what you are working on",
    contactLead: "A few lines are enough. I reply by email.",
    elsewhere: "Also",
    other: "Other ways I can help",
    more: "Read more",
  },
}

export const getService = (id: string) => SERVICES.find((s) => s.id === id)

/** The same page in the other language. */

