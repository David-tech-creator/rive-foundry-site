/**
 * Architecture of Dbrain, drawn as an inline SVG in the site's colours. Used
 * as the hero on /work/dbrain instead of a film. The flow dashes move slowly
 * along the connectors; under reduced motion they stand still (globals.css).
 * Architecture level only: no hostnames, device names or accounts.
 */

const W = 1200
const H = 760

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

export function DbrainDiagram() {
  const sources = ["Mail", "Chats", "Calendar", "Reading list", "Photos"]
  return (
    <figure className="m-0">
      {/* on phones the diagram keeps a readable size and scrolls sideways in its own frame */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:overflow-visible md:px-0" tabIndex={0} aria-label="Dbrain diagram, scroll sideways on small screens">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-labelledby="dbrain-diagram-title dbrain-diagram-desc"
        className="h-auto w-full min-w-[760px] md:min-w-0"
        style={{ fontFamily: "inherit" }}
      >
        <title id="dbrain-diagram-title">How Dbrain is set up</title>
        <desc id="dbrain-diagram-desc">
          Mail, chats, calendar, a reading list and photos flow into an ingest loop on a home server, which stores
          every record word for word in Postgres, with personal and business data kept apart. A tool server exposes
          search and memory over MCP. Claude and Neonduck reach it only through an authenticated tunnel. Lightbox and
          other services run in the same stack, with nightly backups and a weekly restore test.
        </desc>

        {/* sources */}
        <Label x={40} y={60}>
          My data
        </Label>
        {sources.map((s, i) => (
          <Box key={s} x={40} y={84 + i * 92} w={190} h={64} title={s} />
        ))}

        {/* the home server */}
        <rect x={300} y={40} width={560} height={680} rx={16} fill="none" stroke={C.line} strokeDasharray="6 6" />
        <Label x={324} y={74}>
          Home server, Docker
        </Label>
        <Box x={330} y={100} w={240} h={84} title="Ingest loop" sub="every 30 minutes, no AI" />
        <rect x={330} y={240} width={500} height={110} rx={10} fill={C.box} stroke={C.azure} strokeWidth={1.5} />
        <text x={348} y={270} fill={C.text} fontSize={17}>
          Postgres
        </text>
        <text x={348} y={290} fill={C.muted} fontSize={13}>
          every record word for word
        </text>
        <rect x={350} y={306} width={140} height={30} rx={6} fill="none" stroke={C.line} />
        <text x={364} y={326} fill={C.muted} fontSize={12}>
          personal
        </text>
        <rect x={502} y={306} width={140} height={30} rx={6} fill="none" stroke={C.line} />
        <text x={516} y={326} fill={C.muted} fontSize={12}>
          business
        </text>
        <rect x={654} y={306} width={156} height={30} rx={6} fill="none" stroke={C.line} />
        <text x={668} y={326} fill={C.muted} fontSize={12}>
          things to remember
        </text>
        <Box x={590} y={100} w={240} h={84} title="Tool server" sub="search and memory over MCP" accent />
        <Box x={330} y={410} w={240} h={84} title="Lightbox" sub="photo sorting" />
        <Box x={590} y={410} w={240} h={84} title="Phone calls" sub="Twilio and OpenAI Realtime" />
        <Box x={330} y={540} w={500} h={74} title="More services" sub="messaging, smart home, fitness, expenses, a browser" />
        <Box x={330} y={640} w={500} h={56} title="Backups every night, restore tested every week" />

        {/* tunnel and clients */}
        <Box x={900} y={100} w={130} h={84} title="Tunnel" sub="signed in only" />
        <Label x={1060} y={74}>
          Uses it
        </Label>
        <Box x={1060} y={100} w={110} h={64} title="Claude" />
        <Box x={1060} y={190} w={110} h={64} title="Neonduck" />

        {/* flows: sources into the ingest loop */}
        {sources.map((s, i) => (
          <Flow key={s} d={`M230 ${116 + i * 92} C 280 ${116 + i * 92}, 280 142, 330 142`} />
        ))}
        {/* ingest into postgres, postgres to the tool server */}
        <Flow d="M450 184 L450 240" />
        <Flow d="M710 240 L710 184" />
        {/* lightbox and services read and write the same store */}
        <Flow d="M450 410 L450 350" />
        <Flow d="M710 410 L710 350" />
        {/* tool server out through the tunnel to the clients */}
        <Flow d="M830 142 L900 142" />
        <Flow d="M1030 132 L1060 132" />
        <Flow d="M1030 152 C 1045 152, 1045 222, 1060 222" />
      </svg>
      </div>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        How Dbrain is set up. Everything runs on one home server and is only reachable through a signed-in tunnel.
        <span className="md:hidden"> Swipe sideways to see all of it.</span>
      </figcaption>
    </figure>
  )
}
