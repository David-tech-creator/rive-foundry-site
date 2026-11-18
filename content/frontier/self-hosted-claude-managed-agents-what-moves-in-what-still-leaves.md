---
title: Self-hosted Claude Managed Agents: what moves in, what still leaves
date: 2026-11-15
summary: On Nov 12 Anthropic let you run the whole Managed Agents service on your own infrastructure. Agent state now stays with you. Prompts still go out by default, and plenty is still unstated.
---

**The short version**

- Since Nov 12 you can self-host the whole Managed Agents service. Agents, sessions and history stay on your side. Access goes through your account team.
- Model requests still go to Anthropic by default. Fable 5.2 and Mythos 5.2 require 30-day retention. Status, pricing and parity aren't stated anywhere.
- Before you migrate, ask how web fetch/search policy, OTel and workflows work without the Console, and plan for the Oct 21 SDK major bumps.

![Comparison: self-hosting keeps agents, sessions and history on your side; model requests still go to Anthropic by default and Fable/Mythos 5.2 need 30-day retention.](/logbook/frontier/self-hosted-claude-managed-agents-what-moves-in-what-still-leaves.svg)

On November 12 Anthropic shipped something I didn't expect this soon. You can now run the whole Managed Agents service on your own infrastructure. Self-hosted sandboxes already existed. Per the [release notes](https://docs.claude.com/en/release-notes/overview), the new part is everything else: agents, sessions and session history are now stored on your side.

That matters if you liked Managed Agents but winced at session history sitting on someone else's disks. It's also gated. You ask your Anthropic account team. There is no button.

## What stays home, what still travels

The exact wording is worth reading. "The server sends model requests to the provider that you choose, which is Anthropic by default." So the orchestration and the state move in. Unless you pick another provider, the prompts still go out.

The Nov 9 notes launched Claude Fable 5.2 and Mythos 5.2. They don't mention self-hosting, but a few of their rules are worth reading next to this one. Both models require 30-day data retention. They aren't available under zero data retention unless Anthropic expressly authorizes it. Their thinking blocks only work in the account that produced them or a linked one. If you edit the prefix and then resend a later thinking block, you get a 400.

My own reading: route a self-hosted server to those models and your history stays local while your prompts sit in a 30-day window somewhere else.

The source doesn't say anything about beta or GA status, pricing, infrastructure requirements, which non-Anthropic providers work, or parity with the hosted service. I'd treat all five as open questions.

## Questions for the account team

Everything below is a hosted feature. The notes don't say whether any of it exists when you self-host, and several of these depend on the Console.

- **Web fetch:** since Oct 20, admins can switch it off on the Console Capabilities page. A URL, including one reached by redirect, must pass both the org domain list and the tool's `allowed_domains`/`blocked_domains`. Where does that policy live when the server is yours?
- **Web search:** sessions follow the org's "Allow web search" setting (Oct 6) and its domain restrictions (Oct 14). Same question.
- **OpenTelemetry** (Oct 14, beta): the SDKs emit their own spans. API spans need a destination added in the Console.
- **Dynamic workflows** (Oct 9, beta): you need the `managed-agents-2026-04-01` header and this setting:

```json
"multiagent": {"type": "multiagent_20261001", "workflows": {"type": "enabled"}}
```

The server runs workflows in the background and you track them through `workflow_run.*` events. If dynamic workflows work on a self-hosted server at all, does that background run on your hardware?

- **Scheduled deployments:** the notes only list these for Claude Platform on AWS.

## The bill that comes with the keys

If you run the service, someone on your side handles upgrades, HA, the database, secrets and sandbox scaling. The notes don't list any requirements, so I'd ask for them first.

Version skew is one more question for the list. The notes don't say how a self-hosted server keeps up with beta headers and API versions. The Oct 21 SDKs default to API version 2026-10-21, and they're major bumps: Python 2.0.0, TypeScript 1.0.0, Go 2.0.0, Java 3.0.0, ant CLI 2.0.0. They also moved from MIT to Apache 2.0. So that's a code review and a legal review in the same sprint.

I'd also ask whether existing hosted sessions and history can move over. The docs navigation lists a "Migrating to Managed Agents" guide, but I didn't see what's in it.

## A glance at Qwen Code

This isn't a fair head-to-head. Anthropic announced a feature. [Qwen Code v0.27.2-nightly.20261113](https://github.com/QwenLM/qwen-code/releases/tag/v0.27.2-nightly.20261113.6f754be654) is a changelog for a pre-release. Still, it shows another project working through managed sessions in public.

A few items are visible to users, mostly from @wenshao:

- client filesystems registered into managed sessions (#16844)
- a Managed Web Terminal (#16866)
- fixed-interval `/loop` schedules (#17088)

A handful of lock and tenant-guard fixes come from @doudouOUC. One example: stopping a legacy CSI guard from gap-locking other Sessions (#17069). A deleted `JdbcRuntimeBrokerSchema` alias hints at a database-backed broker, though one class name is thin evidence. Tenancy, locks and schedules are exactly what you take on when you self-host.

## Colour, unconfirmed

Two items come from [Addy Osmani's LinkedIn](https://www.linkedin.com/in/addyosmani/recent-activity/all/) and aren't in the official notes. Claude Code desktop reportedly gets mods: custom themes, animated backdrops and a `theme-examples` plugin, in local sessions for now. Pro, Max, Ultra and Team users also reportedly get a free usage reset under Settings > Usage, usable before December 10 at 2:00 PM PT. It's worth ten seconds to check.

On Monday I'd send one email with those open questions in it. Agent state now stays on your machines. Whether your web fetch, search and telemetry policies come with it is what I'd want in writing first.

## Sources

- [Claude release notes](https://docs.claude.com/en/release-notes/overview), Claude release notes
- [Release v0.27.2-nightly.20261113.6f754be654](https://github.com/QwenLM/qwen-code/releases/tag/v0.27.2-nightly.20261113.6f754be654), Qwen Code releases
- [You can now build custom themes for Claude Code on desktop! Mods let you change colors, ad](https://www.linkedin.com/in/addyosmani/recent-activity/all/), Addy Osmani (Anthropic) on LinkedIn
- [We've given all Claude Pro, Max, Ultra, and Team users a free reset, across all models and](https://www.linkedin.com/in/addyosmani/recent-activity/all/), Addy Osmani (Anthropic) on LinkedIn
