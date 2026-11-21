// Kairo: how it is set up, in detail. Shown on /work/kairo under the story.
// Architecture level only: no contact names, work names, hostnames or anything from real chats.

const PARTS: Array<{ title: string; body: string[] }> = [
  {
    title: "The brain",
    body: [
      "Every chat is one live Claude session through the Claude Agent SDK, on my own Claude subscription, so it works the way Claude Code does: it plans, uses tools, reads files and keeps going until the job is done. Sonnet does the everyday work, and I can switch a chat to Opus when it needs more thought. A subscription login is only for its owner, which is exactly why Kairo stays a tool for one person and Neonduck is the version for other people.",
      "It gets its tools from three places: Dbrain, my self-hosted memory, straight over MCP on the home network; the connectors on my Claude account for mail, calendar and documents; and a set of its own, for pictures, phone calls, goals and the day board.",
    ],
  },
  {
    title: "Where it runs",
    body: [
      "One Docker container on the NAS in my flat, a Node.js server with no build step, and one SQLite file that holds every chat, meal and goal. The outside world only reaches it through a Cloudflare tunnel with a login. One deploy script ships a new version and checks that it came up, and the database goes into Dbrain's backup every night, where a restore is tested every week.",
    ],
  },
  {
    title: "Asking before it acts",
    body: [
      "Reading is free. Changing something shows an approval card, and anything that sends, deletes, pays or calls asks every single time: I can never tick \"always allow\" for those. Jobs that run while I sleep, like the morning briefing, may only read.",
      "Personal and business are two spaces with a wall between them. Every chat, draft and memory belongs to one side, and every tool call is checked against the chat's own side before it runs, so a business mail can't go out from my personal account. Saved passwords and my card are encrypted, and Kairo types them into a form without the model ever seeing them.",
    ],
  },
  {
    title: "WhatsApp",
    body: [
      "Two small bridges run next to Kairo on the same server, one for my personal number and one for WhatsApp Business. Kairo reads their chats and gets every new message the moment it arrives, so the WhatsApp page is live: groups, photos, voice notes with transcripts, replies and reactions. Opening a chat in Kairo doesn't send a read receipt; that only happens when I answer.",
      "For dictation, my voice is transcribed first, then Claude writes out the message I meant, using my own earlier messages in that chat as its style guide. For drafts, it reads the last part of the conversation and writes the next message as me. Both only fill the box. Nothing leaves until I tap Send.",
      "Notifications go out as web push. Messages that arrive together in one chat become one notification, which replaces the previous one, and muted chats, my own messages and the chat I'm reading stay quiet.",
    ],
  },
  {
    title: "Voice",
    body: [
      "Voice mode is a realtime model doing the talking, OpenAI or Gemini Live, and handing every real question to the chat's Claude session. In the iPhone app the call runs natively over WebRTC with background audio, so I can lock the screen, put the phone in my pocket and keep talking. Approvals still need a tap, voice or no voice.",
      "The orb you talk to is a drop of glass rendered live: Metal in the app, WebGL in the browser, at 60 frames a second, moving with my voice and with Kairo's.",
    ],
  },
  {
    title: "Health",
    body: [
      "I take a photo of my plate. Claude only names the foods and guesses the grams; every calorie and macro then comes from the Swiss Food Composition Database or, for anything with a barcode, Open Food Facts. A model never makes up a nutrition number. Steps, sleep, weight and calories burned come from my watch and my phone through services in Dbrain, and runs from Strava.",
    ],
  },
  {
    title: "The iPhone app",
    body: [
      "A SwiftUI app around the web app, with native parts where they matter: Face ID when it opens, the voice screen, the camera and mic, the share sheet, haptics and Apple's Liquid Glass on the controls. A new server version changes the app at once, without a new install. I install it on my own phone from Xcode, so it never went near the App Store.",
    ],
  },
  {
    title: "Housekeeping",
    body: [
      "Kairo cleans up after itself once a day. Morning and evening briefings go after a week, the morning paper and meeting briefs after two weeks, the weekly wrap after a month, and empty chats after a day. My own conversations, memories, goals and meals are never touched.",
    ],
  },
]

export function KairoSection() {
  return (
    <section aria-labelledby="kairo-setup-title" className="mt-20">
      <h2 id="kairo-setup-title" className="kicker">
        How I set it up
      </h2>
      <div className="mt-6 space-y-12">
        {PARTS.map((part) => (
          <div key={part.title}>
            <h3 className="text-xl font-medium text-text md:text-2xl">{part.title}</h3>
            <div className="mt-4 space-y-4 text-lg leading-relaxed text-text/90">
              {part.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        Runs on Node.js, the Claude Agent SDK with Claude Sonnet and Opus, SQLite, Playwright, OpenAI and Gemini Live
        for voice, Swift and Metal on the iPhone, Docker on a home NAS, and Dbrain for memory. Single user, started
        October 2026. Kairo is private, so there is nothing to link to.
      </p>
    </section>
  )
}
