---
title: Claude Code 2.1.319: auto mode now fails closed behind gateways
date: 2026-11-07
summary: Behind an LLM gateway or with telemetry off, Claude Code auto mode now asks about or denies calls it can't verify. It no longer falls back to the built-in classifier, and claude -p in auto mode now exits 1 when actions were refused because no safety check was available.
---

**The short version**

- Behind a gateway or with telemetry off, auto mode now asks about or denies calls it can't verify. The built-in classifier no longer takes over silently.
- claude -p in auto mode now exits 1 when actions were refused because no safety check was available. Any CI step that counted on exit 0 will now fail.
- Set CLAUDE_CODE_AUTO_MODE_SERVER to 1 or 0 on purpose, and upgrade for the permission-bypass fixes in this release.

![Before and after: behind a gateway, auto mode used to fall back to the built-in classifier and exit 0; since 2.1.319 it asks or denies and claude -p exits 1.](/logbook/frontier/claude-code-2-1-319-auto-mode-now-fails-closed-behind-gateways.svg)

Claude Code [v2.1.319](https://github.com/anthropics/claude-code/releases/tag/v2.1.319) landed on 06 Nov. The release notes contain one short phrase that changes how auto mode behaves: "no fallback to the built-in classifier." If you run auto mode behind an LLM gateway, or with telemetry or feature flags turned off, any call the server can't check is now asked about or denied.

So auto mode now fails closed. The notes say this change leaves Bedrock, Vertex and Foundry alone. If you use a gateway, it applies to you.

## What changes in your pipelines

The exit code is the change that will catch people. `claude -p` in auto mode used to exit 0 when actions were refused because no safety check was available. Text and JSON output now both exit 1.

A nightly job that showed green while doing nothing will start showing red. I count that as a bug fixed. It will still page someone.

Three more behaviours change along with it:

- `/status` stops showing "Auto mode server: Enabled" when the server-side review never reaches the session, for example behind an LLM gateway that drops it.
- When permission rules or autoMode settings get very large, auto mode now says why it refused. Unless you have autoMode deny rules set, it asks you in the terminal.
- A model change and an auto mode request sent back to back no longer cause a refusal.

## Picking the switch on purpose

One environment variable now sets the behaviour:

```
# server-side check, even with CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS set
export CLAUDE_CODE_AUTO_MODE_SERVER=1

# keep the built-in classifier
export CLAUDE_CODE_AUTO_MODE_SERVER=0
```

If your managed settings set `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS`, they also need `CLAUDE_CODE_AUTO_MODE_SERVER=1`. Before this release there was also a bug where the managed `=1` was ignored behind a gateway. It happened when the gateway URL was set only in managed settings and the server-managed settings couldn't be fetched.

You can now stop feature-flag fetching without turning telemetry off, using the new `CLAUDE_CODE_DISABLE_FEATURE_FLAGS`. Every flag then falls back to its built-in default.

The notes don't say what `=0` gives up compared with the server check. I can't tell you which one is safer. I would pick one per environment and write down the reason next to it.

## The fixes are the real reason to upgrade

If auto mode is going to make decisions for you, its permission checks have to hold. This release closes several holes in them:

- A `sed` command could skip the permission check in accept-edits and auto mode.
- A crafted environment prefix could hide part of a Bash command from permission checks.
- Bash deny and ask rules missed commands written with quoted words.
- Creating a worktree allowed a sandbox escape.
- `/rewind` could restore or delete a file through a directory symlink.

All of these come from Anthropic's own changelog. For unattended runs there is also a new `permissions.denyInsteadOfPrompting` setting. A tool call that would wait on a permission prompt is denied, and the turn keeps going.

## MCP tasks now go to the background

This release also adds support for MCP tasks in the terminal. When an MCP server runs a tool call as a task, Claude Code moves it to the background right away and tells Claude the result when it finishes.

That changes ordering. If step two of a chain reads step one's output, the result can now arrive later than the chain expects. The notes don't explain how Claude gets the late result or what happens when the task fails. There is an opt-out that makes Claude Code wait inside the tool call instead:

```
export CLAUDE_CODE_DISABLE_MCP_TASK_BACKGROUND=1
```

For any pipeline that depends on order, I would set this until the docs cover failures.

One caveat: my copy of the release notes was cut off near the end, so a few items may be missing. Of what I could read, the exit code change is the first thing I would check in CI.

## Sources

- [v2.1.319](https://github.com/anthropics/claude-code/releases/tag/v2.1.319), Claude Code releases
- [Cursor changelog](https://cursor.com/changelog), Cursor changelog
- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog), Gemini API changelog
- [Copilot code review: API management and review overview updates](https://github.blog/changelog/2026-11-06-copilot-code-review-api-management-and-review-overview-updates), GitHub changelog
