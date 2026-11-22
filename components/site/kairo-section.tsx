// Kairo: how it is set up, in detail. Shown on /work/kairo under the story.
// Architecture level only: no contact names, work names, hostnames or anything from real chats.

const PARTS: Array<{ title: string; body: string[] }> = [
  {
    title: "The brain",
    body: [
      "Every chat is one live Claude session through the Claude Agent SDK, on my own Claude subscription, so it works the way Claude Code does: it plans, uses tools and reads files by itself. Sonnet does the everyday work, and I can switch a chat to Opus when it needs more thought. A subscription login is only for its owner, which is exactly why Kairo stays a tool for one person and Neonduck is the version for other people.",
      "It gets its tools from three places: Dbrain, straight over MCP on the home network; the connectors on my Claude account for mail, calendar and documents; and a set of its own, for pictures, phone calls, goals and the day board.",
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
      "Reading is free. Changing something shows an approval card, which I can allow once, for one chat or for good. Anything that sends, deletes, pays or calls asks every single time: I can never tick \"always allow\" for those. Jobs that run while I sleep, like the morning briefing, may only read. An approval also arrives as a time-sensitive notification, and it still needs a tap, voice or no voice.",
      "The two spaces are a wall in the server. Every chat, draft and memory belongs to one side, and every tool call is checked against the chat's own side before it runs, so a business mail can't go out from my personal account.",
    ],
  },
  {
    title: "WhatsApp",
    body: [
      "Two small bridges run next to Kairo on the same server, one for my personal number and one for WhatsApp Business. Kairo reads their chats and gets every new message the moment it arrives, which is what keeps the page live. Opening a chat marks it read on WhatsApp itself, and so do messages that arrive while it is open.",
      "For dictation, the app streams my voice as small audio frames over a WebSocket to Kairo, which relays them to OpenAI's realtime transcription, so the OpenAI key never leaves my server. Before it starts, Kairo reads the chat's recent messages and, when one language clearly leads, tells the transcriber to expect it; otherwise OpenAI detects it. As soon as the words settle, they go to the fast model for the tidy.",
      "Kairo in a chat is an ordinary Kairo session, one per WhatsApp chat, titled after it and kept in the right space. Each question goes in with the chat's last 40 messages, its name, whether it is a group and its language, but only my question is saved in the record. That session gets one extra tool, whatsapp_draft, which shows the draft as a card in the panel, and its WhatsApp sending tools are switched off, so the only way a message leaves is my tap on Send. Any other tool that reaches people still asks first. The session stays silent: no notifications, no unread marks, no Live Activity. Opening the panel already starts that session on the server, which saves about a second on the first question.",
    ],
  },
  {
    title: "Notifications",
    body: [
      "Notifications go to the iPhone through Apple's push service, and to the web app as web push. A notification service extension on the phone turns a message into a proper conversation notification with the sender's picture, and with AirPods in it swaps the sound for the spoken message, in Kairo's OpenAI voice. A content extension adds the Play button. Messages that arrive together in one chat become one notification, and muted chats, my own messages and the chat I'm reading stay quiet.",
      "Clearing is a silent push, gathered over a second or two, that sets the badge and removes the notifications that no longer matter. The test button calls a route that sends one sample of every kind to the phone that asked, Live Activity included.",
    ],
  },
  {
    title: "Voice",
    body: [
      "Voice mode is a realtime model doing the talking, OpenAI or Gemini Live, and handing every real question to the chat's Claude session. In the iPhone app the call runs natively over WebRTC, and LiveCommunicationKit makes it a real call to the phone, which is what keeps it going with the screen locked. For the briefing, Kairo sends a VoIP push that rings like a call, and AlarmKit does the waking.",
      "The watch can't hold a WebRTC call for long, so it does push-to-talk instead: it records a short clip, sends it over plain HTTPS, and plays back Kairo's spoken answer.",
      "In the car, Kairo uses Apple's CarPlay category for voice conversation apps: a single Voice Control screen that follows the same call's state, with no text, no pictures and no system call screen on top of it.",
      "The orb you talk to is a drop of glass rendered live: Metal in the app, WebGL in the browser, at 60 frames a second, moving with my voice and with Kairo's.",
    ],
  },
  {
    title: "Small jobs on a fast model",
    body: [
      "Anything small without tools goes to one cheap, fast OpenAI model, gpt-6-luna, with reasoning switched off, a small answer limit, strict JSON where a job needs fields and nothing stored on OpenAI's side. While Kairo is in use, the server keeps one warm keep-alive connection to OpenAI open, and the jobs I sit waiting for go out on the priority tier. The whole thing costs cents a day.",
      "Every job has a hard time limit and its own fallback when the model is slow or down: the first sentences instead of a summary, the words as spoken instead of a tidy, no suggestions at all. Only timings go in the log, never content.",
    ],
  },
  {
    title: "Health",
    body: [
      "Claude only names the foods and guesses the grams; every calorie and macro then comes from the Swiss Food Composition Database or, for anything with a barcode, Open Food Facts. Steps, sleep, weight and calories burned come from my watch and my phone, through HealthKit with background delivery and services in Dbrain, and runs from Strava.",
    ],
  },
  {
    title: "The iPhone app",
    body: [
      "A SwiftUI app in Apple's Liquid Glass. Every screen reads the same JSON routes as the web app, so the logic stays on the server and a new server version changes the app at once. What a screen showed last sits in a disk cache. Each device signs in with its own token in the Keychain.",
      "Around the app sit its extensions: the share sheet, widgets and Controls, Live Activities, the two notification extensions, and the Apple Watch app with its complications. They share the device token through the Keychain and a small App Group for the spoken notification sounds. Since my developer account went paid, an install lasts a year. I still install it on my own phone from Xcode, so it never went near the App Store.",
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
        Kairo is for me alone and private, so there is nothing to link to.
      </p>
    </section>
  )
}
