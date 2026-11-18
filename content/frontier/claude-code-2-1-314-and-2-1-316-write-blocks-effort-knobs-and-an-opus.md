---
title: Claude Code 2.1.314 and 2.1.316: write blocks, effort knobs and an Opus 4.8 deadline
date: 2026-11-01
summary: Two Claude Code releases add write blocking and effort settings, Opus 4.8 fast mode ends on 30 November, and a single unconfirmed report describes a backdoored 2.1.313 extension on Cursor.
---

**The short version**

- Opus 4.8 fast mode stops working on 30 Nov and returns errors with no fallback. Move those jobs to Opus 5.5 now.
- blockWritesOutsideWorkingDirectories covers Write, Edit and NotebookEdit only. Keep the sandbox or --restricted on for Bash.
- Ars reports a backdoored 2.1.313 extension on Cursor (unconfirmed). Check your version, and rotate credentials if you updated during the window.

![Diagram showing that blockWritesOutsideWorkingDirectories covers Write, Edit and NotebookEdit, does not name Bash, which still needs the sandbox or --restricted, and that Opus 4.8 fast mode is removed on 30 November in favour of Opus 5.5.](/logbook/frontier/claude-code-2-1-314-and-2-1-316-write-blocks-effort-knobs-and-an-opus.svg)

Claude Code shipped two releases in two days: v2.1.314 on 30 October and v2.1.316, marked Latest, on 31 October. I went in looking for guardrails and cost settings. The most urgent line in the notes turned out to be a date, so I'll start there.

## Opus 4.8 fast mode ends on 30 November

The [2.1.316 notes](https://github.com/anthropics/claude-code/releases/tag/v2.1.316) deprecate Opus 4.8 fast mode as of 30 October 2026, with removal on 30 November. After that date, fast mode requests on Opus 4.8 return an error. They don't fall back to standard Opus 4.8.

The notes say to "Migrate to Opus 5.5 to keep the speedup." Any CI job or script still pinned to Opus 4.8 fast mode will fail outright in four weeks. On Monday I would search every config for it.

## Write blocking only covers three tools

[v2.1.314](https://github.com/anthropics/claude-code/releases/tag/v2.1.314) adds `permissions.blockWritesOutsideWorkingDirectories`. With it on, Write, Edit and NotebookEdit refuse paths outside the working directories in every permission mode.

The notes name only those three tools and don't say whether the setting applies to Bash. My reading is that an agent could still reach `~/.ssh` through Bash, with `sed -i`, a shell redirect or `curl -o`, but that is my inference, not something the notes state. So I'd treat this as a seatbelt for the file tools and keep the sandbox or `--restricted` running for everything else.

```json
{
  "permissions": {
    "blockWritesOutsideWorkingDirectories": true
  }
}
```

The notes don't show the syntax, so the boolean above is my guess. Check the docs before you roll it out. One related fix in the same release is worth having: sandbox protections now cover worktrees entered with `claude -p --resume` or `--continue`. 2.1.316 adds another. `--restricted` sessions no longer upload files from outside the working directories when a Read allow rule covered them.

## Two cost settings with undocumented values

2.1.316 adds two environment variables:

```bash
export CLAUDE_CODE_SUBAGENT_EFFORT=<level>      # valid values not listed in the notes
export CLAUDE_CODE_DISABLE_ULTRATHINK=<value>   # value not given in the notes
```

The first sets the effort level for subagents when nothing else names one. Without it, subagents inherit the session's effort. The second turns off the ultrathink keyword.

Both come with a quality cost. Subagents do the searching, reviewing and test-writing, and running them at low effort could make that work worse without anyone noticing. Ultrathink is the deliberate escape hatch, and in VS Code it now runs at xhigh. Before changing either, I would run five real tasks with and without the setting and compare cost and review outcomes.

## The policy fixes matter more

If you run Claude Code for a team, these 2.1.314 fixes are the real reason to update:

- `forceRemoteSettingsRefresh` set only in remote managed settings stopped applying once the stored copy expired. Sessions could then start with no policy when the server was unreachable.
- A settings file excluded with `--setting-sources` still supplied some settings, such as auto mode rules and saved permission consents.
- "Continue automatically at usage limit" could continue more than three times without asking when a task restarted itself between waits, such as a /goal check-in or a background or scheduled task.

2.1.316 then adds one behaviour change of its own, not a fix. For Team and Enterprise logins, server-managed settings fetched from Anthropic's API now apply without an approval prompt. A stored copy that doesn't verify is refused.

## The 2.1.313 report is unconfirmed

[Ars Technica](https://arstechnica.com/security/2026/10/anthropic-vs-code-extension-on-cursor-backdoored-for-nearly-12-hours/) reports that version 2.1.313 of Anthropic's VS Code extension was backdoored on **Cursor's** marketplace and distributed through Anthropic's official account there. That is one source. Anthropic had not issued a notice, and neither release note mentions it, so treat all of this as unconfirmed.

Per Cursor, as quoted by Ars:

- Up to 5,000 users may be affected.
- The code collected the hostname, username, environment variable names, Git email and public IP.
- It tried to add an SSH key to `authorized_keys`, open a reverse tunnel and persist through a LaunchAgent or scheduled task.
- It reported back to `/beacon` on port 8099.

Ars's own guidance is that anyone who installed or updated the extension from Cursor between 5:27 am ET and 4:35 pm on Thursday should consider themselves affected.

If you installed 2.1.313 during that window, I would assume exposure:

1. Check `authorized_keys`, your LaunchAgents and your scheduled tasks.
2. Rotate any credential whose name was sitting in an environment variable.
3. Compare against the IOCs Cursor published.

Pinning versions is a weaker fix than it sounds. Ars quotes Luke Roberts saying Cursor extensions auto-update by default and that this can be changed in settings. No source gives steps for pinning. Pinning also wouldn't have protected anyone who installed during the window, and 2.1.314 reportedly arrived hours later. Turning off auto-update and updating by hand after reading release notes seems like a fair middle ground.

## Roundup: Codex 0.166 and Mistral Large 4

[Codex 0.166.0](https://github.com/openai/codex/releases/tag/rust-v0.166.0), released 29 October, adds GPT-6.1 Terra to its bundled, Vertex AI and Bedrock model catalogs. The notes don't say what the model can do. `codex doctor --network-only` runs config, connectivity and WebSocket checks, and `codex queue --resume` resumes unloaded threads after you queue a message. The default thread unload delay is now one minute, which makes `--resume` more useful than it sounds.

Mistral released the weights for [Mistral Large 4](https://mistral.ai/news/mistral-large-4-oss), nicknamed Le Chonk. It is a 1-trillion-parameter, natively multimodal flagship, and coding is only one of its targets. Mistral reports 41% on Terminal-Bench 4.0, and 48% on the Artificial Analysis Coding Agent Index, where it is effectively tied with GLM-5.3 while using 47% fewer tokens. Those numbers are Mistral's own. Mistral calls the model fully open-weight, and running a trillion parameters yourself is a hosting project before it's a coding tool.

## Sources

- [v2.1.316](https://github.com/anthropics/claude-code/releases/tag/v2.1.316), Claude Code releases
- [v2.1.314](https://github.com/anthropics/claude-code/releases/tag/v2.1.314), Claude Code releases
- [0.166.0](https://github.com/openai/codex/releases/tag/rust-v0.166.0), OpenAI Codex releases
- [Research Le Chonk: Built for Coders, Trusted by Defenders. We release the weights of Le Chonk, advancing the frontier of open models in agentic coding and cybersecurity.](https://mistral.ai/news/mistral-large-4-oss), Mistral news
- [Anthropic VS code extension on Cursor backdoored for nearly 12 hours](https://arstechnica.com/security/2026/10/anthropic-vs-code-extension-on-cursor-backdoored-for-nearly-12-hours/), Ars Technica AI
