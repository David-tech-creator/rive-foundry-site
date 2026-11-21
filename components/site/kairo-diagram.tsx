/**
 * Architecture of Kairo, drawn as an inline SVG in the site's colours, in the
 * same style as the Dbrain diagram. Shown under the hero on /work/kairo.
 * Architecture level only: no hostnames, device names, accounts or people.
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

const NEIGHBOURS: Array<[string, string]> = [
  ["Dbrain", "my memory, over MCP"],
  ["WhatsApp bridges", "personal and business"],
  ["Health", "watch, phone and Strava"],
  ["Phone calls", "from my number"],
]

const CLOUD: Array<[string, string]> = [
  ["Claude", "my own subscription"],
  ["OpenAI", "voice, dictation, pictures"],
  ["Gemini Live", "the other voice"],
]

export function KairoDiagram() {
  return (
    <figure className="m-0">
      {/* on phones the diagram keeps a readable size and scrolls sideways in its own frame */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:overflow-visible md:px-0" tabIndex={0} aria-label="Kairo diagram, scroll sideways on small screens">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="kairo-diagram-title kairo-diagram-desc"
          className="h-auto w-full min-w-[760px] md:min-w-0"
          style={{ fontFamily: "inherit" }}
        >
          <title id="kairo-diagram-title">How Kairo is set up</title>
          <desc id="kairo-diagram-desc">
            The iPhone app, the Apple Watch app and the web app reach a home server only through a signed-in tunnel. On that server the
            Kairo server runs the Claude Agent SDK, with approval cards, a wall between personal and business, a
            SQLite database, its own browser, a scheduler and a daily clean-up. Next to it on the same server are
            Dbrain, two WhatsApp bridges, health services and phone calls. Claude, OpenAI and Gemini Live are reached
            in the cloud. Notifications go back out to the phone, the watch and the Mac.
          </desc>

          {/* my devices */}
          <Label x={40} y={60}>
            My phone, watch and Mac
          </Label>
          <Box x={40} y={84} w={200} h={84} title="iPhone app" sub="native, Lock Screen, voice" accent />
          <Box x={40} y={196} w={200} h={64} title="Web app" sub="Home Screen or browser" />
          <Box x={40} y={288} w={200} h={64} title="Notifications" sub="who wrote, which account" />
          <Box x={40} y={380} w={200} h={64} title="Apple Watch" sub="talk over cellular" />

          {/* the tunnel */}
          <Box x={270} y={84} w={120} h={84} title="Tunnel" sub="signed in only" />

          {/* the home server */}
          <rect x={420} y={40} width={420} height={680} rx={16} fill="none" stroke={C.line} strokeDasharray="6 6" />
          <Label x={444} y={74}>
            Home server, Docker
          </Label>
          <Box x={450} y={100} w={360} h={96} title="Kairo server" sub="Node.js and the Claude Agent SDK" accent />
          <Box x={450} y={230} w={170} h={64} title="Approval cards" sub="send, pay, call" />
          <Box x={640} y={230} w={170} h={64} title="Spaces wall" sub="personal | business" />
          <Box x={450} y={330} w={170} h={64} title="SQLite" sub="chats, meals, goals" />
          <Box x={640} y={330} w={170} h={64} title="Its own browser" sub="I can take over" />
          <Box x={450} y={430} w={360} h={64} title="Scheduler" sub="briefings, the paper, meeting briefs" />
          <Box x={450} y={530} w={360} h={56} title="Daily clean-up" />
          <Box x={450} y={620} w={360} h={56} title="Backed up every night" />

          {/* neighbours on the same server */}
          <Label x={870} y={60}>
            Next door, same server
          </Label>
          {NEIGHBOURS.map(([t, s], i) => (
            <Box key={t} x={870} y={84 + i * 86} w={300} h={64} title={t} sub={s} />
          ))}

          {/* the cloud */}
          <Label x={870} y={460}>
            In the cloud
          </Label>
          {CLOUD.map(([t, s], i) => (
            <Box key={t} x={870} y={484 + i * 86} w={300} h={64} title={t} sub={s} />
          ))}

          {/* devices through the tunnel to the server */}
          <Flow d="M240 126 L270 126" />
          <Flow d="M240 228 C 255 228, 255 140, 270 140" />
          <Flow d="M390 126 C 420 126, 420 148, 450 148" />
          {/* the watch talks to Kairo on its own */}
          <Flow d="M240 412 C 360 412, 360 300, 360 168" />
          {/* notifications come back out */}
          <Flow d="M330 168 C 330 320, 290 320, 240 320" />
          {/* inside the server */}
          <Flow d="M535 196 L535 230" />
          <Flow d="M725 196 L725 230" />
          <Flow d="M535 294 L535 330" />
          <Flow d="M725 294 L725 330" />
          <Flow d="M630 394 L630 430" />
          {/* out to the neighbours */}
          {NEIGHBOURS.map(([t], i) => (
            <Flow key={t} d={`M810 ${130 + i * 6} C 840 ${130 + i * 6}, 840 ${116 + i * 86}, 870 ${116 + i * 86}`} />
          ))}
          {/* out to the cloud */}
          {CLOUD.map(([t], i) => (
            <Flow key={t} d={`M810 ${170 + i * 8} C 845 ${170 + i * 8}, 835 ${516 + i * 86}, 870 ${516 + i * 86}`} />
          ))}
        </svg>
      </div>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        How Kairo is set up. It all runs on one server in my flat, only reachable through a signed-in tunnel.
        <span className="md:hidden"> Swipe sideways to see all of it.</span>
      </figcaption>
    </figure>
  )
}
