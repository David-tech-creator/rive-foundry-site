/**
 * The knowledge graph of David Vinkenroye's work: the single source of truth.
 *
 * Everything reads from here: the particle graph on the homepage, the
 * /work/[slug] pages, the JSON-LD @graph, llms.txt and the sitemap. If a fact
 * is not in this file it is not on the site, which is what keeps the visual,
 * the copy and what search/answer engines see from ever contradicting each other.
 *
 * Publishing rules (agreed with David, 2026-10-25):
 * - Only his own products. No employers, no clients, no career history.
 * - No family details, no internal hostnames/URLs for private tools, no
 *   unverified metrics, no pricing or unit economics.
 *
 * Every number in `facts` was checked against the source repo on 2026-10-25
 * (git rev-list --count HEAD, README, test runs recorded in the repo's own reports).
 * Node ids are unique across person, products, themes and tech, so an Edge's
 * `from`/`to` can be resolved with `nodeKind()`.
 */

export type NodeKind = "person" | "product" | "venture" | "community" | "concept" | "tech" | "theme"

export type ProductStatus = "live" | "beta" | "prototype" | "concept" | "private"

export type Product = {
  slug: string
  name: string
  kind: Extract<NodeKind, "product" | "venture" | "community" | "concept">
  status: ProductStatus
  /** ≤ 90 chars, used in tiles, meta descriptions and llms.txt */
  oneLiner: string
  /** ≤ 155 chars meta description */
  description: string
  /** 2 to 4 short paragraphs for the case-study page */
  story: string[]
  /** what he actually built, bullet facts only */
  highlights: string[]
  /** verified hard numbers only, e.g. "4 site languages" */
  facts: string[]
  stack: string[]
  platforms: string[]
  themes: string[] // theme ids
  /** public production URL; omit for private tools */
  url?: string
  /** Button text for url when "Visit <host>" would show a raw hosting address. */
  urlLabel?: string
  /** One short line under the button, e.g. when the link only opens a sign-in page. */
  urlNote?: string
  /** YYYY or YYYY-MM; omitted where a date would say too much */
  started?: string
  /** hero image under /public/work/<slug>/ */
  image: string
  /** Screenshots of the real interface, shown under the story (files in /public/work/<slug>/). */
  screens?: Array<{ src: string; alt: string; caption: string; width: number; height: number }>
  /** One line under the Screens heading, e.g. that the data is made up. */
  screensNote?: string
  imageAlt: string
  /** 0..1, how central in the graph (node size, order) */
  weight: number
  /** schema.org type for JSON-LD */
  schemaType: "SoftwareApplication" | "MobileApplication" | "WebApplication" | "Organization" | "CreativeWork"
  applicationCategory?: string
  operatingSystem?: string
}

export type Theme = { id: string; label: string; summary: string }

export type Edge = { from: string; to: string; label?: string }

export type Person = {
  name: string
  givenName: string
  familyName: string
  headline: string
  /** first-person short intro for the hero, ≤ 200 chars */
  intro: string
  /** one plain line: this is a personal site, made for fun */
  note: string
  /** third-person bio, the paragraph answer engines should quote */
  bio: string
  /** first-person paragraph on why he lives where he lives (/about) */
  home: string
  /** plain outdoor interests, for the Person JSON-LD and llms.txt */
  interests: string[]
  location: { city: string; country: string; countryCode: string }
  languages: string[]
  knowsAbout: string[]
  sameAs: string[]
  portrait: { src: string; cutout: string; mask: string; alt: string }
}

export type Tech = { id: string; label: string }

export type Faq = { q: string; a: string }

/* Slugs below are fixed: other stages depend on them. */
export const PRODUCT_SLUGS = [
  "lodestar",
  "neonduck",
  "lightbox",
  "dbrain",
  "haystack-os",
  "emineon",
  "haystack",
  "romandy-cto",
  "fde-club",
  "rive-foundry",
  "babytalk",
  "retouch-studio",
  "van-roye",
  "miradouro",
  "birth-announcement",
  "family-recipes",
] as const

export type ProductSlug = (typeof PRODUCT_SLUGS)[number]

/* ------------------------------------------------------------------ person */

/** Graph node id of David himself. */
export const PERSON_ID = "david-vinkenroye"

export const PERSON: Person = {
  name: "David Vinkenroye",
  givenName: "David",
  familyName: "Vinkenroye",
  headline: "I build AI products in Geneva",
  note: "This isn't a company website. I made it for fun, and to keep track of what I'm working on.",
  intro:
    "I use whatever tools fit the job: AI agents, automations, MCP servers, a home server that stores my records, websites and iPhone apps. Most start with a problem I had myself, and some become products.",
  bio:
    "I'm David Vinkenroye and I build AI products in Geneva, using many different models and tools. Most of them started as a fix for a problem I had myself. Neonduck is my personal AI assistant: it answers my mail, looks up trains, fills shopping baskets and can even make phone calls, and for customers in Switzerland it runs on a separate server for each person. Lodestar is my iPhone and iPad app that sets up a Sony mirrorless camera from a sentence, takes the shot and checks the result. Dbrain is my self-hosted memory, which lets AI assistants read my own records on hardware I control. I founded Emineon, an AI-native consulting firm in Geneva, and Rive Foundry is the name of my workshop, where all of this gets made. I also built and run romandycto.org, the platform of a peer network of senior tech leaders in French-speaking Switzerland, and FDE Club, a community for forward deployed engineers in Switzerland. I work in Dutch, French, English and German.",
  home:
    "I love living in Switzerland, by the lake. Geneva is small and I like that: the airport is basically at the end of town. The tech scene is vibrant and I keep meeting new people, and there is always someone building something. Skiing, mountaineering and trail running all start close to home. The Côte d'Azur is about five hours away, and Milan and the rest of Italy are close, which is great for weekends.",
  interests: ["Skiing", "Mountaineering", "Trail running"],
  location: { city: "Geneva", country: "Switzerland", countryCode: "CH" },
  languages: ["Dutch", "French", "English", "German"],
  knowsAbout: [
    "Agentic AI",
    "Claude Agent SDK",
    "Model Context Protocol (MCP)",
    "Large language models",
    "Retrieval-augmented generation",
    "Human-in-the-loop AI safety",
    "Self-hosted infrastructure",
    "Data sovereignty",
    "Voice AI",
    "iOS development with SwiftUI",
    "Next.js",
    "TypeScript",
    "Product design",
    "Swiss technology market",
  ],
  sameAs: [
    "https://www.linkedin.com/in/david-vinkenroye-1a479468/",
    "https://github.com/David-tech-creator",
  ],
  portrait: {
    src: "/portrait/david-stipple.png",
    /** on-page still: 960 px, dots baked onto the page colour (#1F1E22) to stay small */
    cutout: "/portrait/david-stipple-960.webp",
    mask: "/portrait/david-mask.png",
    alt: "David Vinkenroye drawn in particles",
  },
}

/* ------------------------------------------------------------------ themes */

export const THEMES: Theme[] = [
  {
    id: "agentic-ai",
    label: "AI agents",
    summary:
      "I build agents that do real work: answer mail, make a phone call, drive a camera, sort a photo library or run a whole build. I use whichever models fit the job: Claude, OpenAI, Gemini, open models and plenty of plain code.",
  },
  {
    id: "mcp-tool-use",
    label: "MCP and tool use",
    summary:
      "I use the Model Context Protocol to connect AI assistants to real things: a camera, a photo library, my own archive and Haystack OS, my recruiting tool. I keep most servers small and read-only where that matters, and where an assistant can write, its token is scoped to what it needs.",
  },
  {
    id: "self-hosting",
    label: "Self-hosting and data sovereignty",
    summary:
      "My own data stays on a NAS at home, behind a tunnel. Each Neonduck customer gets their own isolated server, and if they delete the account, the server is deleted too.",
  },
  {
    id: "human-in-the-loop",
    label: "Ask before acting",
    summary:
      "For actions like sending, paying, deleting or taking a photo, my apps wait for a tap from the user. When the AI changes something, you see the change and the reason for it, and where I can, there's an Undo button.",
  },
  {
    id: "grounding",
    label: "Retrieval and grounding",
    summary:
      "I want models to answer from the original records, so they read them when the question is asked. I measure recall against real questions. In Lodestar, a camera setting only counts once the camera reads it back.",
  },
  {
    id: "swiss-multilingual",
    label: "Built for Switzerland",
    summary:
      "Switzerland has four official languages, so my sites come in up to four of them. Some products connect to Swiss shops and trains, and hosting is in Switzerland or the EU by default.",
  },
  {
    id: "photography",
    label: "Cameras and photos",
    summary:
      "I take far more photos than I ever sort, so I built some tools for it. Lodestar sets up the camera before I shoot. Lightbox helps me choose which photos to keep, and Retouch Studio edits a whole shoot at once.",
  },
  {
    id: "tech-talent",
    label: "Tech people",
    summary:
      "A lot of my work is about people in tech. Haystack is my tech recruitment agency, and Haystack OS is the ATS and CRM I built to run it.",
  },
  {
    id: "family",
    label: "For the family",
    summary:
      "Some of what I build is for home. Babytalk tells bedtime stories in a parent's voice, and I built a birth announcement site to share the news in one place. I also built an interactive family recipe website so we can cook from our own recipes.",
  },
  {
    id: "communities",
    label: "Communities",
    summary:
      "I build and run two communities: Romandy CTO for senior tech leaders in French-speaking Switzerland, and FDE Club for forward deployed engineers in Switzerland.",
  },
  {
    id: "workshop",
    label: "Workshop and company",
    summary:
      "Rive Foundry is the workshop where I build everything on this site, and Emineon is the AI consulting firm I founded in Geneva.",
  },
  {
    id: "ideas",
    label: "Ideas in the works",
    summary:
      "Van Roye and Miradouro are concepts I'm still working on. So far each one has a brand and a plan.",
  },
]

/* -------------------------------------------------------------------- tech */

export const TECH: Tech[] = [
  { id: "claude-agent-sdk", label: "Claude Agent SDK" },
  { id: "claude-api", label: "Claude API" },
  { id: "mcp", label: "Model Context Protocol" },
  { id: "openai", label: "OpenAI API" },
  { id: "realtime-voice", label: "Realtime voice (OpenAI, Gemini Live)" },
  { id: "elevenlabs", label: "ElevenLabs" },
  { id: "nextjs", label: "Next.js" },
  { id: "typescript", label: "TypeScript" },
  { id: "nodejs", label: "Node.js" },
  { id: "swift", label: "Swift and SwiftUI" },
  { id: "python", label: "Python" },
  { id: "postgres", label: "PostgreSQL" },
  { id: "sqlite", label: "SQLite" },
  { id: "playwright", label: "Playwright" },
  { id: "docker", label: "Docker" },
  { id: "cloudflare", label: "Cloudflare" },
  { id: "vercel", label: "Vercel" },
  { id: "twilio", label: "Twilio" },
]

/* ---------------------------------------------------------------- products */

const img = (slug: ProductSlug) => `/work/${slug}/hero.webp`

/** Ordered by weight, most central first. */
export const PRODUCTS: Product[] = [
  {
    slug: "lodestar",
    name: "Lodestar",
    kind: "product",
    status: "prototype",
    oneLiner: "An iPhone and iPad app that sets up a Sony camera from one sentence and takes the shot.",
    description:
      "Lodestar (working name) is an iPhone and iPad app that sets up a Sony mirrorless camera from a sentence, takes the shot and checks the result.",
    story: [
      "I bought a Sony a7 and shot sunsets in Auto for way too long. The remote apps only give you buttons and the AI photo apps mostly give you advice, and I wanted an app that changes the settings for me. So I built Lodestar (still a working name). You describe the photo, for example \"portrait by the window, soft background\", and the phone connects to the camera's own Wi-Fi and suggests ISO, aperture, shutter, white balance and focus.",
      "When you tap, the settings go to the camera, and a setting only counts once the camera reads it back. Then the app takes the shot, downloads the JPEG and checks it with real measurements: histogram, clipping, sharpness and colour cast. If something is off, one tap fixes it and takes the photo again.",
      "Only the phone talks to the camera, over SSH and PTP/IP with a host key pinned at pairing, and the camera credentials stay in the Keychain. An on-device engine answers every request first, so the app still works on a hill with no signal. When there is signal, a backend on Cloudflare in the EU improves the answer with the model the user picked (Claude, OpenAI, Gemini or an open model), and it only uses providers the user agreed to. Photos are never stored on a server.",
      "The first version was a small Python MCP server. It connected the camera to Claude Desktop over USB-C with eight tools to read and change the settings, get live view, shoot and see the result as numbers a model can use. It worked well, so I rebuilt it for the phone and the camera's Wi-Fi, and I built SimCam, a simulated a7 V made from recorded camera traffic, so I don't need the real camera for every test. The MVP runs end to end against SimCam, the first checks on a real a7 V over Wi-Fi have passed, and the full device checklist is next.",
    ],
    highlights: [
      "The full loop: describe the shot, apply the settings, read them back from the camera, shoot, check the result, fix with one tap and reshoot",
      "Camera code in Swift using PTP/IP with Sony extensions over SSH, with an exactly pinned host key",
      "SimCam, a camera simulator built from recorded a7 V traffic, used for tests and as a demo camera",
      "Choice of model: Claude, OpenAI, Gemini or an open model, sent only to providers the user approved",
      "An instant on-device suggestion for every request, with cloud refinement when there is signal",
      "The AI only acts during a turn the user started, and every photo needs a tap",
      "iPad layout with a fixed inspector panel; landscape viewfinder on iPhone",
      "First version: an MCP server for Claude Desktop with 8 tools over USB-C, showing exposure as text bars a model can read",
    ],
    facts: [],
    stack: ["Swift 6", "SwiftUI", "SwiftNIO SSH", "PTP/IP", "TypeScript", "Cloudflare Workers", "Durable Objects", "Vercel AI SDK", "XcodeGen", "Python", "MCP (FastMCP)", "gphoto2"],
    platforms: ["iOS", "iPadOS", "macOS (MCP server)"],
    themes: ["agentic-ai", "human-in-the-loop", "grounding", "mcp-tool-use", "photography"],
    started: "2026-10",
    image: img("lodestar"),
    imageAlt: "Azure illustration of an astronaut lining up a mirrorless camera under a single four-point guiding star",
    weight: 1,
    schemaType: "MobileApplication",
    applicationCategory: "PhotographyApplication",
    operatingSystem: "iOS, iPadOS",
  },
  {
    slug: "neonduck",
    name: "Neonduck",
    kind: "product",
    status: "beta",
    oneLiner: "A personal AI assistant that answers mail, looks up trains, fills Swiss shopping baskets and can even make calls.",
    description:
      "Neonduck is a personal AI assistant for Switzerland that handles mail, calendar, trains and shopping, and can even make phone calls. Each customer gets an isolated server.",
    story: [
      "Neonduck is a personal AI assistant that handles the online chores I used to do myself, and it can even make phone calls. I use it every day, and I built it so people who don't write code can have one too. You write or talk to it and it works on your own accounts: it reads and answers mail, manages the calendar, looks up trains, fills a shopping basket on Swiss shops, sends WhatsApp messages and writes a morning briefing.",
      "Every customer gets their own container, database, browser profile and data volume, so one person's mail, logins and memory are kept apart from everyone else's. If you delete your account, your server is deleted too. A small central service only handles sign-in, provisioning and backups.",
      "It works in a real browser that you can watch and take over at any time. Saved passwords are never shown to the model. A new instance asks before it sends, deletes, pays for or invites anything, and tasks that run while nobody is watching can only read. Voice runs on Gemini Live or OpenAI Realtime and passes questions on to Claude, and phone calls go out on the customer's own Twilio account only after they tap Allow.",
      "It connects to Google and Microsoft accounts, any MCP server by address, smart-home devices and music services. The site is in English, German, French and Italian. Neonduck is in an invitation-only beta for now.",
    ],
    highlights: [
      "One isolated server per customer: container, database, browser profile and data volume",
      "A Claude Agent SDK agent with permission gates and approval cards",
      "A live agent browser the customer can watch and take over",
      "Asks before sending, deleting, paying or inviting; unattended runs can only read",
      "Voice through Gemini Live or OpenAI Realtime, passing questions to Claude",
      "Connects to Google, Microsoft, any MCP server, smart home, music, WhatsApp and phone calls",
      "Usage limits per customer",
      "Site in English, German, French and Italian",
    ],
    facts: [
      "4 site languages: English, German, French, Italian",
    ],
    stack: ["Node.js (plain ESM)", "Claude Agent SDK", "SQLite", "Playwright", "Gemini Live", "OpenAI Realtime", "Twilio", "Fly.io", "Docker", "Cloudflare DNS", "Chrome extension"],
    platforms: ["Web (PWA)", "Chrome extension"],
    themes: ["agentic-ai", "human-in-the-loop", "self-hosting", "mcp-tool-use", "swiss-multilingual"],
    url: "https://neonduck.io",
    started: "2026-10",
    image: img("neonduck"),
    imageAlt: "Azure illustration of an astronaut walking through a field of glowing glass pods, one private machine for each person",
    weight: 0.97,
    schemaType: "WebApplication",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
  },
  {
    slug: "dbrain",
    name: "Dbrain",
    kind: "product",
    status: "private",
    oneLiner: "Self-hosted memory for my AI assistants: verbatim records on a home NAS, served over MCP.",
    description:
      "Dbrain is my self-hosted memory: a Docker stack on a home NAS that stores my records verbatim and gives Claude access through MCP.",
    story: [
      "Claude kept forgetting what I told it, and my information was spread across mail, chats and a reading list I never read. So I built Dbrain, a memory that Claude can search, running on a NAS in my flat.",
      "Every 30 minutes an ingest loop saves new records word for word in Postgres. It makes no model calls and writes no AI summaries, so Claude always reads the original text when it answers. A separate table holds only what I explicitly asked it to remember, and the schema keeps personal and business data apart.",
      "A tool server makes search, pages and memory available as MCP connectors in claude.ai and in Neonduck. Other services in the same stack handle messaging, smart home, fitness, shared expenses, a browser and AI phone calls. The whole stack can only be reached through an authenticated tunnel.",
      "I wanted to measure how well it finds things. A golden set of real questions scores recall before and after every change to search, and the last recorded run answered 23 of 25. Backups run every night, and a restore is tested automatically every week.",
    ],
    highlights: [
      "Verbatim ingest every 30 minutes, with no model calls at ingest",
      "Personal and business data kept apart in the schema",
      "MCP connectors for claude.ai and for Neonduck",
      "Recall scored against a golden set of real questions",
      "AI phone calls through Twilio and OpenAI Realtime",
      "Nightly backups and an automated weekly restore test",
    ],
    facts: [
      "23 of 25 test questions answered correctly (8 Oct 2026)",
    ],
    stack: ["Python", "PostgreSQL full-text search", "Node.js", "TypeScript", "MCP", "Docker Compose", "Synology NAS", "Cloudflare Tunnel", "Twilio", "OpenAI Realtime", "pytest"],
    platforms: ["Self-hosted NAS", "MCP connectors"],
    themes: ["self-hosting", "mcp-tool-use", "grounding", "agentic-ai"],
    started: "2026-09",
    image: img("dbrain"),
    imageAlt: "Azure illustration of an astronaut filing glowing index cards into a small orbiting archive module",
    weight: 0.93,
    schemaType: "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux (Docker)",
  },
  {
    slug: "lightbox",
    name: "Lightbox",
    kind: "product",
    status: "private",
    oneLiner: "AI photo sorting for a self-hosted library, with keep scores and duplicate stacks.",
    description:
      "Lightbox uses Claude vision to score every photo in a self-hosted Synology Photos library, groups duplicates, and keeps rejected photos in a trash album for 30 days so every cull can be undone.",
    story: [
      "With a few cameras, a NAS fills up much faster than I can look through the photos. Lightbox runs next to Synology Photos and helps me get from thousands of photos down to the ones worth keeping.",
      "For each photo, one Claude vision call returns a keep score, a caption, tags, technical faults and a one-sentence reason. Near-duplicates and bursts are grouped into stacks with a perceptual hash and a time window, and you can compare them side by side. You can cull with the keyboard from search results, albums or the timeline.",
      "Rejected photos go to a trash album, a sweep deletes them after 30 days, and every action has Undo. Search works with plain sentences, including dates and seasons. It also suggests trip albums based on gaps in the timeline.",
      "The backfill runs through the Message Batches API with a daily cost limit, which is slower but cheaper. A second service serves a passphrase-protected gallery and an MCP server, so Claude can browse the library too. Lightbox runs as one of the services in the Dbrain stack.",
    ],
    highlights: [
      "A Claude vision keep score with a readable reason for every photo",
      "Duplicate and burst stacks with compare and an AI pick",
      "Search in plain sentences, with dates and seasons understood",
      "Reversible culling: trash album, 30-day sweep, Undo on every action",
      "Trip albums proposed from gaps in the timeline",
      "Message Batches backfill under a daily cost ceiling",
      "An MCP server so Claude can browse the library",
    ],
    facts: [
      "9,666 of 9,702 indexed photos scored by AI",
      "304 duplicate stacks covering 817 photos",
    ],
    stack: ["TypeScript", "Node.js", "PostgreSQL", "Claude vision", "Message Batches API", "Synology Photos API", "ffmpeg", "exiftool", "hls.js", "Docker Compose", "Cloudflare Access"],
    platforms: ["Self-hosted NAS", "Web (PWA)", "MCP"],
    themes: ["agentic-ai", "human-in-the-loop", "self-hosting", "mcp-tool-use", "photography"],
    started: "2026-09",
    image: img("lightbox"),
    imageAlt: "Azure illustration of an astronaut sorting floating blank photo frames on a light table in zero gravity",
    weight: 0.9,
    schemaType: "WebApplication",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
  },
  {
    slug: "haystack-os",
    name: "Haystack OS",
    kind: "product",
    status: "private",
    oneLiner: "The lean ATS and CRM I run my recruitment agency on, with Claude doing the reading and the drafting.",
    description:
      "Haystack OS is the lean ATS and CRM I built for Haystack, my tech recruitment agency: Claude parses CVs and drafts the paperwork, matching quotes the evidence for every criterion, and a full MCP server lets assistants read and write.",
    story: [
      "Haystack OS started in May 2025 as a much bigger recruiting platform, with branded competence files, a Chrome extension, an Outlook add-in and job board publishing. For Haystack I only used a fraction of it, so in November 2026 I rebuilt it as a lean tool for one recruiter, me, and removed most of the old features.",
      "Every Claude job runs on my own Claude subscription, through a worker on my home NAS that uses the Claude Agent SDK, so there is no API key. Claude turns CVs in PDF or DOCX into profiles and writes summaries. It drafts a scorecard from a client brief, and writes shortlist notes, weekly client updates and tasks from my call notes. A guard stops a job before it could be billed to usage credits, and nothing new starts on the NAS at night.",
      "Matching checks each person against each criterion on the scorecard and quotes the evidence. There is no single overall score, and nobody is rejected automatically. Search mixes Postgres full-text search with pgvector, Voyage embeddings and reranking, with filters for location and work permit.",
      "An assistant inside the app reads the records and proposes changes, and I approve them one by one. Outside the app, a full MCP server with 51 tools lets Claude read and write too, with personal tokens scoped to read, write, share or destroy, and OAuth sign-in for claude.ai through Clerk. It is private and I am its only user.",
    ],
    highlights: [
      "Claude jobs run on my own subscription through a worker on my NAS, with no API key",
      "CVs in PDF and DOCX parsed into profiles, with summaries",
      "Scorecards drafted from a client brief, plus shortlist notes and weekly client updates",
      "Matching per scorecard criterion with quoted evidence, no overall score and no automatic rejection",
      "Hybrid search: Postgres full-text and pgvector with Voyage embeddings and reranking",
      "An in-app assistant whose changes I approve one by one",
      "A read and write MCP server with 51 tools, scoped tokens and OAuth sign-in for claude.ai",
    ],
    facts: [],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL (Neon) + pgvector", "Clerk", "Vercel Blob", "Vercel", "Claude Agent SDK", "Voyage AI", "Resend", "MCP", "Vitest"],
    platforms: ["Web", "MCP", "Worker on a self-hosted NAS"],
    themes: ["agentic-ai", "mcp-tool-use", "grounding", "human-in-the-loop", "self-hosting", "tech-talent"],
    url: "https://app.haystack.agency",
    urlNote: "Sign-in only: the tool is private.",
    started: "2025-05",
    image: img("haystack-os"),
    screensNote: "Every person, company and CV in these screens is made-up demo data.",
    screens: [
      { src: "/work/haystack-os/screen-01-home.webp", alt: "Haystack OS home page with one open sprint for a Senior Data Engineer, a missing shortlist note under Needs attention, two tasks due today and a recent activity feed.", caption: "The home page shows the open sprint with its pipeline counts, what needs attention, the tasks due today and recent activity, with Claude's part in each change marked.", width: 1600, height: 1000 },
      { src: "/work/haystack-os/screen-02-candidate.webp", alt: "Candidate profile of Sophie Marchand, Lead Data Engineer in Geneva, with a summary, sprint stage, experience and a details column of skills, languages and permit, each tagged Claude.", caption: "A candidate profile filled in by Claude from an uploaded CV, with a written summary, work history and details, each marked where Claude supplied the value.", width: 1600, height: 1000 },
      { src: "/work/haystack-os/screen-04-matches.webp", alt: "Matches table for the sprint with candidates in rows, scorecard criteria in columns, coloured Meets, Partly and No evidence verdicts, locations and Add to pipeline buttons.", caption: "The Matches tab lists the people we already know against every scorecard criterion, with a verdict of Meets, Partly or No evidence for each, plus distance and permit.", width: 1600, height: 1000 },
      { src: "/work/haystack-os/screen-04b-evidence.webp", alt: "Popover over the Matches table for Warehouse modelling in dbt, showing what good looks like, two quotes from the CV and a sentence explaining the verdict.", caption: "Opening a verdict shows the quoted lines from the CV that support it and a short explanation of how they meet the criterion.", width: 1600, height: 1000 },
      { src: "/work/haystack-os/screen-05-pipeline.webp", alt: "Kanban board with stages Sourced to Offer, showing Am\u00e9lie Roux in Contacted, Lukas Brenner in Screening and Sophie Marchand in Shortlisted.", caption: "The sprint pipeline board shows each person at their stage, with their next step, days in stage and whether a shortlist note exists.", width: 1600, height: 1000 },
      { src: "/work/haystack-os/screen-06-shortlist-note.webp", alt: "Side panel for Sophie Marchand with a shortlist note under the headings What they have built, Where they would shine and What we would still check, and a Shared with client switch turned off.", caption: "A shortlist note drafted by Claude and saved in the candidate's panel, in three parts, with sharing to the client switched off.", width: 1600, height: 1000 },
      { src: "/work/haystack-os/screen-07-search.webp", alt: "Candidates list in Skills and experience mode for the query someone who builds cloud warehouses for banks, with each result showing quoted evidence lines and their source.", caption: "Searching candidates by skills and experience with a plain sentence returns people with the lines from their profile or CV that answer it, and what the record does not show.", width: 1600, height: 1000 },
      { src: "/work/haystack-os/screen-08b-approval.webp", alt: "Assistant panel on a candidate profile showing a card that proposes creating a task due 19 Nov 2026, with Show details, Decline and Approve buttons.", caption: "When proposing changes is switched on, the assistant asks before it acts, with a card that states the change in words and waits for approval.", width: 1600, height: 1000 },
    ],
    imageAlt: "Azure illustration of an astronaut connecting constellations of profile cards into a single map",
    weight: 0.84,
    schemaType: "WebApplication",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
  },
  {
    slug: "romandy-cto",
    name: "Romandy CTO",
    kind: "product",
    status: "live",
    oneLiner: "The bilingual platform behind a peer network of senior tech leaders in Romandy.",
    description:
      "romandycto.org is the bilingual platform David Vinkenroye built and runs for Romandy CTO, a peer network of senior tech leaders in Romandy.",
    story: [
      "Romandy CTO is a peer network for senior technology leaders, founders and decision-makers in Geneva and French-speaking Switzerland. The network has met since 2022. I built its platform, romandycto.org, in July 2025 and I keep it running.",
      "Event pages have registration, attendee lists, photo galleries and calendar links. There is a member directory with profiles and LinkedIn or Google sign-in, and an admin dashboard with member approval and a LinkedIn post composer that drafts posts with AI.",
      "A lot of the content is automated. Every Tuesday a pipeline reads RSS feeds, drafts the newsletter with Claude, adds images and sends it to members and subscribers. Every Friday a blog post is written and illustrated the same way, and the community gets a notification when it's published. Event reminders go out a week before and a day before each event.",
      "Everything works in English and French, including the email templates. I'm still improving it all the time.",
    ],
    highlights: [
      "Event pages with registration, attendees, galleries and add-to-calendar",
      "A member directory with LinkedIn and Google sign-in and an approval flow",
      "A weekly newsletter drafted with Claude from RSS feeds",
      "A weekly blog post written and illustrated with AI, with notifications to the community",
      "An admin LinkedIn composer with AI drafts",
      "Everything in English and French, including emails",
    ],
    facts: ["2 languages: English and French"],
    stack: ["Next.js", "TypeScript", "Supabase", "Clerk", "Resend", "Claude API", "OpenAI image models", "next-intl", "Tailwind CSS", "Vercel", "GitHub Actions"],
    platforms: ["Web"],
    themes: ["communities", "swiss-multilingual", "agentic-ai"],
    url: "https://www.romandycto.org",
    started: "2025-07",
    image: img("romandy-cto"),
    imageAlt: "Azure illustration of a ring of astronauts meeting around a small glowing table above Lake Geneva at night",
    weight: 0.8,
    schemaType: "WebApplication",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
  },
  {
    slug: "fde-club",
    name: "FDE Club",
    kind: "community",
    status: "live",
    oneLiner: "A community for forward deployed engineers in Switzerland, built by 122 AI agents.",
    description:
      "FDE Club (fdeclub.ch) is the community for forward deployed engineers in Switzerland that David Vinkenroye built and runs, with membership by application.",
    story: [
      "Forward deployed engineers are the people AI companies send into a customer's business to make the product actually work there. The role is growing fast and Switzerland had no place for them, so I started one: FDE Club, at fdeclub.ch.",
      "Membership is free and by application. You sign in with a passkey, GitHub, LinkedIn or an email code, there are no passwords, then you write a short profile and a person reads it. Members get a private directory they choose whether to appear in, and a say in the first meetups. The public side has a list of who is hiring forward deployed engineers in Switzerland, with a map and the date each role was last checked, a guide to what the role is, field notes, house rules and event pages with calendar feeds and QR check-in at the door.",
      "I built it with a swarm of AI agents in about a day and a half. First agents researched the stack, the sign-in options and other FDE communities and wrote a spec. Then nine workstreams were built in parallel, each in its own copy of the repository, and every stage was checked by separate agents that only looked for problems. In total 122 agents worked on it across nine workflow runs, and the repository has 211 commits.",
      "It's made to be found. Every page has structured data, there is an llms.txt for AI assistants, the sitemap goes to Google and IndexNow, and forwarddeployed.ch and fdeclub.org point to it.",
    ],
    highlights: [
      "Membership by application, with a person reviewing every profile",
      "Sign-in with passkeys, GitHub, LinkedIn or email codes, no passwords",
      "A tracker of forward deployed engineer roles in Switzerland, with a map and check dates",
      "Event pages with calendar feeds and QR check-in at the door",
      "Built by 122 AI agents in nine workflow runs: research, spec, parallel workstreams, independent checks",
      "Structured data, llms.txt, Google Search Console and IndexNow from the first day",
    ],
    facts: ["122 AI agents across 9 workflow runs", "211 commits in about a day and a half"],
    stack: ["Next.js", "React", "TypeScript", "Bun", "Better Auth", "Passkeys", "Drizzle ORM", "PostgreSQL (Neon)", "Resend", "React Email", "Vercel", "Cloudflare", "Playwright", "Vitest"],
    platforms: ["Web"],
    themes: ["communities", "agentic-ai"],
    url: "https://fdeclub.ch",
    started: "2026-11",
    image: img("fde-club"),
    imageAlt: "Azure illustration of two astronauts setting up a field station at a remote outpost, two chevrons of light pointing the way",
    weight: 0.78,
    schemaType: "WebApplication",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
  },
  {
    slug: "emineon",
    name: "Emineon",
    kind: "venture",
    status: "live",
    oneLiner: "My AI consulting firm in Geneva, with a site in English, French and German.",
    description:
      "Emineon is the AI-native consulting firm David Vinkenroye founded in Geneva: AI strategy, agentic systems in production and adoption.",
    story: [
      "Emineon is my company. It started as a consulting and talent business, and in 2026 I turned it into an AI-native consulting firm based in Geneva. Small senior teams help firms move from deciding to use AI to using it every day: strategy, agentic systems in production and adoption, with fees tied to results.",
      "It works mostly for the sectors Geneva is full of: commodities trading, private banking and international organisations, plus life sciences, fragrance and manufacturing. These are firms with many documents, several languages and regular audits, so data stays in Switzerland or in the client's own cloud.",
      "I rebuilt emineon.com from scratch in English, French and German. The oak from the old logo is now a lattice of dots with one ember node, and on the home page loose points come together into the tree in 3D. The site has pages for the five services, six industries, anonymised case studies and longer insight articles, and a newsletter with double opt-in sent through Resend.",
    ],
    highlights: [
      "Pages for five services and six industries, with anonymised case studies",
      "Site rebuilt from scratch in English, French and German, statically generated",
      "A 3D dot oak hero in three.js that pauses when it is off screen",
      "Insight articles and a newsletter with double opt-in through Resend",
    ],
    facts: [],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "three.js", "React Three Fiber", "Motion", "Resend", "Vercel"],
    platforms: ["Web"],
    themes: ["workshop", "swiss-multilingual", "agentic-ai"],
    url: "https://www.emineon.com",
    started: "2025-05",
    image: img("emineon"),
    imageAlt: "Azure illustration of an astronaut planting a small oak tree on the surface of a quiet planet",
    weight: 0.72,
    schemaType: "Organization",
  },
  {
    slug: "rive-foundry",
    name: "Rive Foundry",
    kind: "venture",
    status: "live",
    oneLiner: "My workshop in Geneva, and this website, where I keep track of what I build.",
    description:
      "Rive Foundry is the name of my workshop in Geneva, where I build my products. This website, rive-foundry.com, is its home.",
    story: [
      "Rive Foundry is what I call my workshop. Everything on this site was made there, from Neonduck and Lodestar to the family recipe website.",
      "The name comes from Rive, the district in the centre of Geneva by the lake, and foundry, a factory where things get made.",
      "The website is a project of its own. A particle field turns into my portrait, an astronaut, a globe, the lake, a star map and a double helix as you scroll. One file of facts feeds every page and the structured data, and the site has a sitemap, llms.txt and IndexNow submissions so search engines and AI tools can read it too.",
    ],
    highlights: [
      "The name of the workshop where I build my products",
      "A particle field that changes shape as you scroll",
      "One file of facts used by the pages and the JSON-LD",
      "llms.txt, a sitemap and IndexNow for search engines and AI tools",
    ],
    facts: [],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    platforms: ["Web"],
    themes: ["workshop"],
    started: "2025-05",
    image: img("rive-foundry"),
    imageAlt: "Azure illustration of an astronaut at a block-shaped forge on a lake shore, glowing ingots lined up in the water",
    weight: 0.7,
    schemaType: "Organization",
  },
  {
    slug: "haystack",
    name: "Haystack",
    kind: "venture",
    status: "live",
    oneLiner: "A tech recruitment agency in Geneva that finds the right engineer, data or AI person.",
    description:
      "Haystack is a tech recruitment agency in Geneva: focused searches for engineering, data and AI roles, with a written note on every candidate.",
    story: [
      "Haystack is a tech recruitment agency. The name comes from the idea of finding the one engineer or tech leader a team needs in a big haystack of candidates. The line on the site is \"Move the needle.\"",
      "Haystack runs focused recruitment sprints for engineering, data and AI roles. The scorecard is agreed with the hiring team before the search starts, every finalist comes with a one-page written note, and the team gets an update every week.",
      "I wrote the positioning and built the site myself, in English and French. It shows what lands in your inbox: a note on a finalist, the scorecard and the weekly update. The contact form goes through Resend.",
    ],
    highlights: [
      "Recruitment sprints for engineering, data and AI roles",
      "Scorecards agreed with the hiring team before the search starts",
      "A one-page written note on every finalist, and an update every week",
      "Sample notes, scorecards and weekly updates shown on the site, in English and French",
    ],
    facts: [],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Resend", "Vercel"],
    platforms: ["Web"],
    themes: ["tech-talent"],
    url: "https://www.haystack.agency",
    started: "2025-10",
    image: img("haystack"),
    imageAlt: "Azure illustration of an astronaut holding up the one bright needle found in a drifting field of particles",
    weight: 0.66,
    schemaType: "Organization",
  },
  {
    slug: "babytalk",
    name: "Babytalk",
    kind: "product",
    status: "prototype",
    oneLiner: "An iOS app that tells stories and sings songs to young children in a parent's voice.",
    description:
      "Babytalk is an iOS app for young children: stories, songs and lessons written by Claude and narrated in a parent's cloned voice or a preset one.",
    story: [
      "With Babytalk, a parent's voice can tell the bedtime story even when the parent is in another room or in a meeting. It plays stories, songs and short lessons that fit the child's age, narrated in the parent's own cloned voice or a preset voice.",
      "Claude writes the story and lesson scripts on the server. ElevenLabs does the narration, the voice cloning, the songs and the speech-to-text search. The songs are really sung, and I love that. A small API sits in between, so no key is stored on the device.",
      "The app has a story library, songs in several languages, lesson topics made on demand, voice search, read-along sentence by sentence and a hands-free talk mode that is safe for children.",
    ],
    highlights: [
      "Narration in a parent's cloned voice or a preset voice",
      "Scripts written by Claude; songs sung through ElevenLabs Music",
      "Voice search and sentence-level read-along",
      "A hands-free, child-safe talk mode",
      "An API proxy, so no key ships in the app",
    ],
    facts: [],
    stack: ["Swift 6", "SwiftUI", "SwiftData", "StoreKit 2", "XcodeGen", "Claude API", "ElevenLabs", "TypeScript", "Vercel"],
    platforms: ["iOS", "iPadOS"],
    themes: ["agentic-ai", "family"],
    started: "2026-06",
    image: img("babytalk"),
    imageAlt: "Azure illustration of an adult and a small astronaut on a hill reading a glowing book under a full moon",
    weight: 0.62,
    schemaType: "MobileApplication",
    applicationCategory: "EducationalApplication",
    operatingSystem: "iOS",
  },
  {
    slug: "retouch-studio",
    name: "Retouch Studio",
    kind: "product",
    status: "prototype",
    oneLiner: "Bulk AI photo retouching for a whole shoot, with presets and a zip download.",
    description:
      "Retouch Studio retouches a whole photo shoot at once with an OpenAI image model, with presets, a before and after slider and a zip download.",
    story: [
      "Retouching a shoot one photo at a time is slow and boring. Retouch Studio does the whole set at once. You drop in the photos, pick a preset or write your own instruction, and every photo goes through an OpenAI image-edit model, four at a time.",
      "The six presets are made for full-frame camera files: natural portrait, blemish removal, cinematic colour, landscape pop, studio black and white, and clean background. Big files are made smaller in the browser, a small queue retries failed photos with backoff, and each photo gets a before and after slider. The zip is built on your computer and nothing is stored on the server.",
    ],
    highlights: [
      "Bulk upload, four photos retouched in parallel, with retry and backoff",
      "Six presets tuned for full-frame photos, or your own prompt",
      "A before and after slider per photo",
      "Zip built in the browser; nothing stored on the server",
    ],
    facts: ["6 presets"],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "OpenAI image models", "JSZip", "Vercel"],
    platforms: ["Web"],
    themes: ["human-in-the-loop", "photography"],
    url: "https://retouch-studio.vercel.app",
    urlLabel: "Try the prototype",
    started: "2026-06",
    image: img("retouch-studio"),
    imageAlt: "Azure illustration of an astronaut adjusting tall glowing panels around a lit cube",
    weight: 0.56,
    schemaType: "WebApplication",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
  },
  {
    slug: "van-roye",
    name: "Van Roye",
    kind: "concept",
    status: "concept",
    oneLiner: "An ongoing concept: a titanium cuff from Geneva with a push-to-talk voice assistant.",
    description:
      "Van Roye is an ongoing hardware concept: Le Pinson, a titanium cuff with a push-to-talk AI voice assistant, shown on a scroll-driven microsite.",
    story: [
      "I wanted an AI wearable that doesn't listen all day, so I designed a titanium cuff that only hears you while you press and hold its stone. It's called Le Pinson, and Van Roye is the concept around it. The cuff records speech, and the language model and the voice run on the phone.",
      "Push-to-talk is there for privacy. Nothing is recorded until the wearer presses the stone, which also helps it follow Swiss rules on recording people. For the research I compared 11 wearable-AI products and form factors and drafted the hardware around a Nordic nRF54L15 chip in a sealed enclosure.",
      "The microsite tells the story with scroll animation, and an Atelier page shows the finishes and exploded views. The product images were generated and rebranded with a script.",
    ],
    highlights: [
      "A push-to-talk wearable assistant, with the model and the voice on the phone",
      "Hardware research benchmarking the main wearable-AI products",
      "A draft hardware design around a Nordic nRF54L15 chip",
      "A scroll-driven microsite with an Atelier page",
      "A scripted AI render pipeline",
    ],
    facts: ["11 wearable-AI products and form factors benchmarked in the research"],
    stack: ["HTML", "CSS", "JavaScript", "GSAP ScrollTrigger", "Node.js scripts", "Vercel"],
    platforms: ["Web"],
    themes: ["human-in-the-loop", "ideas"],
    url: "https://van-roye.vercel.app",
    urlLabel: "See the concept site",
    started: "2026-10",
    image: img("van-roye"),
    imageAlt: "Azure illustration of a titanium cuff floating above a dark plain, a tiny astronaut standing inside it",
    weight: 0.5,
    schemaType: "CreativeWork",
  },
  {
    slug: "birth-announcement",
    name: "Birth announcement site",
    kind: "product",
    status: "live",
    oneLiner: "A bilingual family website built in a week to announce a birth and gather the replies.",
    description:
      "A private bilingual birth announcement site: an animated night sky, a guestbook, a photo gallery and a form that collects addresses for printed cards.",
    story: [
      "I built this site so a birth announcement could be shared in one place, without sending a hundred separate messages. It opens with a slow animated night sky with clouds and birds, then a short poem and the first details.",
      "Visitors can switch between English and French, sign a guestbook, look at the photo gallery and download the whole album as one zip. A separate form collects postal addresses for the printed cards, and a private admin page is used to moderate the guestbook and export the addresses. The site is private, so I don't link to it here.",
    ],
    highlights: [
      "English and French throughout, with a language switcher",
      "An animated sky with drifting clouds and flying birds",
      "Guestbook and card address form on serverless Postgres",
      "Photo gallery with a one-click album zip",
      "Private admin page for moderation and address export",
    ],
    facts: ["Built in one week", "2 languages"],
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Framer Motion", "Neon Postgres", "Vercel"],
    platforms: ["Web"],
    themes: ["swiss-multilingual", "family"],
    image: img("birth-announcement"),
    imageAlt: "Azure illustration of two astronauts on a hill at night looking up at a single newly lit star",
    weight: 0.4,
    schemaType: "WebApplication",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
  },
  {
    slug: "family-recipes",
    name: "Family recipe website",
    kind: "product",
    status: "live",
    oneLiner: "An interactive family recipe website with search, cooking checklists and scaling.",
    description:
      "A private interactive family recipe website with search, categories, servings scaling, cooking checklists and recipe drafts written with Claude.",
    story: [
      "Our family recipes were in a cookbook saved as a PDF. I wanted them somewhere we can search them and cook from them on a phone, so I built an interactive family recipe website.",
      "You can browse by category or search, and each recipe has its story, difficulty and times. On the recipe page you can scale the servings from half to triple, tick off ingredients and steps as you cook and print the recipe. The ticks are saved in the browser, so you can put the phone down and pick up where you were.",
      "Only the family can log in. To add a recipe, you type a title and can add a photo of the dish, and Claude writes a first draft that you check and edit. Saving it adds the recipe as a file to the site's GitHub repo. There is also a page for family events with photo albums. The site is private, so I don't link to it here.",
    ],
    highlights: [
      "Browse by category and search",
      "Servings scaling from half to triple",
      "Ingredient and step checklists saved in the browser",
      "A print view for every recipe",
      "Family-only login",
      "Recipe drafts written by Claude from a title and an optional photo",
      "New recipes saved as files in the GitHub repo",
      "Family event pages with photo albums",
    ],
    facts: [],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Claude API", "MDX", "GitHub API", "Vercel"],
    platforms: ["Web"],
    themes: ["family"],
    started: "2025-05",
    image: img("family-recipes"),
    imageAlt: "Azure illustration of an astronaut stirring a pot in a warm kitchen module with recipe cards floating around",
    weight: 0.38,
    schemaType: "WebApplication",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
  },
  {
    slug: "miradouro",
    name: "Miradouro",
    kind: "concept",
    status: "concept",
    oneLiner: "An ongoing concept: small groups of quiet-luxury villas on Portugal's Green Coast.",
    description:
      "Miradouro is an ongoing venture concept for a sustainable, quiet-luxury real-estate and lifestyle brand on Portugal's Green Coast.",
    story: [
      "Miradouro is a quiet-luxury real-estate and lifestyle brand in Alto Minho, on Portugal's northern Green Coast, away from the busy Lisbon and Algarve markets. There is no software in this one. I started it in 2025 and I'm still working on it.",
      "So far I've written the pitch and the launch plan, researched the coastal market and the planning rules in the region, and set up a template to track land plots. The idea is to build modern villas adapted to the climate with local partners, with privacy, nature and an active life at the centre.",
      "I fell in love with Alto Minho. It has a long Atlantic coast with plenty of Blue Flag beaches and far less building than the south. The plan is small groups of three to five villas near Caminha.",
    ],
    highlights: [
      "Pitch deck and launch plan",
      "Market research on emerging coastal regions in Portugal",
      "A land-plot tracking template",
      "Planning research on the Caminha municipal master plan and urban regeneration plan",
      "Site plan: clusters of three to five climate-adapted villas per plot",
    ],
    facts: ["Focus region: Alto Minho, around Caminha (Moledo and Cristelo)"],
    stack: [],
    platforms: [],
    themes: ["ideas"],
    started: "2025-05",
    image: img("miradouro"),
    imageAlt: "Azure illustration of an astronaut leaning on a curved terrace, looking out over a plain of dark blocks to the horizon",
    weight: 0.3,
    schemaType: "CreativeWork",
  },
]

/* ------------------------------------------------------------------- edges */

const PERSON_LINK: Record<ProductSlug, string> = {
  lodestar: "built",
  neonduck: "built",
  lightbox: "built",
  dbrain: "built",
  "haystack-os": "built",
  emineon: "founded",
  haystack: "built",
  "romandy-cto": "built and runs",
  "fde-club": "built and runs",
  "rive-foundry": "runs",
  babytalk: "built",
  "retouch-studio": "built",
  "van-roye": "designed",
  miradouro: "designed",
  "birth-announcement": "built",
  "family-recipes": "built",
}

/** Which TECH nodes each product links to in the graph (a subset of its stack). */
const PRODUCT_TECH: Record<ProductSlug, string[]> = {
  lodestar: ["swift", "typescript", "cloudflare", "claude-api", "openai", "python", "mcp"],
  neonduck: ["claude-agent-sdk", "nodejs", "sqlite", "playwright", "realtime-voice", "twilio", "docker", "mcp"],
  lightbox: ["claude-api", "typescript", "postgres", "docker", "mcp", "cloudflare"],
  dbrain: ["python", "postgres", "mcp", "docker", "cloudflare", "twilio", "realtime-voice"],
  "haystack-os": ["claude-agent-sdk", "nextjs", "typescript", "postgres", "mcp", "vercel"],
  emineon: ["nextjs", "typescript", "vercel"],
  haystack: ["nextjs", "typescript"],
  "romandy-cto": ["nextjs", "typescript", "postgres", "claude-api", "openai", "vercel"],
  "fde-club": ["nextjs", "typescript", "postgres", "playwright", "vercel", "cloudflare"],
  "rive-foundry": ["nextjs", "typescript", "vercel"],
  babytalk: ["swift", "claude-api", "elevenlabs", "typescript", "vercel"],
  "retouch-studio": ["nextjs", "typescript", "openai", "vercel"],
  "van-roye": ["vercel"],
  miradouro: [],
  "birth-announcement": ["nextjs", "typescript", "postgres", "vercel"],
  "family-recipes": ["nextjs", "typescript", "postgres", "claude-api", "vercel"],
}

/** Product to product links, read as `from` <label> `to`. */
const PRODUCT_LINKS: Edge[] = [
  { from: "lightbox", to: "dbrain", label: "runs inside" },
  { from: "neonduck", to: "dbrain", label: "remembers through" },
]

/**
 * The star map groups every product under one hub theme, its "constellation".
 * Order matters: neighbours on the map sit next to each other (Lightbox, in
 * photos, borders the home stack it runs inside).
 */
export const CONSTELLATIONS: Array<{ theme: string; label: string; members: ProductSlug[] }> = [
  { theme: "self-hosting", label: "Home stack", members: ["neonduck", "dbrain"] },
  { theme: "photography", label: "Cameras and photos", members: ["lightbox", "lodestar", "retouch-studio"] },
  { theme: "ideas", label: "Ideas in the works", members: ["van-roye", "miradouro"] },
  { theme: "family", label: "For the family", members: ["babytalk", "birth-announcement", "family-recipes"] },
  { theme: "tech-talent", label: "Tech people", members: ["haystack-os", "haystack"] },
  { theme: "communities", label: "Communities", members: ["romandy-cto", "fde-club"] },
  { theme: "workshop", label: "Workshop and company", members: ["rive-foundry", "emineon"] },
]

export const EDGES: Edge[] = [
  ...PRODUCTS.map((p) => ({ from: PERSON_ID, to: p.slug, label: PERSON_LINK[p.slug as ProductSlug] })),
  ...PRODUCTS.flatMap((p) => p.themes.map((t) => ({ from: p.slug, to: t }))),
  ...PRODUCTS.flatMap((p) => PRODUCT_TECH[p.slug as ProductSlug].map((t) => ({ from: p.slug, to: t }))),
  ...PRODUCT_LINKS,
]

/* ------------------------------------------------------------- mission log */

/**
 * Dated entries for the home page, newest first. Only things that happened,
 * with the month they happened; dates match `started` on the products.
 */
export const MISSION_LOG: Array<{ date: string; label: string; text: string; href?: string }> = [
  { date: "2026-11", label: "Nov 2026", text: "Launched FDE Club, a community for forward deployed engineers in Switzerland, built by 122 AI agents.", href: "/work/fde-club" },
  { date: "2026-11", label: "Nov 2026", text: "Rebuilt my recruiting tool as Haystack OS, a lean ATS and CRM where Claude runs on my own subscription.", href: "/work/haystack-os" },
  { date: "2026-11", label: "Nov 2026", text: "Turned Emineon into an AI-native consulting firm in Geneva, with a new site in English, French and German.", href: "/work/emineon" },
  { date: "2026-10", label: "Oct 2026", text: "Rebuilt rive-foundry.com as my personal site and workshop.", href: "/rive-foundry" },
  { date: "2026-10", label: "Oct 2026", text: "Relaunched Haystack as a tech recruitment agency.", href: "/work/haystack" },
  { date: "2026-10", label: "Oct 2026", text: "Lodestar ran end to end against SimCam, and the first checks on a real a7 V passed.", href: "/work/lodestar" },
  { date: "2026-10", label: "Oct 2026", text: "Opened an invitation-only beta of Neonduck.", href: "/work/neonduck" },
  { date: "2026-09", label: "Sep 2026", text: "Built Dbrain and Lightbox on my home server.", href: "/work/dbrain" },
  { date: "2026-06", label: "Jun 2026", text: "Started Babytalk and Retouch Studio.", href: "/work/babytalk" },
]

/* -------------------------------------------------------------------- faqs */

export const FAQS: Faq[] = [
  {
    q: "Who is David Vinkenroye?",
    a: "I build AI products in Geneva with many different models and tools. They include Neonduck, a personal AI assistant for Switzerland; Lodestar, a camera app for Sony mirrorless cameras; and Dbrain, my self-hosted memory. Rive Foundry is the name of my workshop, and this website is its home.",
  },
  {
    q: "What has David Vinkenroye built?",
    a: "Neonduck, a personal AI assistant for Switzerland; Lodestar, an AI camera assistant for Sony mirrorless cameras; Dbrain, my self-hosted memory; Lightbox, AI photo sorting for my own photo library; Haystack OS, the ATS and CRM my recruitment agency runs on; the romandycto.org platform; and FDE Club, a community for forward deployed engineers in Switzerland. Each one has its own page under /work with the full story.",
  },
  {
    q: "Where is David Vinkenroye based?",
    a: "Geneva, Switzerland, by the lake. I love that the city is on a human scale with the airport right next to town, the tech scene is vibrant and I keep meeting new people, and the mountains are close: I ski, go mountaineering and run trails. The Côte d'Azur is about five hours away and Milan is close. I work in Dutch, French, English and German.",
  },
  {
    q: "How can I contact David Vinkenroye?",
    a: "Email me at david@rive-foundry.com, use the contact form on www.rive-foundry.com, or message me on LinkedIn. I'm happy to give advice on automating workflows with AI agents, building products from idea to launch, connecting AI models and agents to your own tools and data, and private Swiss hosting. For hiring senior tech people, that is Haystack. My public code is on GitHub as David-tech-creator.",
  },
  {
    q: "What is Neonduck?",
    a: "Neonduck is a personal AI assistant for people in Switzerland that I built on the Claude Agent SDK. It can do things online for you, like mail, calendar, shopping and messages, and it can even make phone calls. Every customer gets their own isolated server, and the assistant asks before it sends, pays, deletes or invites. It is in an invitation-only beta at neonduck.io.",
  },
  {
    q: "What is Lodestar?",
    a: "Lodestar, a working name, is my iPhone and iPad app that joins a Sony mirrorless camera's own Wi-Fi. You describe the shot, and it applies the settings, checks that the camera actually took them, takes the photo and checks the result with real measurements. The MVP runs end to end against SimCam, a simulated Sony a7 V.",
  },
  {
    q: "What is Dbrain?",
    a: "Dbrain is my self-hosted personal memory: a Docker stack on a home NAS that stores my records word for word and makes them available to AI assistants through MCP connectors. I test how well it finds things with a set of real questions.",
  },
  {
    q: "Does David Vinkenroye build MCP servers?",
    a: "Yes, several. One lets Claude drive a Sony camera over USB, others give Claude my self-hosted memory and my photo library, and Haystack OS, my ATS, has a read and write MCP server with scoped tokens.",
  },
  {
    q: "What does David Vinkenroye build with?",
    a: "I mostly use the Claude Agent SDK and the Claude API, the Model Context Protocol, OpenAI and realtime voice models, TypeScript and Node.js, Next.js, Swift and SwiftUI for iOS, Python, PostgreSQL and SQLite, and Docker for anything self-hosted.",
  },
  {
    q: "What is Rive Foundry?",
    a: "Rive Foundry is what I call my workshop, where I build my products. Rive is the district by the lake in Geneva, and a foundry is where things get made. This website, rive-foundry.com, is its home.",
  },
]

/* ----------------------------------------------------------------- helpers */

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]))

export function getProduct(slug: string): Product | undefined {
  return BY_SLUG.get(slug)
}

const THEME_IDS = new Set(THEMES.map((t) => t.id))
const TECH_IDS = new Set(TECH.map((t) => t.id))

/** Resolve any graph node id (as used in EDGES) to its kind. */
export function nodeKind(id: string): NodeKind | undefined {
  if (id === PERSON_ID) return "person"
  const p = BY_SLUG.get(id)
  if (p) return p.kind
  if (THEME_IDS.has(id)) return "theme"
  if (TECH_IDS.has(id)) return "tech"
  return undefined
}

export const getTheme = (id: string) => THEMES.find((t) => t.id === id)
export const getTech = (id: string) => TECH.find((t) => t.id === id)
