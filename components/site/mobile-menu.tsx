"use client"

import { NavLink } from "./header-shell"
import { useEffect, useRef } from "react"

type Item = { href: string; label: string }

/**
 * Phone menu. Still a <details> element, so it opens without JavaScript; once
 * hydrated it also closes on a tap outside, on Escape and after picking a link
 * (same-page links like /#contact would otherwise leave it open over the page).
 */
export function MobileMenu({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const close = () => {
      if (el.open) el.open = false
    }
    const onPointer = (e: PointerEvent) => {
      if (el.open && !el.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && el.open) {
        close()
        el.querySelector("summary")?.focus()
      }
    }
    // keyboard focus leaving the open menu closes it, so it never covers what has focus.
    // Only when focus lands somewhere: Safari does not focus a tapped link, so a tap
    // on a menu item blurs the summary to nothing, and closing then hid the link
    // before its click arrived (the menu items did nothing on iPhones).
    const onFocusOut = (e: FocusEvent) => {
      const to = e.relatedTarget as Node | null
      if (el.open && to && !el.contains(to)) close()
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    el.addEventListener("focusout", onFocusOut)
    return () => {
      el.removeEventListener("focusout", onFocusOut)
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <details ref={ref} className="group relative md:hidden">
      <summary className="-mr-2 flex h-11 min-w-11 cursor-pointer list-none items-center justify-center px-2 text-sm text-muted-foreground [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Menu</span>
        <span className="hidden group-open:inline">Close</span>
      </summary>
      <nav aria-label="Main" className="absolute right-0 top-12 w-[min(16rem,calc(100vw-2rem))] border border-line bg-ink px-5 py-3">
        <ul className="flex flex-col text-base">
          {items.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                className="link-quiet flex min-h-11 items-center py-1"
                onClick={() => {
                  if (ref.current) ref.current.open = false
                }}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
