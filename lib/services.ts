/**
 * What David can do for people, one page per offer, in English and French.
 *
 * Each offer gets its own URL so it can rank for the searches people actually
 * make ("AI agents Geneva", "IA souveraine Suisse", "MCP server developer").
 * Proof is always his own work under /work. Rules: no client names, no
 * metrics, no prices, no testimonials. The French copy should be read by David.
 */

import type { ProductSlug } from "@/lib/graph"

export type Lang = "en" | "fr"

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

export const SERVICES_PATH: Record<Lang, string> = { en: "/services", fr: "/fr" }

const LANGS_EN = "I work in French, English, German and Dutch."
const LANGS_FR = "Je travaille en français, en anglais, en allemand et en néerlandais."

export const SERVICES: Service[] = [
  {
    id: "ai-automation",
    serviceType: "AI workflow automation",
    path: { en: "/services/ai-automation", fr: "/fr/automatisation-ia" },
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
      fr: {
        title: "Automatisation IA et agents IA pour entreprises à Genève",
        h1: "Des agents IA qui vous libèrent du travail répétitif",
        description:
          "Je crée des agents IA et des automatisations pour les entreprises à Genève et en Suisse romande : e-mails, devis, CRM, rapports et relances.",
        short: "Agents IA et automatisation",
        lead:
          "Dans la plupart des équipes, quelques tâches prennent des heures chaque semaine : trier les e-mails, préparer des devis, recopier des données d'un outil à l'autre, refaire le même rapport. Je crée des agents IA qui font ce travail pour vous, et ils demandent votre accord avant d'envoyer, de payer ou de supprimer quoi que ce soit.",
        examples: [
          "Lire et trier les e-mails entrants, et préparer les réponses à valider",
          "Préparer des devis et des documents à partir d'un court brief",
          "Mettre le CRM à jour après les appels et les rendez-vous",
          "Rédiger des rapports ou des newsletters à partir de vos propres sources",
          "Relancer les tâches ouvertes et prévenir la bonne personne",
          "Passer des appels ou remplir des formulaires web pour les démarches courantes",
        ],
        steps: [
          { title: "Choisir un processus", body: "Nous regardons ensemble une tâche et définissons à quoi ressemble un bon résultat." },
          { title: "Construire un pilote", body: "Je construis une petite version qui tourne sur vos vrais outils et vos vraies données, pour que vous la voyiez fonctionner avant d'aller plus loin." },
          { title: "Passer en production", body: "Si le pilote fait le travail, nous le mettons en service au quotidien, avec des journaux lisibles et un moyen simple de l'arrêter." },
        ],
        notes: [
          "L'agent demande votre accord avant d'envoyer, de payer, de supprimer ou d'inviter. Vous voyez ce qu'il a changé et pourquoi.",
          "J'utilise les modèles et les outils les plus adaptés : Claude, OpenAI, Gemini, des modèles ouverts et beaucoup de code classique.",
          "Si vos données doivent rester en Suisse, l'agent peut tourner sur des serveurs suisses ou sur les vôtres.",
          LANGS_FR,
        ],
        proof: [
          { slug: "neonduck", line: "Mon assistant IA personnel. Il fait des démarches en ligne pour moi, peut passer des appels et demande avant d'agir." },
          { slug: "romandy-cto", line: "Une newsletter hebdomadaire rédigée automatiquement à partir de flux RSS, et des rappels d'événements envoyés tout seuls." },
        ],
        faq: [
          { q: "Quelles tâches s'y prêtent ?", a: "Les tâches qui se répètent, qui suivent des règles que vous pourriez expliquer à un nouveau collègue, et qui se passent dans des outils accessibles : e-mail, documents, CRM, tableurs, formulaires. Celles qui demandent un jugement à chaque fois restent chez vous, et l'agent les prépare." },
          { q: "Dois-je changer d'outils ?", a: "En général, non. L'agent travaille avec les outils que vous utilisez déjà. Si un outil n'offre aucun accès, je vous le dis dès le début, pas après le développement." },
          { q: "Que deviennent mes données ?", a: "Elles ne vont qu'aux services que vous acceptez. Quand c'est important, tout tourne en Suisse ou sur votre propre serveur, sans que vos données servent à entraîner des modèles." },
        ],
      },
    },
  },
  {
    id: "ai-apps",
    serviceType: "AI product and app development",
    path: { en: "/services/ai-app-development", fr: "/fr/developpement-application-ia" },
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
      fr: {
        title: "Applications IA et iPhone sur mesure à Genève",
        h1: "De l'idée au lancement : produits IA, applications web et iPhone",
        description:
          "Je conçois et développe des produits IA à Genève, de l'idée au lancement : applications web en Next.js et applications iPhone et iPad en Swift.",
        short: "Produits de l'idée au lancement",
        lead:
          "Si vous avez une idée de produit, je peux la faire passer d'une esquisse à quelque chose que les gens utilisent. Je le conçois, le développe et le lance moi-même : la personne à qui vous parlez est celle qui écrit le code.",
        examples: [
          "Une première version (MVP) à montrer à de vrais utilisateurs",
          "Des applications iPhone et iPad natives en Swift et SwiftUI",
          "Des applications web et des outils internes en Next.js et TypeScript",
          "Une fonction IA ajoutée à un produit existant",
          "Des sites que les moteurs de recherche et les outils IA savent lire",
        ],
        steps: [
          { title: "Préciser l'idée", body: "Nous nous mettons d'accord sur le problème, pour qui il se pose et la plus petite version qui vaut la peine d'être construite." },
          { title: "Construire par étapes courtes", body: "Vous voyez une version qui fonctionne tôt et souvent, et nous changeons de cap tant que cela coûte peu." },
          { title: "Lancer et transmettre", body: "Je mets le produit en ligne, j'installe l'hébergement et la surveillance, et je vous laisse le code et la documentation." },
        ],
        notes: [
          "Swift et SwiftUI pour iOS, Next.js et TypeScript pour le web, Python et Node.js côté serveur.",
          "Hébergement en Suisse ou dans l'UE par défaut, ou là où vous en avez besoin.",
          LANGS_FR,
        ],
        proof: [
          { slug: "lodestar", line: "Une application iPhone et iPad qui règle un appareil photo Sony à partir d'une phrase et prend la photo." },
          { slug: "retouch-studio", line: "Une application web qui retouche toute une séance photo d'un coup." },
          { slug: "haystack-os", line: "L'ATS et CRM de mon agence de recrutement, où Claude lit les CV et rédige les documents." },
          { slug: "babytalk", line: "Une application iOS qui raconte des histoires du soir avec la voix d'un parent." },
        ],
        faq: [
          { q: "Développez-vous tout vous-même ?", a: "Oui, de la conception au lancement : la personne à qui vous parlez est celle qui écrit le code." },
          { q: "Pouvez-vous ajouter de l'IA à une application existante ?", a: "Oui. Je commence souvent par une seule fonction qui fait gagner du temps aux utilisateurs, puis on avance." },
        ],
      },
    },
  },
  {
    id: "mcp-servers",
    serviceType: "MCP server development",
    path: { en: "/services/mcp-servers", fr: "/fr/serveur-mcp" },
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
      fr: {
        title: "Serveur MCP sur mesure : connecter l'IA à vos outils et données",
        h1: "Serveurs MCP : connecter l'IA à vos outils et à vos données",
        description:
          "Je développe des serveurs MCP qui permettent à Claude, ChatGPT et d'autres assistants IA de travailler avec vos outils et vos données, en sécurité.",
        short: "Serveurs MCP et intégrations",
        lead:
          "Un assistant IA n'est utile que s'il peut accéder aux bonnes choses. Le Model Context Protocol (MCP) est le standard pour connecter des assistants comme Claude et ChatGPT à vos propres systèmes. Je développe des serveurs MCP qui leur donnent exactement l'accès nécessaire, et rien de plus.",
        examples: [
          "Permettre à votre équipe d'interroger vos documents, votre CRM ou votre base de données",
          "Connecter un assistant à un outil interne qui dispose d'une API",
          "Donner à un agent un accès en lecture seule aux données qu'il ne doit jamais modifier",
          "Chercher dans vos archives mot pour mot, pour que les réponses citent l'original",
          "Piloter du matériel, comme un appareil photo, depuis une conversation",
        ],
        steps: [
          { title: "Définir les accès", body: "Nous listons ce que l'assistant doit pouvoir lire et faire, et ce à quoi il ne doit jamais toucher." },
          { title: "Construire petit", body: "Chaque serveur a quelques outils clairs. En lecture seule quand c'est important, avec une validation pour tout ce qui modifie des données." },
          { title: "Tester sur de vraies questions", body: "Je le teste avec les questions que votre équipe pose vraiment, et je vérifie que les réponses viennent de vos données." },
        ],
        notes: [
          "Fonctionne avec Claude, ChatGPT et les autres assistants et agents compatibles MCP.",
          "Les serveurs peuvent tourner en Suisse, sur votre matériel ou derrière un tunnel avec authentification.",
          LANGS_FR,
        ],
        proof: [
          { slug: "dbrain", line: "Ma mémoire auto-hébergée : des données conservées mot pour mot et servies aux assistants IA via MCP." },
          { slug: "lightbox", line: "Un serveur MCP qui permet à un assistant de parcourir ma photothèque." },
          { slug: "lodestar", line: "Le projet a commencé comme un serveur MCP de huit outils qui pilotait un appareil Sony en USB." },
          { slug: "haystack-os", line: "Un outil de recrutement avec un serveur MCP de 51 outils, en lecture et en écriture, derrière des jetons à portée limitée." },
        ],
        faq: [
          { q: "Qu'est-ce que MCP ?", a: "Le Model Context Protocol est un standard ouvert pour connecter des assistants IA à des outils et à des données. Un même serveur fonctionne avec tous les assistants compatibles." },
          { q: "Est-ce sûr de connecter l'IA aux données de l'entreprise ?", a: "Oui, si l'accès est limité. Je donne à chaque serveur uniquement les outils nécessaires, en lecture seule quand c'est possible, avec une validation avant toute modification." },
          { q: "Avec quels assistants cela fonctionne-t-il ?", a: "Claude, ChatGPT et de plus en plus d'agents et d'éditeurs de code prennent en charge MCP. Je respecte le standard, vous n'êtes donc pas lié à un seul fournisseur." },
        ],
      },
    },
  },
  {
    id: "private-ai",
    serviceType: "Private, self-hosted AI",
    path: { en: "/services/private-ai-switzerland", fr: "/fr/ia-souveraine" },
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
      fr: {
        title: "IA souveraine et privée, hébergée en Suisse",
        h1: "Une IA privée, hébergée en Suisse ou sur vos propres serveurs",
        description:
          "IA souveraine pour les entreprises suisses : assistants et agents hébergés en Suisse ou sur votre matériel, une alternative privée à ChatGPT.",
        short: "IA privée en Suisse",
        lead:
          "Certaines données ne doivent pas voyager. Si vous travaillez avec des dossiers clients, des données de santé ou des informations confidentielles, je mets en place une IA qui tourne en Suisse ou sur vos propres serveurs. Vous décidez où vivent vos données et qui peut y accéder.",
        examples: [
          "Un assistant interne qui répond à partir de vos propres documents",
          "Une IA qui tourne sur un serveur cloud suisse, ou sur une machine dans vos bureaux",
          "Des modèles ouverts pour les tâches où ils suffisent",
          "Un serveur séparé et isolé par client ou par équipe",
          "Des sauvegardes dont la restauration a vraiment été testée",
        ],
        steps: [
          { title: "Décider ce qui reste où", body: "Nous trions vos données : ce qui peut passer par un modèle cloud, ce qui doit rester en Suisse et ce qui ne doit jamais quitter vos serveurs." },
          { title: "Mettre en place", body: "J'installe l'infrastructure, les modèles et les connexions, derrière une authentification solide." },
          { title: "Faire tourner", body: "Sauvegardes chaque nuit, un test de restauration que vous pouvez voir, et des mises à jour dont vous êtes informé." },
        ],
        notes: [
          "Les données personnelles et professionnelles peuvent rester séparées dans le même système.",
          "C'est conçu pour vous aider à respecter la loi suisse sur la protection des données (nLPD). L'analyse juridique reste chez vous ou votre avocat.",
          LANGS_FR,
        ],
        proof: [
          { slug: "dbrain", line: "Mes propres données tournent sur un serveur à la maison, avec une sauvegarde chaque nuit et un test de restauration chaque semaine." },
          { slug: "neonduck", line: "Pour les clients en Suisse, chaque personne a son propre serveur isolé. Supprimez le compte et le serveur disparaît aussi." },
          { slug: "lightbox", line: "Le tri de photos par IA pour une photothèque auto-hébergée, dans la même infrastructure." },
        ],
        faq: [
          { q: "Un modèle local est-il aussi bon que ChatGPT ?", a: "Pour beaucoup de tâches, comme trier, chercher et rédiger, les modèles ouverts suffisent. Pour les tâches les plus difficiles, un modèle cloud peut rester meilleur, et nous décidons au cas par cas quelles données peuvent y aller." },
          { q: "Où cela tourne-t-il exactement ?", a: "Sur un serveur cloud suisse ou sur votre propre matériel, selon votre choix. Vous connaissez l'emplacement et vous gardez les clés." },
          { q: "Est-ce que cela me rend conforme à la nLPD ?", a: "Cela aide, parce que vous contrôlez où vont les données. La conformité dépend aussi de vos processus, donc l'analyse juridique reste chez vous." },
        ],
      },
    },
  },
  {
    id: "ai-advice",
    serviceType: "AI advice and workshops",
    path: { en: "/services/ai-advice", fr: "/fr/conseil-ia" },
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
      fr: {
        title: "Conseil IA pour PME et fondateurs à Genève",
        h1: "Conseil IA pour les équipes et les fondateurs",
        description:
          "Conseil IA concret à Genève : quoi automatiser d'abord, quels outils choisir et comment protéger vos données. En français, anglais ou allemand.",
        short: "Conseil IA",
        lead:
          "J'aime partager des conseils. Si vous vous demandez où l'IA pourrait aider votre équipe, quels outils valent la peine ou si une idée tient la route, je peux vous aider à y voir clair, à partir de ce que j'ai construit et de ce que j'ai vu fonctionner.",
        examples: [
          "Trouver les deux ou trois tâches de votre entreprise à automatiser en premier",
          "Choisir entre les outils et les modèles, sans le battage médiatique",
          "Relire une idée de produit ou un plan avant d'y investir",
          "Un atelier pratique avec votre équipe, sur vos propres exemples",
          "Fixer des règles simples pour utiliser l'IA en sécurité avec les données de l'entreprise",
        ],
        steps: [
          { title: "Dites-moi où vous en êtes", body: "Quelques lignes sur votre équipe, vos outils et ce que vous voulez changer." },
          { title: "En parler", body: "Nous en discutons ensemble, en personne à Genève ou par appel." },
          { title: "Repartir avec la suite", body: "Quoi essayer d'abord, quoi laisser de côté et à quoi faire attention." },
        ],
        notes: ["En personne à Genève, ou par appel où que vous soyez.", LANGS_FR],
        proof: [
          { slug: "romandy-cto", line: "J'ai construit la plateforme d'un réseau de responsables tech en Suisse romande." },
          { slug: "neonduck", line: "La plupart de ce que je conseille, je l'ai d'abord construit et utilisé moi-même." },
        ],
        faq: [
          { q: "Faut-il être technique ?", a: "Non. J'explique les choses simplement, et nous partons de votre travail, pas de la technologie." },
          { q: "Pouvez-vous former mon équipe ?", a: "Oui, avec un atelier pratique construit autour de vos propres tâches et outils." },
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
  fr: [
    { title: "Recruter des profils tech seniors", body: "Vous cherchez un ingénieur ou un responsable tech, ou votre prochain poste ? C'est Haystack, l'agence de recrutement tech.", href: "/work/haystack", label: "Haystack" },
    { title: "Rencontrer d'autres responsables tech", body: "Romandy CTO est un réseau de responsables tech seniors en Suisse romande. Écrivez-moi pour organiser un événement avec nous ou y prendre la parole.", href: "/work/romandy-cto", label: "Romandy CTO" },
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
  fr: {
    title: "David Vinkenroye : agents IA, applications et IA souveraine à Genève",
    h1: "Je crée des produits IA à Genève",
    description:
      "David Vinkenroye à Genève : agents IA et automatisation, applications de l'idée au lancement, serveurs MCP, IA hébergée en Suisse et conseil IA.",
    kicker: "En français",
    lead:
      "Je m'appelle David Vinkenroye et je crée des produits IA à Genève, avec les outils les plus adaptés. Tout ce qui figure ici, je l'ai d'abord construit pour moi. Si l'un de ces sujets correspond à votre problème, écrivez-moi : quelques lignes suffisent.",
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
    langSwitch: "Français",
    more: "Read more",
  },
  fr: {
    home: "Accueil",
    services: "Services",
    examples: "Concrètement",
    how: "Comment ça se passe",
    good: "Bon à savoir",
    proof: "Ce que j'ai construit",
    faq: "Questions",
    contact: "Parlez-moi de votre projet",
    contactLead: "Quelques lignes suffisent. Je réponds par e-mail.",
    elsewhere: "Aussi",
    other: "Autres façons de vous aider",
    langSwitch: "English",
    more: "En savoir plus",
  },
}

export const getService = (id: string) => SERVICES.find((s) => s.id === id)

/** The same page in the other language. */
export function alternatePath(path: string): { en: string; fr: string } | null {
  if (path === SERVICES_PATH.en || path === SERVICES_PATH.fr) return { ...SERVICES_PATH }
  const s = SERVICES.find((x) => x.path.en === path || x.path.fr === path)
  return s ? { ...s.path } : null
}
