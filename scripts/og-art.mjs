/**
 * Prepares the artwork the social share cards (opengraph-image.tsx) draw.
 *
 * next/og (satori) reads PNG and JPEG but not WebP, and every image it draws
 * is base64'd into the render, so the cards stay small only if their art is
 * pre-sized. This script turns the WebP posters and hero art in public/work
 * and the stippled astronaut into small JPEG/PNG files in assets/og/.
 *
 * Re-run after replacing a hero, a film poster or the portrait:
 *   node scripts/og-art.mjs
 *
 * Output per product (only what the cards use):
 *   <slug>-poster.jpg  film poster, whole frame (products with a film). Its margins
 *                      are #1D1C21, a shade off the card's #1F1E22, so the whole
 *                      frame is lifted by that shade and sits on the card seamlessly
 *   <slug>-panel.jpg   hero art cropped to the card's right panel (no film, and rive-foundry)
 *   <slug>-tile.jpg    small hero tile for the /work card
 * plus portrait.png, the stippled astronaut (assets/og-src) with its alpha kept.
 */
import { mkdir, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = path.resolve(import.meta.dirname, "..")
const WORK = path.join(ROOT, "public/work")
const OUT = path.join(ROOT, "assets/og")

/** Right panel of a 1200x630 card. Keep in sync with lib/og.tsx PANEL. */
const PANEL = { width: 620, height: 630 }
const TILE = { width: 300, height: 200 }
const POSTER_WIDTH = 720

const exists = (p) => stat(p).then(() => true, () => false)

async function main() {
  await mkdir(OUT, { recursive: true })
  const slugs = (await readdir(WORK, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)

  for (const slug of slugs) {
    const hero = path.join(WORK, slug, "hero.webp")
    const poster = path.join(WORK, slug, "film-poster.webp")
    const hasPoster = await exists(poster)

    if (hasPoster) {
      await sharp(poster)
        .resize({ width: POSTER_WIDTH, withoutEnlargement: true })
        .removeAlpha()
        .linear([1, 1, 1], [2, 2, 1])
        .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" })
        .toFile(path.join(OUT, `${slug}-poster.jpg`))
    }
    if (await exists(hero)) {
      if (!hasPoster || slug === "rive-foundry") {
        await sharp(hero)
          .resize({ ...PANEL, fit: "cover", position: "attention" })
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(path.join(OUT, `${slug}-panel.jpg`))
      }
      await sharp(hero)
        .resize({ ...TILE, fit: "cover", position: "attention" })
        .jpeg({ quality: 76, mozjpeg: true })
        .toFile(path.join(OUT, `${slug}-tile.jpg`))
    }
  }

  // share cards never use David's photo: a stippled astronaut stands in for him
  const portrait = await sharp(path.join(ROOT, "assets/og-src/astronaut-stipple.png"))
    .resize({ width: 560, height: 560 })
    .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
    .toBuffer()
  await writeFile(path.join(OUT, "portrait.png"), portrait)

  const files = await readdir(OUT)
  let total = 0
  for (const f of files) total += (await stat(path.join(OUT, f))).size
  console.log(`assets/og: ${files.length} files, ${(total / 1024).toFixed(0)} KB`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
