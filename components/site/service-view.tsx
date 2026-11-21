import Link from "next/link"
import { ContactForm } from "@/components/contact-form"
import { StructuredData } from "@/components/structured-data"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { getProduct } from "@/lib/graph"
import { servicePageJsonLd, servicesHubJsonLd, workPath } from "@/lib/seo"
import { ELSEWHERE, HUB_COPY, SERVICES, SERVICES_PATH, UI, type Lang, type Service } from "@/lib/services"
import { CONTACT_EMAIL } from "@/lib/site"

function Crumbs({ lang, current, parent }: { lang: Lang; current: string; parent?: { href: string; label: string } }) {
  const ui = UI[lang]
  return (
    <nav aria-label="Breadcrumb" className="kicker">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="link-quiet tap">
            {ui.home}
          </Link>
        </li>
        {parent ? (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={parent.href} className="link-quiet tap">
                {parent.label}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden="true">/</li>
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  )
}


function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-20 md:mt-28">
      <div className="hairline grid gap-10 pt-8 md:grid-cols-12">
        <h2 id={id} className="text-3xl md:col-span-4 md:text-4xl">
          {title}
        </h2>
        <div className="md:col-span-7 md:col-start-6">{children}</div>
      </div>
    </section>
  )
}

function Contact({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  return (
    <section id="contact" aria-labelledby="svc-contact" className="mt-20 md:mt-28">
      <div className="hairline grid gap-10 pt-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 id="svc-contact" className="text-3xl md:text-4xl">
            {ui.contact}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {ui.contactLead}{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link-line text-text">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <div className="border border-line p-6 md:col-span-7 md:col-start-6 md:p-10">
          <ContactForm source="services" lang={lang} />
        </div>
      </div>
    </section>
  )
}

/** One offer: what it is, examples, how it runs, proof from /work, questions, contact. */
export function ServiceView({ service, lang }: { service: Service; lang: Lang }) {
  const c = service.copy[lang]
  const ui = UI[lang]
  const others = SERVICES.filter((s) => s.id !== service.id)
  return (
    <>
      <StructuredData data={servicePageJsonLd(service, lang)} />
      <SiteHeader />
      <main id="main" lang={lang} className="pb-24 pt-36 md:pt-44">
        <article className="wrap">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Crumbs lang={lang} current={c.short} parent={{ href: SERVICES_PATH[lang], label: ui.services }} />
          </div>

          <h1 className="mt-8 max-w-4xl text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[0.98]">{c.h1}</h1>
          <p className="mt-8 max-w-2xl text-xl leading-snug text-text md:text-2xl">{c.lead}</p>

          <Section id="svc-examples" title={ui.examples}>
            <ul className="list-disc space-y-3 pl-5 text-lg leading-relaxed text-muted-foreground marker:text-azure-light">
              {c.examples.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Section>

          <Section id="svc-how" title={ui.how}>
            <ol className="grid gap-8">
              {c.steps.map((st, i) => (
                <li key={st.title} className="grid grid-cols-[2.5rem_1fr] gap-2">
                  <span className="kicker pt-1.5 text-azure-light">0{i + 1}</span>
                  <span>
                    <span className="block text-xl text-text md:text-2xl">{st.title}</span>
                    <span className="mt-2 block text-lg leading-relaxed text-muted-foreground">{st.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="svc-proof" title={ui.proof}>
            <ul className="grid gap-6">
              {c.proof.map((p) => {
                const product = getProduct(p.slug)
                if (!product) return null
                return (
                  <li key={p.slug}>
                    <Link href={workPath(p.slug)} className="link-quiet tap text-xl text-text md:text-2xl">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-lg leading-relaxed text-muted-foreground">{p.line}</p>
                  </li>
                )
              })}
            </ul>
          </Section>

          <Section id="svc-good" title={ui.good}>
            <ul className="grid gap-4 text-lg leading-relaxed text-muted-foreground">
              {c.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Section>

          <Section id="svc-faq" title={ui.faq}>
            <dl className="grid gap-8">
              {c.faq.map((f) => (
                <div key={f.q}>
                  <dt className="text-xl text-text">{f.q}</dt>
                  <dd className="mt-2 text-lg leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Contact lang={lang} />

          <nav aria-labelledby="svc-other" className="mt-20 md:mt-28">
            <div className="hairline pt-8">
              <h2 id="svc-other" className="kicker">
                {ui.other}
              </h2>
              <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {others.map((s) => (
                  <li key={s.id}>
                    <Link href={s.path[lang]} className="link-quiet tap text-lg text-text">
                      {s.copy[lang].short}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}

/** /services: every offer with a short lead, plus where else to go. */
export function ServicesHubView({ lang }: { lang: Lang }) {
  const hub = HUB_COPY[lang]
  const ui = UI[lang]
  return (
    <>
      <StructuredData data={servicesHubJsonLd(lang)} />
      <SiteHeader />
      <main id="main" lang={lang} className="pb-24 pt-36 md:pt-44">
        <div className="wrap">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Crumbs lang={lang} current={ui.services} />
          </div>

          <p className="kicker mt-10">{hub.kicker}</p>
          <h1 className="mt-4 max-w-4xl text-[clamp(3rem,8vw,6.5rem)] leading-[0.95]">{hub.h1}</h1>
          <p className="mt-8 max-w-2xl text-xl leading-snug text-text md:text-2xl">{hub.lead}</p>

          <ul className="hairline mt-16 divide-y divide-line md:mt-24">
            {SERVICES.map((s) => {
              const c = s.copy[lang]
              return (
                <li key={s.id}>
                  <Link href={s.path[lang]} className="group grid gap-3 py-8 md:grid-cols-12 md:gap-10">
                    <h2 className="text-2xl text-text transition-colors group-hover:text-azure-light md:col-span-5 md:text-3xl">
                      {c.short}
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground md:col-span-7">{c.description}</p>
                  </Link>
                </li>
              )
            })}
          </ul>

          <section aria-labelledby="hub-else" className="mt-20 md:mt-28">
            <div className="hairline grid gap-10 pt-8 md:grid-cols-12">
              <h2 id="hub-else" className="text-3xl md:col-span-4 md:text-4xl">
                {ui.elsewhere}
              </h2>
              <ul className="grid gap-8 md:col-span-7 md:col-start-6">
                {ELSEWHERE[lang].map((e) => (
                  <li key={e.title}>
                    <h3 className="text-xl text-text md:text-2xl">{e.title}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-muted-foreground">
                      {e.body}{" "}
                      <Link href={e.href} className="link-line text-text">
                        {e.label}
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Contact lang={lang} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
