// Daffy: David's private assistant, shown as a section on the Neonduck page.
// Keep it free of contact names, work names, hostnames and anything from real chats.

const FEATURES: [string, string][] = [
  ["WhatsApp inside Daffy", "My personal and work WhatsApp, live: every chat and group, photos, voice notes with transcripts, replies and reactions. People don't message Daffy; I use Daffy to read and answer my own WhatsApp."],
  ["Dictation that writes what I meant", "I speak, and Daffy writes the message I meant to send: the ums and false starts gone, my corrections applied, in the language I spoke and the tone I use in that chat. I check it, or tap once to see my raw words."],
  ["Draft with Daffy", "A reply in my voice, written from the conversation. It only fills the box; nothing goes out until I tap Send."],
  ["Phone calls", "Daffy can ring a restaurant, a doctor's office or a shop from my number after one approval, and posts the outcome and the transcript back."],
  ["Voice mode", "A live spoken conversation that hands the real work to Claude."],
  ["Morning briefings", "A list of what needs doing, with one-tap actions: draft the reply, send the wish, book it."],
  ["Two spaces", "Personal and work, with a hard wall between them. Every mailbox, WhatsApp account, tool call and memory belongs to one side."],
  ["Health", "Meals from a photo, plus steps, sleep, weight and calories from my watch and phone."],
  ["Its own browser", "A browser Daffy works in, which I can watch live and take over."],
  ["Three moods", "Screwball, the full character; Quackbuster, serious; and Rubber Duck, which only asks questions while I think aloud."],
  ["An iPhone app", "New and still in progress: Daffy with a Face ID lock, a share sheet and the camera and mic. It lives on my own phone, not in the App Store."],
]

export function DaffySection() {
  return (
    <section aria-labelledby="daffy-title" className="mt-20">
      <h2 id="daffy-title" className="kicker">
        Daffy, the one I keep for myself
      </h2>
      <div className="mt-6 space-y-6 text-lg leading-relaxed text-text/90 md:text-xl md:leading-relaxed">
        <p>
          Neonduck is the assistant I am opening up to other people. Daffy is the one built for me alone: my own look and feel on top of Claude, running on my own Claude subscription through the Claude Agent SDK, in a container on the NAS at home. It looks things up in Dbrain, my self-hosted memory, before it answers, and files new facts back there.
        </p>
        <p>
          The newest part is WhatsApp. I was sick of the iPhone&apos;s dictation getting my messages wrong, so I plugged WhatsApp into my own AI instead. Now I talk, and what lands in the chat is what I meant to say. Reading is free; anything that sends, deletes, pays or calls asks me first, every time.
        </p>
      </div>
      <dl className="mt-10 divide-y divide-line border-y border-line">
        {FEATURES.map(([k, v]) => (
          <div key={k} className="grid gap-2 py-4 md:grid-cols-[14rem_1fr] md:gap-8">
            <dt className="font-medium text-text">{k}</dt>
            <dd className="text-text/80">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">
        Runs on Node.js, the Claude Agent SDK with Claude Sonnet 5.5, SQLite, Playwright, Gemini Live and OpenAI for voice, Docker on a home NAS, and Dbrain for memory. Single user, started October 2026. Daffy is private, so there is nothing to link to.
      </p>
    </section>
  )
}
