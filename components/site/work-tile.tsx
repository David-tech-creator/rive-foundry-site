import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/graph"
import { statusLabel } from "@/lib/seo"

/** A product with its astronaut art. Used on the home page and /work. */
export function WorkTile({
  product,
  headingLevel = "h3",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
}: {
  product: Product
  headingLevel?: "h2" | "h3"
  sizes?: string
  priority?: boolean
}) {
  const H = headingLevel
  return (
    <article className="group relative">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        <Image
          quality={85}
          src={product.image}
          alt={product.imageAlt}
          width={1536}
          height={1024}
          sizes={sizes}
          priority={priority}
          className="h-full w-full object-cover opacity-90 transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.02] group-hover:opacity-100"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <H className="text-xl text-text md:text-2xl">
          <Link href={product.slug === "rive-foundry" ? "/rive-foundry" : `/work/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </H>
        <span className="shrink-0 text-xs text-muted-foreground">{statusLabel(product.status)}</span>
      </div>
      <p className="mt-1.5 max-w-prose text-sm text-muted-foreground md:text-base">{product.oneLiner}</p>
    </article>
  )
}
