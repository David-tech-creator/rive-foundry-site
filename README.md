# rive-foundry.com

The source of [rive-foundry.com](https://www.rive-foundry.com), my personal site and workshop in Geneva.

One WebGL particle field runs behind the whole page. As you scroll, about 130,000 particles reform into each section's picture: my portrait, an astronaut, a globe with Geneva on it, a map of Lake Geneva, and a star map of everything I build. Click the portrait for a short film.

## What's in here

- **`components/particles/`**: the particle engine: one three.js `Points` cloud with custom shaders. Formations are baked from images into point sets, then morphed on the GPU as you scroll. Particle counts and sizes adapt to phones, tablets and weak devices, and a static fallback covers browsers without WebGL. Start with `components/particles/README.md`.
- **`lib/graph.ts`**: one source of truth for products, themes and links. The star map, the work pages, the share images and the structured data (JSON-LD) are all generated from it.
- **`lib/graph-layout.ts`**: lays out the star map, in a wide version and a phone version, and keeps the labels from colliding.
- **`app/(en)` and `app/(fr)`**: the site in English and French, as two root layouts, so each page carries the right `lang`.
- **`app/logbook`**: the Logbook, including Frontier, a daily note on AI coding tools. The articles are written by a pipeline on my home server, which is not part of this repo.
- **`scripts/`**: tooling to bake portrait point sets and generate share images.

## Stack

Next.js 15 (App Router), React, TypeScript, Tailwind CSS, three.js, Resend for mail. Hosted on Vercel.

## Running it

```bash
npm install
npm run dev
```

The contact and newsletter forms need a `RESEND_API_KEY`; everything else runs without configuration.

---

This is a public copy of a private repository, without the code that runs on my home server. The code is here to read and learn from; the words, pictures and films are mine. More about me: [github.com/David-tech-creator](https://github.com/David-tech-creator).
