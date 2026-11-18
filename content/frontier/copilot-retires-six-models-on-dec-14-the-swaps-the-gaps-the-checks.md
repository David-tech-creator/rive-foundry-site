---
title: Copilot retires six models on Dec 14: the swaps, the gaps, the checks
date: 2026-11-14
summary: GitHub drops Claude Fable 5, Haiku 4.5, Gemini 3.8 Flash, Gemini 4 Argon, Grok 4.6 and Kimi K3 from Copilot on Dec 14. Gemini 4 Hydrogen is GA as the Flash replacement. Kimi K3 has no successor yet.
---

**The short version**

- Six Copilot models retire Dec 14, 2026 across Chat, agent mode and completions. GitHub suggests a successor for each one except Kimi K3, which is still "to be announced".
- Check your org model policies. If the global default is off, the replacements won't switch on by themselves. Annual individual plans keep Haiku 4.5.
- Hydrogen is billed at provider list price with no figures given. Rerun real tasks on it and compare cost per passing task before switching everyone over.

![Image from GitHub changelog: Upcoming deprecation of selected GitHub Copilot models in December](/logbook/frontier/copilot-retires-six-models-on-dec-14-the-swaps-the-gaps-the-checks.jpg)

*Image: [GitHub changelog](https://github.blog/changelog/2026-11-13-upcoming-deprecation-of-selected-github-copilot-models-in-december)*

GitHub posted a [deprecation notice](https://github.blog/changelog/2026-11-13-upcoming-deprecation-of-selected-github-copilot-models-in-december) on Nov 13. Six Copilot models go away on December 14, 2026, in Chat, inline edits, ask and agent modes, and code completions. The same day, [Gemini 4 Hydrogen went GA](https://github.blog/changelog/2026-11-13-gemini-4-hydrogen-in-github-copilot) as the new Flash model.

## The swap list

GitHub's suggested mapping:

- Claude Fable 5 → Claude Fable 5.2
- Claude Haiku 4.5 → Claude Haiku 5.5
- Gemini 3.8 Flash → Gemini 4 Hydrogen
- Gemini 4 Argon → Gemini 4 Carbon
- Grok 4.6 → Grok 4.7
- Kimi K3 → "To be announced"

Look at the dates. Fable 5.2 arrived in Copilot on Nov 9, Carbon on Nov 10 and Hydrogen on Nov 13. That means about a month of history before they become the default answer.

GitHub calls these "suggested alternatives". It never says they're equivalent. The changelog gives no specs or prices for Haiku 5.5 or Grok 4.7. Going from Haiku 4.5 to 5.5 might mean a different price tier, or it might not. The posts don't say, so I would check the Models and pricing page before assuming anything.

## The Haiku split

There is one exception, in GitHub's words: "Claude Haiku 4.5 will remain available to individual GitHub Copilot subscribers on annual plans."

That makes for an odd split. Someone on a personal annual plan keeps Haiku 4.5. The same person's Business seat loses it. If a team shares prompt files or agent setups that name Haiku 4.5, they may not work the same for everyone.

## Kimi K3 has no successor

The table says "To be announced". There's no date and nothing else. This next part is my opinion, not GitHub guidance: I would pick a stand-in now and run the Kimi K3 workloads on it for a few weeks. If GitHub names a successor before Dec 14, all I've lost is a comparison run.

## Where I would look before Dec 14

GitHub's request is short: "update your workflows and integrations to use the supported models before this date." It also says no action is needed to remove the models.

The posts don't say what happens after Dec 14 to anything that still asks for a retired model by name. It could be an error, a fallback or something else. I won't guess. My own checklist, not GitHub's:

- Copilot CLI scripts and shell aliases that pass a model name
- Coding agent and Copilot SDK configs
- Shared prompt files that mention a specific model
- Org model policies in Copilot settings

The policies are the one failure mode GitHub actually describes. For Business and Enterprise, the replacements switch on automatically, *unless* an admin has turned off the global default or explicitly disabled the model. In that case nothing replaces anything until an admin enables the new models. Users then see them in the Chat model picker.

Two more catches for Hydrogen. The rollout is gradual ("Check back soon if you don't see it yet"). It covers Pro, Pro+, Max, Business and Enterprise, and the Free plan isn't on that list.

## Pricing Hydrogen

The one pricing fact: "This model is billed at provider list pricing under usage-based billing." The post gives no figures and doesn't compare it with 3.8 Flash. I can't tell you whether the swap costs more or less.

What I would do is measure cost per finished task, not per token. A rough method:

1. Pull 20 to 30 real tasks from last month that ran on Gemini 3.8 Flash.
2. Rerun them on Hydrogen in the same mode (agent, CLI, whatever you use).
3. Count the ones that pass tests or review without a retry, and log the retries.
4. Divide Hydrogen's total usage cost by the number of passing tasks.

GitHub says Hydrogen has "improved instruction following over Gemini 3.8 Flash". If that's true for your tasks, you should see fewer retries, which can offset a higher list price. Your own eval tells you. The changelog can't.

December 14 is a Monday. I would rather find the stray `kimi-k3` string the Friday before.

## Sources

- [Upcoming deprecation of selected GitHub Copilot models in December](https://github.blog/changelog/2026-11-13-upcoming-deprecation-of-selected-github-copilot-models-in-december), GitHub changelog
- [Gemini 4 Hydrogen in GitHub Copilot](https://github.blog/changelog/2026-11-13-gemini-4-hydrogen-in-github-copilot), GitHub changelog
