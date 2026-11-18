import type { Metadata } from "next"
import { NotFoundBody } from "@/components/site/not-found-body"

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Go to the home page or the work of David Vinkenroye.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundBody />
}
