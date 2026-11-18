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
    seconds: 11,
    description:
      "The Neonduck site: the hero, then the lunch invite demo, where it checks the calendar and asks before it replies.",
  },
  lightbox: {
    slug: "lightbox",
    seconds: 14,
    description:
      "Lightbox on generated photos: keep scores on the timeline, review mode with the AI's reason, and three frames of one burst compared.",
    note: "Filmed on a local copy with made-up data and generated photos.",
  },
  "emineon-os": {
    slug: "emineon-os",
    seconds: 12,
    description: "Emineon OS: the AI copilot, the Create a Job wizard with Smart Intake, and the channels a job gets published to.",
  },
  emineon: {
    slug: "emineon",
    seconds: 8,
    description: "The Emineon site: the dot oak coming together, the five services and the 30-day sprint.",
    published: "2026-11-12",
  },
  "romandy-cto": {
    slug: "romandy-cto",
    seconds: 12,
    description: "The Romandy CTO site: the neon knife, the title bands, the next evening and the WhatsApp group card.",
  },
  "fde-club": {
    slug: "fde-club",
    seconds: 13,
    published: "2026-11-14",
    description: "The FDE Club site: the home page headline, how membership works, the roles map of Switzerland and the apply section.",
  },
  "rive-foundry": {
    slug: "rive-foundry",
    seconds: 14,
    published: "2026-11-17",
    description: "This site: the particle portrait, the astronaut, the globe, Lac Léman and the constellation of projects.",
  },
  "van-roye": {
    slug: "van-roye",
    seconds: 14,
    description: "The Van Roye site: the cuff among paper flowers, the clearing, the finch, the lake in a teacup and Le Pinson.",
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

export function filmPaths(slug: string) {
  const base = `/work/${slug}`
  return { src: `${base}/film.mp4`, small: `${base}/film-720.mp4`, poster: `${base}/film-poster.webp` }
}
