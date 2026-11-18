import { ServicesHubView } from "@/components/site/service-view"
import { pageMetadata } from "@/lib/seo"
import { HUB_COPY, SERVICES_PATH } from "@/lib/services"

export const metadata = pageMetadata({
  absoluteTitle: HUB_COPY.fr.title,
  description: HUB_COPY.fr.description,
  path: SERVICES_PATH.fr,
  lang: "fr",
  languages: SERVICES_PATH,
})

export default function FrenchHubPage() {
  return <ServicesHubView lang="fr" />
}
