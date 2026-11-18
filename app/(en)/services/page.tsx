import { ServicesHubView } from "@/components/site/service-view"
import { pageMetadata } from "@/lib/seo"
import { HUB_COPY, SERVICES_PATH } from "@/lib/services"

export const metadata = pageMetadata({
  title: HUB_COPY.en.title,
  description: HUB_COPY.en.description,
  path: SERVICES_PATH.en,
  languages: SERVICES_PATH,
})

export default function ServicesPage() {
  return <ServicesHubView lang="en" />
}
