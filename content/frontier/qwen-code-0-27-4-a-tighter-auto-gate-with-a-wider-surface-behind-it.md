---
title: Qwen Code 0.27.4: a tighter Auto gate with a wider surface behind it
date: 2026-11-16
summary: Qwen Code 0.27.4 changes how Auto Mode judges risky actions, and it also gives managed agents local folders, a web terminal and Feishu/WeCom webhooks. These are the settings I would check after upgrading.
---

**The short version**

- Auto Mode's classifier now asks whether you explicitly authorized an action. If it times out, the session model can review once and allow or block.
- Managed agents gain temporary local directory grants, a WebSocket web terminal, and send-only Feishu and WeCom webhooks. DingTalk is nightly-only.
- After upgrading, check Feishu webhook signing secrets, who can reach the web terminal, and PR watch. PR watch moved to the operator-only serve.sessionPrWatch setting.

![Comparison: Qwen Code 0.27.4's Auto gate now checks explicit authorization, while managed agents gain directory grants, a web terminal and Feishu/WeCom webhooks.](/logbook/frontier/qwen-code-0-27-4-a-tighter-auto-gate-with-a-wider-surface-behind-it.svg)

Qwen Code 0.27.4 shipped on 15 November. Desktop 0.27.4 came out the same day, and so did TypeScript SDK 0.1.34, which bundles the same CLI. The [release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.27.4) say "No known breaking changes." I read them twice anyway. The permission changes and the managed-agent changes pull in opposite directions, and that tension is the interesting part of this release.

## What Auto Mode now judges

The headline change is #16858. The AUTO classifier now judges whether the user explicitly authorized an action, "rather than mere relevance". The notes say this matters most for destructive, discarding, shared-history and bulk actions.

Calling it "stricter" is my reading, not a measured result. The notes give no false-positive or false-negative numbers. If the change works as described, I would expect more prompts when you ask for "clean up the branch" and the agent reaches for something irreversible. That's a guess until someone publishes numbers.

A second change, #17146, pushes the other way. If the fast classifier times out, the session model can review the action once "when identifiers differ". It then allows or blocks the action under existing policy. So a timeout can end with a second opinion from an LLM. That might be the right trade, but it puts a non-deterministic judge inside the gate.

#17127 is a Windows fix. AUTO mode stops doing filesystem resolution on HTTP(S) URLs, which had caused UNC lookup delays and killed sessions before requests started. It fixes a bug and leaves the policy alone.

## The red Full Access button

#17100 shows the Full Access (yolo) trigger in the web shell composer in the destructive color. That is the whole change. The notes mention no confirmation step, no behavior change and no CLI effect. It's a nice warning, but it isn't a safety control, and I wouldn't count on it to stop anything.

## Meanwhile, the surface got wider

Managed agents gained a lot in this release:

- **#16844**: sessions can use the browser user's local filesystem through temporary directory grants, "without persisting credentials or paths". The notes don't spell out the scope, the duration or how you revoke a grant.
- **#16866**: an interactive Managed Web Terminal. It uses a short-lived ticket for authenticated WebSocket access and keeps the runtime alive while you're attached.
- **#17013**: a send-only Feishu webhook connection with a secret URL. The signing secret is *optional*.
- **#17224**: a send-only WeCom webhook connection with group URL configuration, channel control and scheduled delivery selection.
- **#17223**: WeCom group delivery for Notify outputs, prompt results and supported scheduled-task results.
- **#17002**: long channel replies are split into ordered segments, with a visible truncation notice if the segment limit is exceeded.

A correction to the version story: DingTalk is not in 0.27.4. The DingTalk adapter (#17136) appears only in the [15 November nightly](https://github.com/QwenLM/qwen-code/releases/tag/v0.27.3-nightly.20261115.6e3b2dcc19), which came after this release.

Put the two halves together and the gate got more careful while the territory behind it grew. Agent output landing in a group chat is a data path. My own inference, which the notes don't confirm: a secret URL with no signing secret probably lets anyone holding that URL post to the channel.

## The change most likely to bite

PR watch is now operator-owned through the operator-only `serve.sessionPrWatch` setting (#17214). GitHub channel state-transition delivery is retired. If your team relied on PR status updates arriving through that GitHub channel, they could stop after the upgrade. The release still lists no breaking changes.

## What I would do on Monday

The release asks for none of this. It's my own checklist:

1. Upgrade, then run one destructive request through AUTO on purpose, on a throwaway branch, and see whether it prompts.
2. For every Feishu webhook, set the signing secret and treat the URL like a password.
3. Decide which group chats should receive prompt results at all, then use channel control to limit delivery to those.
4. Check who can open the Managed Web Terminal, and remember that a session stays alive while someone is attached.
5. If you used GitHub PR-watch delivery, set it up again under `serve.sessionPrWatch`:

```json
{ "serve": { "sessionPrWatch": "..." } }
```

The value format isn't documented in the notes, so check the docs before you copy that.

There's a quieter change too. The `experimental.unifiedAgentLoop` flag now reaches AgentCore, both TUIs, ACP and the Hosted Harness. You can force it on or off with overrides like `headless,acp=0`, and Hosted Harness still defaults to the legacy loop. I would leave it alone for now. The webhooks need attention first.

## Sources

- [Release v0.27.4](https://github.com/QwenLM/qwen-code/releases/tag/v0.27.4), Qwen Code releases
- [Qwen Code Desktop v0.27.4](https://github.com/QwenLM/qwen-code/releases/tag/desktop-v0.27.4), Qwen Code releases
- [Release v0.27.3-nightly.20261115.6e3b2dcc19](https://github.com/QwenLM/qwen-code/releases/tag/v0.27.3-nightly.20261115.6e3b2dcc19), Qwen Code releases
- [SDK TypeScript Release v0.1.34](https://github.com/QwenLM/qwen-code/releases/tag/sdk-typescript-v0.1.34), Qwen Code releases
