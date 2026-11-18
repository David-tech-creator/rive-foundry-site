---
title: December 1: gemini-2.5-pro quietly becomes Flash, and other silent breaks
date: 2026-11-04
summary: From December 1, calls to Gemini 2.5 Pro and Flash are routed to newer Flash models and billed at those models' rates. GitHub and Claude Code also have dated changes that I would get ahead of now.
---

**The short version**

- From Dec 1, gemini-2.5-pro calls go to gemini-3.8-flash, billed at 3.8 Flash rates. Pin the new model, strip removed params, run evals.
- GitHub blocks pull_request_target in public repos on Dec 2. Brownouts hit Nov 9 and 16, 16:00–18:00 UTC. Check Insights this week.
- Claude Code 2.1.318 shows when your login expires. Read credential_expires_at in CI, because the stderr warning is easy to miss.

![Table of three upcoming breaks: gemini-2.5-pro rerouted to 3.8 Flash on Dec 1 fails silently, GitHub's pull_request_target block fails loudly, Claude login expiry warns only on stderr.](/logbook/frontier/december-1-gemini-2-5-pro-quietly-becomes-flash-and-other-silent-break.svg)

On November 2, Google set a deadline and GitHub moved one. The quieter one is the one I worry about. The [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) says that from December 1, 2026, every request to `gemini-2.5-pro` will be routed to `gemini-3.8-flash` and billed at 3.8 Flash rates. The model changes and the string in your code stays the same.

GitHub's December deadline will at least fail loudly. Claude Code 2.1.317 and 2.1.318 also shipped this week, and several of their changes make failures easier to see. So the theme of this post is things that break without telling you.

## Gemini: the reroute is the risk

`gemini-2.5-flash` gets the same treatment. Its requests go to `gemini-3.5-flash-lite` and are billed at Flash-Lite rates. Both 2.5 models are already gone from the AI Studio picker.

You can't just swap the model string, because the breaking changes are real:

- `thought_signature` validation on function calling
- `thinking_level` replaces `thinking_budget`
- sampling parameters removed
- prefilled model turns removed

On September 18 the same changelog said the 2.5 models "are not deprecated and will continue to be served until further notice." That lasted about six weeks.

Here's what I would do on Monday:

```bash
grep -rnE "gemini-2\.5-(pro|flash)|thinking_budget|temperature|top_p|top_k" src/
```

The November 2 entry doesn't name the removed sampling parameters, so I would also check any other sampling settings my code sends. Then I would look for any code that prefills the model's turn. I'd pin the replacement model myself and run my evals before December 1, rather than let the router make that choice for me.

## GitHub: the brownouts come first

[GitHub will block `pull_request_target` by default](https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2) starting December 2, unless an Actions event policy allows it. Enforcement was previously scheduled for November 2, so this pushes it back a month. It covers public repos on Free, Team and Enterprise Cloud. Private and internal repos are not affected, and neither is Enterprise Server.

The reason is that this trigger runs in the base repo's context with access to its secrets. If a workflow runs untrusted code from a fork, that code could compromise the pipeline or steal those secrets.

December 2 is not the real deadline, though. On November 9 and November 16, from 16:00 to 18:00 UTC, blocked workflows will fail with an error annotation. For now the rule is in evaluate mode, so Insights already shows which runs it would block.

You have two choices: keep the default block, or allow the trigger in a policy, which can target specific workflow files. I'd keep the block.

## Claude Code: logins expire on a date too

[2.1.318](https://github.com/anthropics/claude-code/releases/tag/v2.1.318) now shows when a stored claude.ai sign-in ends. `claude auth status` reports it as `loginExpiresAt`, and `claude -p` JSON results include `credential_expires_at`. Text output also prints a one-line stderr warning starting 10 days before expiry.

The catch is that a CI wrapper that throws away stderr will never show that warning. For headless jobs I would read `credential_expires_at` and alert on it, or move them to `claude setup-token`. When the login does run out, the sign-in error now says so, and in `claude -p` it names `claude auth login` and `claude setup-token`.

[2.1.317](https://github.com/anthropics/claude-code/releases/tag/v2.1.317) fixes a related silent failure. When a full disk or quota loses transcript or `~/.claude.json` writes, `claude -p` now prints an error and, in text and json output, exits 1 instead of 0. The notes add that full NFS exports may still be missed.

## "Tightening" is mostly better visibility

I'd be honest about how much these changes enforce:

- The email check *asks* before a web or shell call sends your account email to the network. It's a prompt, and people get used to clicking through prompts.
- `onFailure: "block"` is an option you add to Agent SDK hook callbacks. Once it's on, a flaky callback blocks the action, so I'd set timeouts and retries before turning it on.
- Auto mode now shows a notice when its check has no answer for a subagent's tool call. Before, that case left nothing in the main view.

A few changes could break existing setups:

- `deniedMcpServers` URL entries now also block Anthropic-provided servers whose upstream URL matches. They also block connectors in cloud sessions and on self-hosted runners, but only where the session is given the connector's own URL. Otherwise, the notes say to deny a connector by name.
- Self-hosted runner log lines changed. Scripts that match `retryable=true:` or `retryable=false:` need updating.
- Background subagents now move shell commands to the background after 3 minutes.
- The Read tool's "file unchanged" stub is gone. Re-reading a file now returns its full content, which costs tokens.

The GitHub change fails red during the brownouts, and an expired Claude login now tells you how to fix it. The Gemini changelog doesn't say what happens to a rerouted request that still sends `thinking_budget` or a prefilled turn. If such a request goes through, the swap on December 1 shows up as 3.8 Flash billing and slightly odd output, which can take a week to notice.

## Sources

- [v2.1.318](https://github.com/anthropics/claude-code/releases/tag/v2.1.318), Claude Code releases
- [v2.1.317](https://github.com/anthropics/claude-code/releases/tag/v2.1.317), Claude Code releases
- [pull_request_target blocked by default December 2](https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2), GitHub changelog
- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog), Gemini API changelog
