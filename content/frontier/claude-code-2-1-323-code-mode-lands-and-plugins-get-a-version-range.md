---
title: Claude Code 2.1.323: Code Mode lands, and plugins get a version range
date: 2026-11-13
summary: Claude Code v2.1.323 adds experimental Code Mode, a version-range field for plugins, TypeScript hook checks in validate, and a safer auto mode fallback.
---

**The short version**

- Code Mode (Claude writes JavaScript to call tools) is opt-in and experimental. Read the docs page for the org off-switch before anyone enables it.
- Plugin authors: add engines["claude-code"] to plugin.json with a loose upper bound. A mismatched plugin is not installed, updated or loaded.
- claude plugin validate now type-checks TypeScript hooks as warnings. --strict turns them into failures, so pin the CLI version in CI.

![Three rows of Claude Code 2.1.323 changes: Code Mode is opt-in with an org off-switch; mismatched plugins are not loaded; and auto mode falls back to Manual.](/logbook/frontier/claude-code-2-1-323-code-mode-lands-and-plugins-get-a-version-range.svg)

[Claude Code v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323) shipped on 12 Nov. The fun part is an experiment called Code Mode. Most of the other changes answer a duller but more useful question: who decides what actually runs on your machine?

That question is what links the items below. Code Mode can be switched off for a whole organization. Plugins can now refuse to load on the wrong CLI version. Auto mode now asks first when it can't start properly. Same idea each time.

## Code Mode, and where its off-switch lives

In Code Mode, Claude writes JavaScript to call its tools. It is opt-in and marked experimental. The release notes point to the Code Mode docs page for turning it on, and also for turning it off across an organization.

The notes don't name the setting, and I won't guess one. They also say nothing about how that JavaScript interacts with permission prompts or sandboxing, or what ends up in your logs. Those are the first things I'd want answered before a team rollout.

So my plan is modest. I would try it on a throwaway repo. And if I ran a shared setup, I'd read the docs page for the org switch before a curious colleague turns it on for everyone.

## Plugin authors: declare a range, loosely

`plugin.json` gets a new field, `engines["claude-code"]`. If the running Claude Code version is outside the range a plugin declares, that plugin is **not installed, updated or loaded**. Install and update pick the newest plugin version that fits.

That's a real failure mode, so watch the upper bound. Set a tight ceiling and your plugin disappears the day users upgrade the CLI. The notes don't say how clearly users are told when no version fits. I would set a minimum version and leave the ceiling open unless I knew of an actual break.

One nearby fix helps here. Plugins with a version list in `enabledPlugins` no longer stay off without explanation. `/plugin` and `claude plugin list` now say why.

## Validate checks your hooks now, with or without strict

`claude plugin validate` now type-checks a plugin's TypeScript hooks module. This happens by default, and each finding is a warning. `--strict` makes those findings fail the run.

```
claude plugin validate           # type errors show up as warnings
claude plugin validate --strict  # type errors fail the run
```

Strict in CI is tempting, but there's a catch. A Claude Code upgrade can bring new checks, and your pipeline goes red on code nobody touched. I'd pin the CLI version in CI and bump it on purpose, or run without `--strict` and actually read the warnings.

The command now also reports the `$` nouns that a mod's `engine.create` hook adds, withholds or replaces. A separate item in the notes, not tied to validate: when a plugin's language server can't start, you now get a warning naming the server and what to check.

## The admin changes that hit today

These matter more to most teams than the headline items:

- **Auto mode fallback.** `--permission-mode auto` or `defaultMode: auto` used to start in a mode that could allow more when auto mode was unavailable. Now it starts in Manual mode, which asks first. If a script expected that looser behavior, it may start prompting.
- **Haiku behind gateways.** With auto mode behind a gateway at `ANTHROPIC_BASE_URL`, models whose gateway name contains "haiku" are refused, except `claude-haiku-5-5`. Haiku 4.5 is refused too.
- **Managed plugin errors.** Load errors from plugins enabled by managed settings now show up in `init.plugin_errors` in SDK and Desktop sessions, not only in the debug log.
- **Start-up reads.** `managed-settings.json` and `managed-settings.d` are read a second time if another program was rewriting them during start-up.

`CLAUDE_CODE_AUTO_MODE_MODEL` in managed settings is narrower than it sounds. It covers Claude Desktop sessions on third-party providers, and only once Desktop ships this version. The same wait applies to the new 30-second heartbeat that keeps long hooks from looking hung.

## What I'd do on Monday

1. Read the Code Mode docs page and find the org switch.
2. Add `engines["claude-code"]` with an open ceiling to any plugin I maintain.
3. Run `claude plugin validate` and fix the hook type warnings before trying `--strict`.
4. Search scripts for `defaultMode: auto` and gateway model names containing "haiku".

Code Mode is the shiny part of this release. The Manual fallback is the change most likely to surprise someone this week.

## Sources

- [v2.1.323](https://github.com/anthropics/claude-code/releases/tag/v2.1.323), Claude Code releases
