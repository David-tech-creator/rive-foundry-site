import type React from "react"
import { RootShell } from "@/components/root-shell"

export { metadata, viewport } from "@/components/root-shell"

export default function FrenchRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="fr">{children}</RootShell>
}
