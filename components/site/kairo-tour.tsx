// Kairo: every part of the app, what it does and how it does it. Shown on /work/kairo under the
// story, before "How I set it up". Made-up examples only: no contact names, work names or hostnames.

type Part = { title: string; body: string[] }

const GROUPS: Array<{ title: string; parts: Part[] }> = [
  {
    title: "Talking to it",
    parts: [
      {
        title: "Chat",
        body: [
          "Every chat can look things up, use my tools and keep going until the job is done. Answers can come back as more than text: a day drawn on an hour timeline, cards, charts, a shopping basket, a form to fill in. I can attach photos and files, and group chats into projects that share their own instructions and files.",
        ],
      },
      {
        title: "Voice",
        body: [
          "A tap on the orb and we talk, and it can check my calendar or write a message mid-sentence. On the iPhone a talk is a real phone call: it keeps going with the screen locked, in my pocket, it sits in the Dynamic Island, I end it from my AirPods, and another call puts it on hold.",
          "There is one voice everywhere: the voice I pick is the one that talks with me, reads my WhatsApp messages and reads the paper, at the speed I set.",
          "It works the other way round too. Kairo can ring me with the morning briefing, and an alarm can wake me straight into it: I tap Brief me and it starts talking.",
        ],
      },
      {
        title: "Pictures",
        body: [
          "I can sketch something on a full-screen sheet or just describe it, and Kairo turns it into a picture. It can also restyle a photo I attach.",
        ],
      },
    ],
  },
  {
    title: "My day",
    parts: [
      {
        title: "Home",
        body: [
          "The first screen: a greeting, today's events, what is waiting on me and a button to the briefing. Nothing to dig for.",
        ],
      },
      {
        title: "Briefings",
        body: [
          "A morning and an evening briefing, at the times I choose. Each one draws the day as a board: the hours with my events and the free gaps, the weather, and short lists like Needs you, Birthdays and Coming due. Every item has a button that does something about it, like Draft reply or Send wish, and tapping it is the go-ahead.",
          "Before each meeting with other people, a short brief arrives: who they are, how long we have been in touch, what was said last time and what matters now. On Sundays I get Sunday Wrapped, my week as a short story with real numbers: kilometres run, loops closed, people seen, one thing that slipped.",
        ],
      },
      {
        title: "The Kairo paper",
        body: [
          "A morning paper about AI. Kairo gathers the news feeds itself, Claude picks and writes the stories in one go without browsing, and every link is filled in from the feeds, so no link is ever made up. It can read the paper aloud while I make coffee.",
        ],
      },
      {
        title: "Days",
        body: [
          "A scroll through my days. A past day becomes a day file, rebuilt from my own records: what was in the calendar, who I met or messaged, steps, sleep and workouts, how many photos I took and where, and what happened on the same date in earlier years. Coming days show as boards.",
        ],
      },
    ],
  },
  {
    title: "Getting things done",
    parts: [
      {
        title: "Ideas",
        body: [
          "Every morning at 06:30 Kairo reads my calendar for the week, my mail and messages and Dbrain, and comes back with six to nine concrete things it could do for me now, each tied to a real person, meeting or deadline: \"Draft your reply about Thursday\", \"Book the table for Saturday\". Before it suggests a reply it checks my sent folders, so it never offers to answer someone I already answered. One tap and it does it; one tap on the cross and that idea never comes back.",
        ],
      },
      {
        title: "Drafts",
        body: [
          "My email drafts, from every mailbox, as a deck of cards I swipe through one at a time: right to send, left to bin, up to fix, down for later. To fix one I just say what to change, and Kairo rewrites it in the mailbox itself.",
          "\"Write replies\" goes further. Kairo looks for the mail from the last two weeks where a real person is waiting on me, with the same check of my sent folders, and writes up to eight replies as drafts in the right mailbox and thread, in the language of the thread and the way I write. Where only I know the answer, it leaves a marked gap instead of guessing. And every correction I make is written down as a lesson about how I write, which it reads before the next round.",
        ],
      },
      {
        title: "Goals",
        body: [
          "My goals, by area: health, work, friends, learning, money. Kairo suggests new ones from what it sees, which I can accept or turn down, and checks on progress. A goal nobody touches for weeks gets paused, a finished one gets archived, and now and then it asks whether I still want one.",
        ],
      },
      {
        title: "Autopilot",
        body: [
          "Standing orders in my own words, on a schedule: \"every Friday at 16:00, tell me which invoices are still open\". Each routine has its own thread where it reports every run, and I can reply there to change it. A routine runs while I am not looking, so I choose exactly which tools it may use.",
        ],
      },
      {
        title: "Browser, calls and payments",
        body: [
          "Kairo has its own browser for the sites without an API. I can watch it work live and take over at any moment. It can phone a restaurant or a doctor's office from my number after one approval and posts the outcome back in the chat. Saved logins and my card are encrypted, and Kairo fills them into a form without the model ever seeing them.",
        ],
      },
    ],
  },
  {
    title: "Remembering",
    parts: [
      {
        title: "Memory",
        body: [
          "Everything Kairo remembers lives in Dbrain, and the Memory page shows it in three kinds: facts, skills and reminders.",
          "Facts come in two ways. When I tell it something in a chat, \"remember that Lea is vegetarian\", it saves it straight to Dbrain and the fact shows up in the log. And every evening at 21:30 Kairo reviews the day's conversations by itself and proposes up to six things worth keeping for good: a preference, a decision, a fact about someone, a promise with a date. It checks Dbrain first and leaves out what is already there. Nothing it proposes is saved until I tap Keep, and what I turn down is never proposed again.",
          "A skill is my way of doing a kind of request. When I ask for the same sort of thing twice, or tell it how I want something done, the evening review can propose it as a skill: a name, when it applies and the steps. Once I say Use this, it follows those steps every time. A reminder is a note for later: \"when the landlord comes up, remind me about the heating\". It waits for the topic and speaks up when it does.",
          "My conversations go into Dbrain too, word for word. Once a chat goes quiet it is written out as a file, and Dbrain files it with no model in between, so what I said is kept exactly as I said it. The notes of my meetings are filed the same way each evening, so a brief before the next meeting can find them.",
        ],
      },
      {
        title: "Contacts",
        body: [
          "Dbrain keeps my iPhone contacts up to date. Once a day it adds the people I am really in touch with, both ways, from mail and WhatsApp. Anyone it is unsure about waits for me on a short review page: an email address with no name, a name that matches a card I already have but no number. One card per person, and I either add them, typing the name where one is missing, or skip them for good.",
        ],
      },
      {
        title: "Saved for later",
        body: [
          "One library for every link I want to come back to, filled from my iPhone, a bookmarklet on my Mac and Kairo itself. Each save is summarised and filed in Dbrain, so Kairo can find it again when it matters.",
        ],
      },
    ],
  },
  {
    title: "Messages and health",
    parts: [
      {
        title: "WhatsApp",
        body: [
          "My personal and my business WhatsApp live inside Kairo: every chat and group, photos, videos, voice notes with transcripts, replies and reactions. It behaves like the WhatsApp I know. I hold the mic for a voice note, slide away to cancel or up to lock it, and swipe a message to reply to it. Opening a chat reads it, blue ticks included, and I can mute a chat in Kairo without touching WhatsApp. The chat list works the same way: All, Unread, Favourites and Groups sit right under the search field, my WhatsApp favourites in their own order, and a community is one row that opens onto its groups.",
          "Dictation works like in the Claude app: the words appear while I speak, and X throws them away, Stop leaves them in the box and Send sends. Kairo works out the chat's language from its messages and shows it as a small tag I can tap to switch. When I stop, it tidies the words into the message I meant, in the way I write in that chat. And when someone wrote last, up to three short replies sit above the box; a tap puts one in, it never sends.",
          "It can read my messages to me too. With AirPods in, a new message is spoken in Kairo's voice as the notification itself: \"Anna says: running ten minutes late\". Otherwise there is Play on the notification, or \"Read my messages\" for every unread chat in a row, and I can answer by voice.",
        ],
      },
      {
        title: "Kairo in a chat",
        body: [
          "Next to the mic in every WhatsApp chat sits Kairo's glass button. A tap opens a private panel that only I see, and there I can ask it to draft a reply, sum up the chat, check my calendar before I say yes to Saturday, translate, or anything else. It knows the chat it is in, who said what and in which language, and it has just what a chat needs: my calendar, contacts, Dbrain, the web and reminders, which keeps it quick.",
          "A draft comes back as a card with three buttons: Put in box, Send, or Change, where I just say what to change. Kairo never sends a message by itself. Each time I open the panel it starts from a clean slate, and it gets ready the moment it opens, so my first question never waits for it to start. And if I hold the button instead of tapping, I ask out loud and hear the answer read back.",
        ],
      },
      {
        title: "Health",
        body: [
          "I log a meal with a photo or a sentence, and on the phone the camera reads a barcode or a nutrition label by itself. Kairo names the foods and guesses the grams, and if it can't tell whether something was fried in oil or butter, it asks. The calories and protein come from real nutrition tables, never from the model. Next to what I ate sit the calories I burned, steps, sleep and weight, and a week of all of it side by side.",
        ],
      },
    ],
  },
  {
    title: "On the phone, the watch and the Lock Screen",
    parts: [
      {
        title: "The iPhone app",
        body: [
          "Every page is a native screen, and it opens instantly on what it showed last time while the fresh copy loads behind. Face ID when it opens, a passkey to sign in.",
        ],
      },
      {
        title: "Lock Screen",
        body: [
          "When Kairo works on something long, or I am on a call with it, the progress sits on the Lock Screen and in the Dynamic Island, and on my watch, the CarPlay dashboard and the Mac menu bar too. When it needs my OK to send something, Allow is right there: Face ID, done, without opening the app.",
        ],
      },
      {
        title: "Notifications",
        body: [
          "Only the things that matter make a sound: approvals, replies, WhatsApp, calls and briefings. A WhatsApp message says who wrote and on which account. On top of that come Kairo notices, a few a day at most, outside quiet hours: a meeting that moved, a mail someone is waiting on, a train to catch, a workout, arriving somewhere. Each one ends with a line saying why I am seeing it.",
          "Housekeeping stays silent. The badge counts what is really waiting on me, and when I read or handle something anywhere, on the Mac, the phone or the watch, its notification clears itself everywhere. A Test notifications button in Settings sends me one of every kind, so I can check them all in a minute.",
        ],
      },
      {
        title: "Buttons and Siri",
        body: [
          "Widgets for today, what needs me and health. Controls I can put on the Action button, like Talk to Kairo or Read my messages. Siri phrases, chats in Spotlight, and a Focus filter that switches Kairo to Personal or Business with my Focus. And \"Kairo\" sits in the share sheet of every app: I send a link, some text or photos to ask about, and the answer comes back as a notification without opening the app, or I save a link for later in one tap.",
        ],
      },
      {
        title: "Apple Watch",
        body: [
          "A small app of its own on my Apple Watch Ultra. It talks to my server over its own connection, so it works on a run with the phone at home.",
          "One tap starts a conversation, hands-free: the watch hears when I stop talking, Kairo answers out loud and listens again, until I stay quiet. When I run, cycle or walk, it keeps its answers to a sentence or two.",
          "When Kairo needs my go-ahead, say to send a WhatsApp reply I dictated, it tells me, and a double tap of thumb and finger allows it. My voice alone never approves anything. There is also a glance at my day, complications, and Talk on the Action button.",
        ],
      },
      {
        title: "In the car",
        body: [
          "Kairo is a CarPlay voice app. I tap it on the car's screen and we are talking: the same voice as on the phone, with my calendar, mail and messages, and answers kept short because I am driving. The screen shows only the drop of glass and one word for what it is doing, listening, thinking or speaking, with Mute and End, because Apple allows no text or pictures in the car. What we said ends up as a chat I can read later.",
        ],
      },
    ],
  },
  {
    title: "Around it all",
    parts: [
      {
        title: "Two spaces",
        body: [
          "Personal and Business, with one switch at the top. Each space has its own mailboxes, WhatsApp account, chats, drafts, goals and memories.",
        ],
      },
      {
        title: "Undo",
        body: [
          "A deleted chat, memory or routine can be brought back for five seconds.",
        ],
      },
      {
        title: "Small jobs",
        body: [
          "The real thinking stays on Claude. The small, quick jobs go to a fast model instead: tidying a dictation, reply suggestions, the short spoken summaries for the watch, Siri and the Lock Screen, read-aloud text that sounds natural, chat titles, and a yes or no on whether something deserves a notice. Answers come back in about half a second.",
        ],
      },
    ],
  },
]

export function KairoTour() {
  return (
    <section aria-labelledby="kairo-tour-title" className="mt-20">
      <h2 id="kairo-tour-title" className="kicker">
        Everything it does
      </h2>
      <div className="mt-8 space-y-16">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="text-2xl font-medium text-text md:text-3xl">{g.title}</h3>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {g.parts.map((part) => (
                <div key={part.title} className="grid gap-3 py-6 md:grid-cols-[11rem_1fr] md:gap-8">
                  <dt className="font-medium text-text md:pt-0.5">{part.title}</dt>
                  <dd className="space-y-4 text-base leading-relaxed text-text/85 md:text-lg md:leading-relaxed">
                    {part.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}
