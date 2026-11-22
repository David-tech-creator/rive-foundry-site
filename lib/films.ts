/**
 * Product films: short silent loops of the real interface, shown on
 * /work/[slug] only (never on the home page, the /work index or the tiles).
 *
 * Only products with a real UI get one. The files live in
 * public/work/<slug>/: film.mp4 (1600x1000), film-720.mp4 (1152x720, phones)
 * and film-poster.webp (first frame, also the reduced-motion and Save-Data
 * fallback). The private tools were filmed on a local copy with made-up data.
 */

export type Film = {
  slug: string
  /** Loop length in seconds. */
  seconds: number
  /** What the loop shows. Used as the accessible label and the VideoObject description. */
  description: string
  /** Shown under the film when the footage is demo data, not the live product. */
  note?: string
  /**
   * Phone-only films: film-720.mp4 is a portrait crop around the phone
   * (388x720) so it stays readable on a phone. Width / height of that crop.
   */
  smallAspect?: string
  /** Date this film was made, when later than FILMS_PUBLISHED. */
  published?: string
  /**
   * A second, shorter film further down the page (for example the product's own
   * website). Files: film-<name>.mp4, film-<name>-720.mp4, film-<name>-poster.webp.
   */
  second?: { name: string; title: string; seconds: number; description: string; note?: string; smallAspect?: string }
}

export const FILM_SIZE = { width: 1600, height: 1000 } as const
export const FILM_SMALL_SIZE = { width: 1152, height: 720 } as const
/** Portrait crop of the phone films, as encoded in their film-720.mp4. */
const PHONE_CROP = "388 / 720"

/** Date the films were made; VideoObject uploadDate and sitemap publication_date. */
export const FILMS_PUBLISHED = "2026-10-25"

const DEMO = "Filmed on a local copy with made-up data."

export const FILMS: Record<string, Film> = {
  lodestar: {
    slug: "lodestar",
    seconds: 14,
    description:
      "Lodestar on the iPhone simulator with the demo camera: a typed request, the suggested settings applied, and a review where every check is green.",
    smallAspect: PHONE_CROP,
  },
  neonduck: {
    slug: "neonduck",
    seconds: 23,
    description:
      "The Neonduck app with demo data: it draws the day as a board, drafts a reply to a lunch invite and waits on an approval card until it is tapped, then finds the trains to Bern.",
    note: "Filmed on a local copy with made-up people and mail. The trains are real SBB connections.",
    published: "2026-11-19",
    second: {
      name: "site",
      title: "The site",
      seconds: 16,
      description: "The neonduck.io site: its hero film, then the lunch invite example, where it checks the calendar and asks before it replies.",
    },
  },
  kairo: {
    slug: "kairo",
    seconds: 24,
    description:
      "Kairo on three phones: the morning briefing opens and scrolls from the day's hours to what needs me; a WhatsApp chat gets a new message live and Kairo drafts the reply; Health scrolls from today's meals to the week.",
    note: "Filmed on a local copy with made-up people, chats and meals. The draft is a real one, written by Claude from the chat.",
    published: "2026-11-21",
    smallAspect: PHONE_CROP,
    second: {
      name: "whatsapp",
      title: "WhatsApp in Kairo",
      seconds: 13,
      description:
        "WhatsApp inside the Kairo iPhone app, on three phones: the chat list switches between All, Unread, Favourites and Groups and opens a community onto its groups; a message is dictated live, the words appearing as they are spoken, then tidied; and Kairo, asked in its private panel, checks the calendar and drafts the reply as a card with Put in box, Change and Send.",
      note: "Filmed in the iPhone simulator with made-up people and chats. Nothing is sent until I tap Send.",
      smallAspect: PHONE_CROP,
    },
  },
  lightbox: {
    slug: "lightbox",
    seconds: 14,
    description:
      "Lightbox on generated photos: keep scores on the timeline, review mode with the AI's reason, and three frames of one burst compared.",
    note: "Filmed on a local copy with made-up data and generated photos.",
  },
  "haystack-os": {
    slug: "haystack-os",
    seconds: 14,
    description:
      "The Haystack OS app with demo data: the home page with the open sprint, a candidate profile filled in by Claude, the matches table with per-criterion verdicts and the evidence behind one of them, the pipeline board and a shortlist note.",
    note: "Filmed on the live app with made-up demo data.",
    published: "2026-11-19",
  },
  emineon: {
    slug: "emineon",
    seconds: 15,
    description: "One scroll down the Emineon site: the dot oak, the numbers, the five services and the 30-day sprint counting up.",
    published: "2026-11-12",
  },
  "romandy-cto": {
    slug: "romandy-cto",
    seconds: 20,
    description: "One scroll down the Romandy CTO site: the neon knife, the evenings, the members, the blog and the community.",
  },
  "fde-club": {
    slug: "fde-club",
    seconds: 16,
    published: "2026-11-14",
    description: "One scroll down the FDE Club site: the headline, what is planned, how membership works, the roles map of Switzerland, the house rules and the apply section.",
  },
  "rive-foundry": {
    slug: "rive-foundry",
    seconds: 29,
    published: "2026-11-17",
    description: "One scroll down this site: the particle portrait turning into the astronaut, what I build, the mission log, Lac Léman, the constellation of projects and the workshop.",
  },
  haystack: {
    slug: "haystack",
    seconds: 18,
    description: "One scroll down haystack.agency: the opening, what lands in your inbox, the five steps and the questions people ask.",
    published: "2026-11-19",
  },
  "retouch-studio": {
    slug: "retouch-studio",
    seconds: 21,
    description: "Retouch Studio with a shoot of six photos: drop them in, pick Landscape Pop, retouch them all at once, then drag the slider to compare before and after.",
    note: "Filmed on a local copy with generated sample photos. The retouching in the film is a simple stand-in grade, not the AI model.",
    published: "2026-11-19",
  },
  "family-recipes": {
    slug: "family-recipes",
    seconds: 30,
    description: "The opening film and the red block that prints the name, the home page asking what's cooking tonight, a recipe with its method and a note, cook mode, the recipe index and adding a recipe.",
    note: "Filmed on a demo copy with a made-up reader and note, a neutral name and no albums.",
    published: "2026-11-20",
    second: {
      name: "guide",
      title: "The kitchen guide",
      seconds: 26,
      description: "Cook mode on a phone with the kitchen guide switched on: it greets the cook, turns to the next step when asked, sets a four-minute shallot timer by voice and answers how much wine goes in.",
      note: "Filmed on a demo copy with a made-up reader. The film has no sound; the bars move with the guide's voice in the real app.",
    },
  },
  babytalk: {
    slug: "babytalk",
    seconds: 11,
    description: "The Babytalk app on three phones: asking for a story, the gentle stream on the home screen, and the library of lessons.",
    note: "Filmed in the iPhone simulator with a made-up child's name.",
    published: "2026-11-19",
  },
  "van-roye": {
    slug: "van-roye",
    seconds: 27,
    description: "One unbroken scroll down the Van Roye site, so the scenes play as you scroll: the cuff among paper flowers, the clearing, the finch, the lake in a teacup, the three hours and the salon in Geneva.",
  },
  "birth-announcement": {
    slug: "birth-announcement",
    seconds: 15,
    description: "The balloon boat in a paper sky, the name writing itself in, the guestbook, the photo gallery and the card form.",
    note: "Filmed on a local copy with placeholder names and generated photos.",
    smallAspect: PHONE_CROP,
  },
}

export function getFilm(slug: string): Film | undefined {
  return FILMS[slug]
}

export function filmPaths(slug: string, name?: string) {
  const base = `/work/${slug}/film${name ? `-${name}` : ""}`
  return { src: `${base}.mp4`, small: `${base}-720.mp4`, poster: `${base}-poster.webp` }
}
