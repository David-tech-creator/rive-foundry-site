import { LegalPage } from "@/components/legal-page"
import { StructuredData } from "@/components/structured-data"
import { SITE, SITE_URL } from "@/lib/site"
import { pageMetadata, simplePageJsonLd } from "@/lib/seo"

/*
 * NOT LEGAL ADVICE. A good-faith baseline covering the Swiss FADP (revDSG)
 * and the GDPR for EU visitors, written to match what the site actually does:
 * one contact form, cookieless analytics, no tracking cookies. Have counsel
 * review it, and update it whenever data handling changes.
 */

const DESCRIPTION = `How ${SITE.name} collects, uses and protects personal data sent through ${SITE_URL.replace("https://", "")}, and your rights under Swiss and EU data protection law.`

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: DESCRIPTION,
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="2026-11-17">
      <StructuredData data={simplePageJsonLd("/privacy", "Privacy Policy", DESCRIPTION)} />
      <p>
        This website, {SITE_URL}, is operated by {SITE.name}, {SITE.city}, {SITE.countryName} ("I", "me"). It is my
        personal site; Rive Foundry is the name of my workshop. I am the controller of the personal data collected
        through it. This page explains what I collect, why, how
        long I keep it and what rights you have.
      </p>

      <section>
        <h2>What I collect</h2>
        <p>Only what you actively send, plus aggregate usage statistics.</p>
        <ul>
          <li>
            <strong>Contact forms.</strong> Your name, email address, the topic you choose and anything you write in
            the message field.
          </li>
          <li>
            <strong>Newsletter.</strong> Your email address, once you have confirmed it through the link I send. I use
            it only to email you new Frontier posts. Every email has an unsubscribe link, and unsubscribing stops them
            straight away.
          </li>
          <li>
            <strong>Aggregate usage data.</strong> Page views, referrer, approximate country, device type and
            performance timings, collected in a cookieless and anonymised form. No advertising profiles are built and
            no data is sold.
          </li>
          <li>
            <strong>Technical logs.</strong> The hosting provider records IP address and request metadata for
            security, abuse prevention and rate limiting.
          </li>
        </ul>
        <p>
          The site uses no tracking cookies, advertising pixels or cross-site trackers. It does not knowingly collect
          data from anyone under 16.
        </p>
      </section>

      <section>
        <h2>Why I use it, and on what basis</h2>
        <ul>
          <li>
            <strong>To reply to you</strong>, on the basis of steps taken at your request and your consent in sending
            the form.
          </li>
          <li>
            <strong>To keep the site working and secure</strong>, on the basis of a legitimate interest in preventing
            abuse and improving the site.
          </li>
          <li>
            <strong>To email you new Frontier posts</strong>, on the basis of your consent, given through the
            confirmation link. You can withdraw it at any time with the unsubscribe link in every email.
          </li>
        </ul>
      </section>

      <section>
        <h2>Who it is shared with</h2>
        <p>
          A small number of processors run the site: a hosting and analytics provider, and an email delivery provider
          that forwards form submissions and sends the newsletter. They process data on my instructions only. Some are located outside
          Switzerland and the EEA; where that is the case, transfers are covered by standard contractual clauses or an
          equivalent safeguard.
        </p>
      </section>

      <section>
        <h2>How long I keep it</h2>
        <p>
          Messages are kept as long as needed to deal with them. Newsletter addresses are kept until you unsubscribe, then deleted. Aggregate analytics are kept in anonymised form. Ask for your data to be deleted at
          any time and it will be, unless the law requires keeping it.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Under the Swiss Federal Act on Data Protection and, if you are in the EU or EEA, the GDPR, you can ask for a
          copy of your data, ask for it to be corrected or deleted, object to or restrict its use, ask for it in a
          portable format, and withdraw consent at any time. Withdrawing consent does not affect processing already
          carried out.
        </p>
        <p>
          Use the <a href="/#contact">contact form</a> to exercise any of these. You will get a reply within 30 days.
          If you are not satisfied you can complain to the Swiss Federal Data Protection and Information Commissioner
          (FDPIC), or to your local supervisory authority in the EU.
        </p>
      </section>

      <section>
        <h2>Security and changes</h2>
        <p>
          The site is served over HTTPS and access to submissions is limited. No system is perfectly secure, but
          reasonable technical and organisational measures protect your data. If this policy changes, the date at the
          top of this page changes with it.
        </p>
      </section>
    </LegalPage>
  )
}
