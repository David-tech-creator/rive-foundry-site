import { LegalPage } from "@/components/legal-page"
import { StructuredData } from "@/components/structured-data"
import { SITE, SITE_URL } from "@/lib/site"
import { pageMetadata, simplePageJsonLd } from "@/lib/seo"

/*
 * NOT LEGAL ADVICE. Baseline website terms of use. They cover the website
 * only; any engagement is agreed separately in writing.
 * Have counsel review.
 */

const DESCRIPTION = `The terms for using ${SITE_URL.replace("https://", "")}, the site of ${SITE.name}: acceptable use, intellectual property and liability.`

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: DESCRIPTION,
  path: "/terms",
})

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="2026-10-25">
      <StructuredData data={simplePageJsonLd("/terms", "Terms of Use", DESCRIPTION)} />
      <p>
        These terms govern your use of {SITE_URL}, operated by {SITE.name}, {SITE.city}, {SITE.countryName}. By using
        the site you accept them. If you do not accept them, please do not use the site.
      </p>

      <section>
        <h2>What this site is</h2>
        <p>
          This is the personal website of {SITE.name}. It describes products, ventures and concepts he has built or
          designed. Rive Foundry is the name of his workshop. Nothing on it is an offer of employment, an offer to
          invest or investment advice. Any engagement is governed by
          a separate written agreement, which prevails over anything stated here.
        </p>
      </section>

      <section>
        <h2>Products and links</h2>
        <p>
          Some products described here are private tools, prototypes or concepts that are not available to the public.
          Descriptions are accurate to the best of his knowledge on the date shown above. Links to other sites,
          including his own product sites, are provided for convenience; their own terms apply there.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Submit false or misleading information, or third-party information without authority.</li>
          <li>Attempt to gain unauthorised access to any part of the site or its infrastructure.</li>
          <li>Use the site or its forms to send unsolicited commercial messages, or for any unlawful purpose.</li>
        </ul>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          The text, design and imagery of this site belong to {SITE.name} or are used under licence. You may view,
          quote and share pages with a link back. You may not republish or adapt substantial parts of the site
          commercially without written permission.
        </p>
      </section>

      <section>
        <h2>Availability and accuracy</h2>
        <p>
          The site is provided "as is". It may change, or parts of it may be withdrawn, at any time, and its
          availability is not guaranteed.
        </p>
      </section>

      <section>
        <h2>Liability</h2>
        <p>
          To the fullest extent permitted by Swiss law, there is no liability for indirect or consequential loss, loss
          of profit, or loss of opportunity arising from use of this site. Nothing in these terms limits liability for
          intent or gross negligence, or any other liability that cannot be excluded by law.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These terms are governed by Swiss law. The courts of {SITE.city}, Switzerland have exclusive jurisdiction,
          subject to any mandatory consumer protection rules that give you the right to bring proceedings elsewhere.
        </p>
      </section>
    </LegalPage>
  )
}
