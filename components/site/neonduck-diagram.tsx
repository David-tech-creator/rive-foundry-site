/**
 * How Neonduck fits together, redrawn from the service map on
 * neonduck.io/tech-stack in the site's colours. Shown on /work/neonduck under
 * the story. The flow dashes move slowly; under reduced motion they stand
 * still (globals.css). Services and regions only: no hostnames or accounts.
 */

const W = 1200
const H = 690

const C = {
  box: "var(--surface)",
  line: "rgba(255,255,255,0.14)",
  text: "var(--text)",
  muted: "hsl(var(--muted-foreground))",
  azure: "var(--azure-light)",
}

type BoxProps = { x: number; y: number; w: number; h: number; title: string; sub?: string; accent?: boolean }

function Box({ x, y, w, h, title, sub, accent }: BoxProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={C.box} stroke={accent ? C.azure : C.line} strokeWidth={accent ? 1.5 : 1} />
      <text x={x + 18} y={y + (sub ? h / 2 - 4 : h / 2 + 6)} fill={C.text} fontSize={17}>
        {title}
      </text>
      {sub ? (
        <text x={x + 18} y={y + h / 2 + 18} fill={C.muted} fontSize={13}>
          {sub}
        </text>
      ) : null}
    </g>
  )
}

function Flow({ d }: { d: string }) {
  return (
    <g>
      <path d={d} fill="none" stroke={C.line} strokeWidth={1.5} />
      <path d={d} fill="none" stroke={C.azure} strokeWidth={1.5} strokeDasharray="4 14" className="diagram-flow" />
    </g>
  )
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} fill={C.muted} fontSize={12} letterSpacing="0.16em">
      {children.toUpperCase()}
    </text>
  )
}

// the services behind the central service and behind each customer's machine
const CENTRAL: Array<[string, string]> = [
  ["Claude", "Anthropic"],
  ["Accounts", "Supabase"],
  ["Voice", "OpenAI, Gemini"],
  ["Sign-in mail", "Resend"],
  ["Payments", "Stripe"],
  ["Backups", "Cloudflare R2"],
]
const OWN: Array<[string, string]> = [
  ["Mail, calendar", "Google, Microsoft"],
  ["WhatsApp", "linked device"],
  ["Browser", "Chrome, sandboxed"],
  ["Swiss browser", "Bright Data"],
]

export function NeonduckDiagram() {
  const col = (i: number, x0: number) => x0 + (i % 2) * 200
  const row = (i: number) => 420 + Math.floor(i / 2) * 88
  return (
    <figure className="m-0">
      {/* on phones the diagram keeps a readable size and scrolls sideways in its own frame */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:overflow-visible md:px-0" tabIndex={0} aria-label="Neonduck diagram, scroll sideways on small screens">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="neonduck-diagram-title neonduck-diagram-desc"
          className="h-auto w-full min-w-[760px] md:min-w-0"
          style={{ fontFamily: "inherit" }}
        >
          <title id="neonduck-diagram-title">How Neonduck fits together</title>
          <desc id="neonduck-diagram-desc">
            The customer reaches Neonduck through Cloudflare and Fly.io. Each customer has their own machine on Fly.io in
            Frankfurt, which holds their mail and calendar connection, a linked WhatsApp, a sandboxed Chrome and a Swiss
            browser for the shops and sites it uses. A central service, also in Frankfurt, handles accounts, sign-in mail,
            payments and backups, and passes the thinking on to Claude with the key added there, and voice to OpenAI or
            Gemini.
          </desc>

          <Box x={500} y={20} w={200} h={64} title="You" sub="phone or computer" />
          <Box x={420} y={140} w={360} h={64} title="Cloudflare and Fly.io" sub="address and front door" />

          <Label x={150} y={262}>
            Run by Neonduck
          </Label>
          <Box x={150} y={280} w={380} h={80} title="neonduck.io" sub="central service, Fly.io in Frankfurt" />
          <Label x={670} y={262}>
            One per customer
          </Label>
          <Box x={670} y={280} w={380} h={80} title="Your Neonduck" sub="your own machine, Fly.io in Frankfurt" accent />

          {CENTRAL.map(([t, s], i) => (
            <Box key={t} x={col(i, 150)} y={row(i)} w={180} h={64} title={t} sub={s} />
          ))}
          {OWN.map(([t, s], i) => (
            <Box key={t} x={col(i, 670)} y={row(i)} w={180} h={64} title={t} sub={s} />
          ))}
          <Box x={670} y={596} w={380} h={64} title="Websites" sub="shops, SBB, the whole web" />

          {/* you, through the front door, to your own machine and the central service */}
          <Flow d="M600 84 L600 140" />
          <Flow d="M520 204 C 520 244, 460 244, 460 280" />
          <Flow d="M680 204 C 680 244, 960 244, 960 280" />
          {/* your machine asks the central service for the thinking */}
          <Flow d="M670 320 L530 320" />
          {/* the central service and its providers */}
          <Flow d="M240 360 L240 420" />
          <Flow d="M440 360 L440 420" />
          {/* your machine and what it works with */}
          <Flow d="M760 360 L760 420" />
          <Flow d="M960 360 L960 420" />
          {/* the browsers open the websites */}
          <Flow d="M760 572 L760 596" />
          <Flow d="M960 572 L960 596" />
        </svg>
      </div>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        How Neonduck fits together. Each customer gets their own machine. The thinking goes through the central service
        to Claude, with the key added there, so no customer machine holds a provider key. Redrawn from the service map on
        neonduck.io.
        <span className="md:hidden"> Swipe sideways to see all of it.</span>
      </figcaption>
    </figure>
  )
}
