import Link from "next/link"
import { Magnetic } from "@/components/motion"
import { HelmetMark } from "./helmet-mark"
import { MobileMenu } from "./mobile-menu"
import { HeaderShell, NavLink } from "./header-shell"

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/rive-foundry", label: "Rive Foundry" },
  { href: "/logbook", label: "Logbook" },
  { href: "/#contact", label: "Contact" },
]

/**
 * Site header. Fixed, but it keeps out of the way: transparent over the top
 * of the page, then a slim blurred bar that slides away while you read down
 * and comes back the moment you scroll up (HeaderShell). The phone menu is a
 * <details> element, so it opens without JavaScript (see MobileMenu).
 */
export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="header-bar wrap flex items-center justify-between">
        <Link href="/" className="group flex min-h-11 items-center gap-2.5 text-[15px] font-normal tracking-tight text-text">
          <HelmetMark className="h-4 w-4 text-azure transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:-rotate-6" />
          <span>David Vinkenroye</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Magnetic strength={0.25}>
                  <NavLink href={item.href} className="link-quiet tap inline-block py-2">
                    {item.label}
                  </NavLink>
                </Magnetic>
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu items={NAV} />
      </div>
    </HeaderShell>
  )
}
