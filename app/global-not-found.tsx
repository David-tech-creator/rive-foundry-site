import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page not found | David Vinkenroye",
  description: "This page does not exist. Go to the home page or the work of David Vinkenroye.",
  robots: { index: false, follow: true },
}
import { RootShell } from "@/components/root-shell"
import { NotFoundBody } from "@/components/site/not-found-body"

/** URLs that match no route at all (two root layouts, so no app/not-found.tsx). */
export default function GlobalNotFound() {
  return (
    <RootShell lang="en">
      <NotFoundBody />
    </RootShell>
  )
}
