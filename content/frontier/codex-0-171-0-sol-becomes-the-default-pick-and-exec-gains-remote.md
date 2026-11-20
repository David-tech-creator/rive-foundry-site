---
title: Codex 0.171.0: Sol becomes the default pick, and exec gains --remote
date: 2026-11-20
summary: Codex 0.171.0 makes GPT-6.2 Sol the default catalog pick, turns on the TUI workspace, and adds remote exec. I'd start by checking CI jobs that never set a model.
---

**The short version**

- Sol is now the 'default catalog selection'. Setups that never chose a model, especially codex exec in CI, are the ones most likely to change.
- Astra 'needs steering' reports are early and unconfirmed. Run a small bake-off on your own repos before switching.
- Read up on codex exec --remote and /rc pairing codes before rolling them out to a team. They add new attack surface.

![Diagram: in Codex 0.171.0, setups with a model already set see no change, while setups with no model set, like codex exec in CI, may switch to Sol.](/logbook/frontier/codex-0-171-0-sol-becomes-the-default-pick-and-exec-gains-remote.svg)

Codex [`rust-v0.171.0`](https://github.com/openai/codex/releases/tag/rust-v0.171.0) came out overnight, tagged at 00:44 on 20 Nov from commit `ccf9be8`. Two lines in the notes will change how a lot of setups behave this week. GPT-6.2 Sol is now the "default catalog selection" (#62106), and the TUI workspace is on by default (#61352). There's also a new `codex exec --remote`, which I find more interesting than either.

## Who actually gets Sol

The wording is narrow. The notes say default *catalog selection*, and that's a smaller claim than "everyone now runs Sol". If you already set a model, or your lookups go through thread-scoped catalogs (#61421), you may see no change at all. The ones likely to drift are setups that never picked a model.

A lot of CI jobs fall in that group. A `codex exec` step with no model set can change its output and its bill between two runs while your config stays exactly the same. That's where I would pin first.

The release notes don't show how to pin, so I won't make up syntax here. Check your existing config, and print the active model in the CI log so any change at least shows up. Pinning has a cost too: you miss catalog updates, and you'll have to move when the pinned model is deprecated. I would pin CI and leave interactive sessions on the default.

## The Astra reports, with salt

Early reactions to GPT-6.2 are mixed, and none of them are confirmed. Ethan Mollick [wrote on LinkedIn](https://www.linkedin.com/in/emollick/recent-activity/all/) that Astra felt "very uneven & weird" and "harder to steer". The same post says it "could deliver well" on a space elevator ride built from scratch in Blender and Unity.

[Latent Space's AINews](https://latent.space/p/ainews-gemini-4-neon-gdm-s-opus-sol-contender/) adds context, also unconfirmed. OpenAI's Tibo Sottiaux says early reviewers had builds from before the last few days of changes. Jeremy Howard is reportedly reverting Solveit's Astra and Sol options to their pre-6.2 versions. The benchmarks are mixed: Astra placed third on Code Arena WebDev at a 42% lower median cost than its predecessor, but debuted sixth on Agent Arena, and Sol placed eleventh there at $0.90 median per task.

The same roundup relays an Artificial Analysis finding, again unconfirmed: Astra's responses got shorter, and it became less likely to admit uncertainty. That's the one I'd watch. For an agent running unattended, that's worse than laziness.

## A small bake-off

"Test it yourself" needs a method. Here's what I would try:

1. Pick five to ten finished tasks from my own repos where I already know what a good diff looks like.
2. Run each task through `codex exec` with my current model, then Sol, then Astra.
3. Log turns, tokens, cost and review time for each run.
4. Flag every run where the model reported success on broken work.

Step 4 is the Astra uncertainty finding turned into something you can count.

## The remote bits are new attack surface

`codex exec --remote` starts or resumes noninteractive sessions on an existing app server (#61707). `/rc` and `/remote` manage local remote control and show device pairing codes in the TUI (#62121). Useful.

They also raise questions the notes don't answer. Whose sandbox and permission profile apply when exec runs remotely? Who can attach once a pairing code has been on screen? Before turning this on for a team, I'd read #61707 and #62121 and treat a pairing code like a password on display.

Two fixes in this release matter here. Permission profiles now survive a working-directory change (#61195), and late completion events no longer cancel approvals for a newer turn (#61801).

## The workspace is on

You get searchable document previews, image previews, and subagent transcripts next to the main conversation. The transcripts are what I'd want most. The same release also fixes stray characters on scroll, caret jumps and redraws with stale terminal sizes (#62139, #62174, #62175).

The model swap is getting the headlines. What I'd actually check on Monday is which model my CI jobs run when nobody has set one.

## Sources

- [0.171.0](https://github.com/openai/codex/releases/tag/rust-v0.171.0), OpenAI Codex releases
- [I’ve been using GPT-6.2 Astra prior to launch & I found it very uneven  & weird. On one ha](https://www.linkedin.com/in/emollick/recent-activity/all/), Ethan Mollick (Wharton) on LinkedIn
- [AINews Gemini 4 Neon: GDM's Opus/Sol Contender](https://latent.space/p/ainews-gemini-4-neon-gdm-s-opus-sol-contender/), Latent Space
