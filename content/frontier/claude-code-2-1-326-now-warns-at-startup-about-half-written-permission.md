---
title: Claude Code 2.1.326 now warns at startup about half-written permission rules
date: 2026-11-17
summary: Claude Code 2.1.326 warns at startup about broken tool-permission rules and lets Code Mode run with agent teams. Copilot also changed models, harnesses and admin controls this week.
---

**The short version**

- Claude Code 2.1.326 warns at startup about malformed --allowedTools, --disallowedTools and --tools entries. The notes don't say whether broken rules are applied.
- Read the fixes for claude purge, parallel MCP results and mislabeled destructive Bash commands. Sessions with teams on now start in Code Mode if you had it enabled.
- Copilot: check pinned model IDs, plan the VS Code Local harness migration before Feb 2027, and pair strictPluginOnlyCustomization with strictKnownMarketplaces.

![Flow diagram: a malformed --disallowedTools entry triggers a startup warning in Claude Code 2.1.326, but the release notes don't say whether the rule is applied.](/logbook/frontier/claude-code-2-1-326-now-warns-at-startup-about-half-written-permission.svg)

[Claude Code v2.1.326](https://github.com/anthropics/claude-code/releases/tag/v2.1.326) shipped on 16 Nov at 22:11, marked "Latest" and "Immutable release." The two items at the top are Code Mode working with agent teams and a startup warning for permission rules that look broken. I care more about the second one. It touches the dull config that decides what an agent is allowed to do.

## The permission warning

Claude Code now prints a warning at startup if an `--allowedTools`, `--disallowedTools` or `--tools` value has an entry that "doesn't look like a complete rule."

A warning doesn't enforce anything. The notes don't say what happens to the malformed entry after the warning. Suppose a typo in a `--disallowedTools` entry means it gets ignored. Then that deny rule fails open, and the warning is the only clue. Until the docs say otherwise, I would assume the worst.

The same release also fixes several other ways config could disappear without a word:

- A prompt typed after `--add-dir`, `--allowedTools` or another list option was dropped without a message.
- Rules added in `/permissions` looked saved even when the settings file couldn't be written. The terminal now warns and names the file.
- A settings file saved with an error mid-session used to be skipped silently.
- Values nested deeper than 64 levels are now dropped with a warning.

On Monday I would grep CI scripts and shell aliases for those three flags. Then I'd start one session and press Ctrl+O, which now shows hidden startup notices.

## Code Mode meets agent teams

You can now turn on Code Mode while agent teams are enabled. The notes never explain what Code Mode is, so I won't guess. One behaviour change stands out: if you had already enabled Code Mode, sessions with teams on now start in it. There are also fixes for skills with inline `!` commands under auto mode, for background subagents, and for mods calling `$.tool.call`.

## The fixes I would read first

To me, three fixes further down matter more than either headline:

- Bash commands that delete or overwrite files (`find -delete`, `cat a > b`, `sort -o`) were summarized in the transcript as a search or a read. Anyone who checked transcripts to see what an agent did was reading wrong labels.
- `claude purge` hid its prompts when stdout was redirected. One unseen Enter could delete a project's data.
- Parallel MCP tool calls could read another call's saved result when two long results arrived in the same millisecond ([#105138](https://github.com/anthropics/claude-code/releases/tag/v2.1.326)).

The release notes are cut off in the source, so the full list is longer than what I can see.

## Meanwhile, in Copilot

GitHub's changes this week cover the same ground: who controls the model, the runtime and the config.

**Models.** As of 16 November, Copilot [deprecated](https://github.blog/changelog/2026-11-16-github-copilot-models-deprecated-on-november-16-2026) Claude Opus 4.8 and Opus 5 in favour of Opus 5.5, and GPT-5.6 Terra in favour of GPT-6.1 Sol or GPT-6 Luna. There are two odd exceptions. Opus 4.8 stays for individual subscribers on annual plans, and Opus 5 is gone from the picker but still used for "runtime refusal fallback." Removing the deprecated models takes no action. Admins who turned off the global default, though, have to enable the alternatives through their model policies in Copilot settings. Configs and CI that pin those model IDs need updating too. The post doesn't compare behaviour or cost. Its related-posts list also links a 13 November post titled "Upcoming deprecation of selected GitHub Copilot models in December."

**Harness.** VS Code 1.146 [deprecates the Local harness](https://github.blog/changelog/2026-11-16-vs-code-retires-the-local-harness-in-february-2027), and it will be removed in February 2027. Its replacement, the Copilot harness, has been the default for new sessions since 1.143. Two lines in the post deserve attention:

- switching "doesn't automatically convert every customization"
- "selecting the Copilot harness doesn't enable sandboxing"

The `vscode.temporaryDefaultToLocalHarness` exception goes away at the same time, so keeping it set won't buy extra time. Connectors, task boards and canvases are still in preview, and Fusion tiers depend on your plan. To try it, start a new session and pick **Copilot** under **Session Target**.

**Customization source.** [`strictPluginOnlyCustomization`](https://github.blog/changelog/2026-11-16-control-where-github-copilot-customizations-come-from) blocks standalone user and project skills, custom agents, hooks, MCP servers and executable extensions. Admins can turn it on per category. It doesn't fully lock things down. "Plugin-only" doesn't mean enterprise-managed plugins only, and the setting isn't a marketplace allowlist. To limit which marketplaces count, pair it with `strictKnownMarketplaces`. If an admin applies it to the MCP servers category, MCP servers defined in user or project config are blocked, while eligible plugins and managed settings stay allowed. It only applies on GitHub Enterprise Cloud with Business or Enterprise seats.

The Claude Code warnings only help if someone reads the startup output.

## Sources

- [v2.1.326](https://github.com/anthropics/claude-code/releases/tag/v2.1.326), Claude Code releases
- [GitHub Copilot models deprecated on November 16, 2026](https://github.blog/changelog/2026-11-16-github-copilot-models-deprecated-on-november-16-2026), GitHub changelog
- [VS Code retires the Local harness in February 2027](https://github.blog/changelog/2026-11-16-vs-code-retires-the-local-harness-in-february-2027), GitHub changelog
- [Control where GitHub Copilot customizations come from](https://github.blog/changelog/2026-11-16-control-where-github-copilot-customizations-come-from), GitHub changelog
