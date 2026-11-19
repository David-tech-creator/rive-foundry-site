---
title: Gemini 4 Neon is GA: price it per solved task before making it default
date: 2026-11-19
summary: Gemini 4 Neon is out in the API and Copilot. Google claims near-Carbon quality at lower cost per task, but per token it costs more than Carbon this month, so I'd measure it on my own repo first.
---

**The short version**

- Gemini 4 Neon (gemini-4-neon) went GA on Nov 18 in the Gemini API and GitHub Copilot, at $3/$15 per 1M input/output tokens.
- Google claims 32% lower cost per task than Carbon at high, but Carbon's intro price is $2/$10 until Nov 30, so Neon must use far fewer tokens to win.
- Before making it your default, run 20 or so real tasks from your own repo and divide the total spend by the number that passed tests.

![Table comparing Gemini 4 Neon ($3/$15 per 1M tokens) with Carbon's intro price ($2/$10): one example task costs $1.65 vs $1.10, so Neon must use under 2/3 the tokens.](/logbook/frontier/gemini-4-neon-is-ga-price-it-per-solved-task-before-making-it-default.svg)

Gemini 4 Neon went GA on November 18. The model ID is `gemini-4-neon` and it's live in the [Gemini API](https://ai.google.dev/gemini-api/docs/changelog), and it's rolling out in [GitHub Copilot](https://github.blog/changelog/2026-11-18-gemini-4-neon-in-github-copilot) the same day. The pitch is a model I'd happily make my default for coding: close to Carbon quality, cheaper per task, quicker to start answering, and less likely to touch files I never asked about.

That pitch is Google's, though, and GitHub's changelog is careful to say "according to Google". So I wouldn't flip the default on Monday. I'd do the arithmetic first.

## What Google claims

The [DeepMind post](https://deepmind.google/blog/introducing-gemini-4-neon/) from Koray Kavukcuoglu gives these numbers:

- At the default `high` thinking level, cost per task is 32% lower than Carbon.
- 50% to 80% cheaper per task than the top competing frontier models at `high`, and 36%+ cheaper at `xhigh`.
- Compared with Carbon, under-service is down 43% to 56% and overreach is down 15% to 35%.
- Shortcuts on 2.45% of tasks in Google's coding cheating eval, the lowest of any Gemini 4 model.

The leaderboard picture is mixed. Neon is #1 on the Artificial Analysis Coding Agent Index (58.6), #2 on Vals (70.9%) and #2 on Agent Arena, then #3 on the Intelligence Index at `xhigh`. Google reported all of these itself.

## The per-token catch

Neon costs $3.00 per 1M input tokens and $15.00 per 1M output tokens. Carbon is on introductory pricing of $2.00/$10.00 until November 30. So right now Neon's per-token price is 1.5x Carbon's.

That makes the break-even simple. For the rest of November, Neon has to finish a task in under two thirds of the tokens Carbon needs. The post doesn't say which Carbon price the 32% figure assumes. My notes also don't show what Carbon will cost from December 1, so this math could change in two weeks.

Here's a made-up task: 400k input tokens and 30k output tokens. At the same token count, Neon comes to $1.65 and Carbon to $1.10. Neon only wins if it really does cut down on "redundant file reads", as Google says it does.

Cached input is $0.15 per 1M tokens, a 95% discount. That helps only if your agent loop actually gets cache hits. Check your logs before you count on it.

## What I would run

I'd pick about 20 recently closed issues from one real repo, each with a test that proves the fix. Then:

1. Run every task on Neon at `high`, and again on Carbon.
2. Run Neon at `medium` too, since `high` may waste tokens on easy tasks.
3. Log the input, cached and output tokens for every run, including the ones that fail.
4. Divide the total spend by the number of tasks whose tests passed.

```
cost_per_solved =
  (input*3.00 + cached*0.15 + output*15.00) / 1e6
  / tasks_passed
```

I'd also count unrequested diffs by hand. That's the claim I care about most, because cleaning up after a model costs more than any token bill.

## Getting it in Copilot

In Copilot, Neon works on Pro+, Max, Business and Enterprise. It's billed at provider list pricing under usage-based billing. It shows up in the model picker in VS Code, Visual Studio, the Copilot CLI, the coding agent, JetBrains, Xcode, Eclipse and GitHub Mobile.

The rollout is gradual, so some of your team may not see it yet. On Business and Enterprise, new models are on by default unless an admin has disabled them in the model policy. That's worth knowing before a few people quietly switch while everyone else stays on the old model.

If Neon wins my 20 tasks on cost per passed test, I'll make it the default. If it only wins on the leaderboards, I'll hold off and rerun the numbers once Carbon's December pricing is published.

## Sources

- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog), Gemini API changelog
- [Introducing Gemini 4 Neon](https://deepmind.google/blog/introducing-gemini-4-neon/), Google DeepMind blog
- [Gemini 4 Neon in GitHub Copilot](https://github.blog/changelog/2026-11-18-gemini-4-neon-in-github-copilot), GitHub changelog
- [v2.1.328](https://github.com/anthropics/claude-code/releases/tag/v2.1.328), Claude Code releases
- [Inside the Codex sandbox](https://openai.com/index/inside-the-codex-sandbox), OpenAI news
- [Wait for pull request events with GitHub CLI](https://github.blog/changelog/2026-11-18-wait-for-pull-request-events-with-github-cli), GitHub changelog
