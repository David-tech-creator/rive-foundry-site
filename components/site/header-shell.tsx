"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"

const TOP = 80 // px: above this the header is the transparent hero header

/**
 * Sticky header: always fixed and always visible. Transparent over the top of
 * the page, a slim blurred bar once you scroll down, so every section is one
 * tap away from anywhere. The state lives in a data-state attribute written
 * through a ref: no React render per scroll. Without JavaScript the bar is
 * simply the blurred version (noscript style).
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let state = ""
    let raf = 0
    const update = () => {
      raf = 0
      const next = window.scrollY < TOP ? "top" : "shown"
      if (next !== state) el.dataset.state = state = next
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  return (
    <header ref={ref} data-state="top" className="site-header fixed inset-x-0 top-0 z-30 pt-[env(safe-area-inset-top)]">
      <noscript>
        <style>{".site-header{background:hsl(var(--background)/0.7);border-bottom-color:hsl(var(--border));-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}"}</style>
      </noscript>
      {children}
    </header>
  )
}

/** True while the home page's #contact section is on screen. */
function useContactInView(enabled: boolean) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!enabled) {
      setInView(false)
      return
    }
    const target = document.getElementById("contact")
    if (!target) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "-40% 0px -40% 0px" })
    io.observe(target)
    return () => io.disconnect()
  }, [enabled])
  return inView
}

/** Header nav link that marks itself aria-current="page" when it is where you are. */
export function NavLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string
  className?: string
  onClick?: () => void
  children: ReactNode
}) {
  const pathname = usePathname() || "/"
  const isAnchor = href.startsWith("/#")
  const contact = useContactInView(isAnchor && pathname === "/")
  const current = isAnchor ? pathname === "/" && contact : pathname === href || pathname.startsWith(`${href}/`)
  return (
    <Link href={href} className={`nav-link ${className ?? ""}`} aria-current={current ? "page" : undefined} onClick={onClick}>
      {children}
    </Link>
  )
}
