/**
 * Renders the Dbrain architecture diagram (components/site/dbrain-diagram.tsx)
 * to public/work/dbrain/hero.webp, used by the home gallery, share cards and
 * JSON-LD. Run: npx tsx --tsconfig <a tsconfig with "jsx": "react-jsx"> scripts/diagram-art.tsx,
 * then node scripts/og-art.mjs.
 */
import { renderToStaticMarkup } from "react-dom/server"
import sharp from "sharp"
import path from "node:path"
import { DbrainDiagram } from "../components/site/dbrain-diagram"

const VARS: Record<string, string> = {
  "var(--surface)": "#26252a",
  "var(--text)": "#ededef",
  "var(--azure-light)": "#4da3ff",
  "hsl(var(--muted-foreground))": "#8b8a93",
}

async function main() {
  let html = renderToStaticMarkup(<DbrainDiagram />)
  let svg = html.slice(html.indexOf("<svg"), html.indexOf("</svg>") + 6)
  for (const [k, v] of Object.entries(VARS)) svg = svg.split(k).join(v)
  svg = svg
    .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"')
    .replace('style="font-family:inherit"', 'style="font-family:Helvetica, Arial, sans-serif"')
  const diagram = await sharp(Buffer.from(svg), { density: 192 }).resize(1360).png().toBuffer()
  const meta = await sharp(diagram).metadata()
  await sharp({ create: { width: 1536, height: 1024, channels: 3, background: "#1f1e22" } })
    .composite([{ input: diagram, left: Math.round((1536 - meta.width!) / 2), top: Math.round((1024 - meta.height!) / 2) }])
    .webp({ quality: 86 })
    .toFile(path.join(process.cwd(), "public/work/dbrain/hero.webp"))
  console.log("wrote public/work/dbrain/hero.webp")
}
main()
