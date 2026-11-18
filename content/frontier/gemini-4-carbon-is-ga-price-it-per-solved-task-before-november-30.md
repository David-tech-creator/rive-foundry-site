---
title: Gemini 4 Carbon is GA: price it per solved task before November 30
date: 2026-11-11
summary: Gemini 4 Carbon is out at $2/$10 per million tokens until November 30. Google still recommends Argon for most coding, so the useful test is cost per solved task on the bugs Argon can't fix.
---

**The short version**

- gemini-4-carbon went GA on Nov 10 at $2/$10 per 1M tokens through Nov 30. Reports of a December price doubling are unconfirmed.
- Google says Argon stays the better pick for most engineering work. Test Carbon only on the tasks where Argon fails.
- Compare cost per solved task, not price per token, because Carbon burns more tokens. Admins may need to enable it in Copilot.

![Comparison: Carbon's $2/$10 per 1M token price misleads because it burns more tokens; instead divide token cost by tasks solved. Price holds to Nov 30.](/logbook/frontier/gemini-4-carbon-is-ga-price-it-per-solved-task-before-november-30.svg)

Google made Gemini 4 Carbon generally available on November 10, under the model ID `gemini-4-carbon`. The [changelog](https://ai.google.dev/gemini-api/docs/changelog) calls it Google's "most capable reasoning model built for sustained agentic coding, multimodal knowledge work, scientific reasoning, and cybersecurity defense." The launch price is $2 per million input tokens and $10 per million output tokens. That price is guaranteed through November 30.

Nothing official says what happens on December 1. [Simon Willison](https://simonwillison.net/2026/Nov/10/llm-gemini/) writes that the price doubles to $4/$20, and [The Verge](https://www.theverge.com/ai-artificial-intelligence/1030787/google-gemini-4-carbon-public-rollout) says costs "double at the end November." Google's [blog post](https://deepmind.google/blog/gemini-4-carbon-is-now-available/) only calls $2/$10 the "same introductory price as Gemini 4 Argon" and gives no later price. So the doubling is unconfirmed. The November 30 end date is the only firm deadline.

## Google itself says start with Argon

The launch post is surprisingly frank about this. "Argon remains the ideal choice for the majority of software engineering and knowledge work," it says. Carbon is meant for "complex, multi-step coding and debugging and open-ended scientific research and discovery."

Google's benchmark claims are strong. Carbon ranks #1 on CursorBench 4.0, Perplexity's WANDR and Zapier's AutomationBench, at "more than 2X lower cost per task compared to the next best external model." But the vendor picked those benchmarks.

My default would be to stay on Argon. I would send Carbon only the tasks where Argon gets stuck.

## Price per token is the wrong number

Google says Carbon uses "more tokens than Argon to explore thoroughly, reason deeply, and run extended verification loops." The Verge makes the same point from the other side: a lower per-token price "doesn't necessarily translate to lower costs." If Carbon spends three times the output tokens on a bug, the sticker price stops mattering.

Willison says Carbon offers low, medium and high thinking effort and defaults to medium. That is also unconfirmed. Either way, more thinking means more tokens and a longer wait. On an agent loop with twenty steps, that wait adds up.

## A small protocol for the next three weeks

"Benchmark it on your own repos" only helps with a method attached. Here is the one I would try:

1. Pick 15 to 30 real tasks from your repos that Argon failed or barely passed. Bugs with a failing test are ideal.
2. Define "solved" as the tests pass and a reviewer would merge the diff.
3. Run each model three times per task, because one run tells you very little.
4. Log input tokens, output tokens and wall-clock time for every run.
5. Work out the cost at $2/$10 and again at $4/$20, in case the doubling is real.

```
cost_per_solved = sum(in_tok * in_price + out_tok * out_price) / tasks_solved
```

If Carbon solves four hard bugs that Argon never cracked, that is worth paying for. If it solves the same bugs at twice the token count, it is not.

## Where to run it

In [GitHub Copilot](https://github.blog/changelog/2026-11-10-gemini-4-carbon-in-github-copilot), Carbon is generally available for Pro+, Max, Business and Enterprise. It appears in the model picker in VS Code, JetBrains, Xcode, the Copilot CLI, the coding agent and more. The fine print matters more than that list, though:

- Rollout is gradual, so your picker may not show it yet.
- It bills at provider list pricing under usage-based billing.
- On Business and Enterprise, admins control it through the model policy. It is on by default unless the global default or this model has been switched off.

Fable 5.2 arrived in Copilot on November 9, so both models sit in the same picker. That makes a side-by-side comparison on the same task set easy.

For the Gemini CLI, [v0.69.0-preview.0](https://github.com/google-gemini/gemini-cli/releases/tag/v0.69.0-preview.0) is a pre-release. It adds a `/stats heatmap` subcommand for daily token usage. That shows which days burned the most tokens, but it does not give you cost per task, so keep your own log. The same release lets `/model` take a model name directly. It also makes the 60-second API headers timeout configurable, which can help when thinking runs long:

```
/stats heatmap
export GEMINI_API_HEADERS_TIMEOUT_MS=180000
```

The 180000 is my own guess at a sensible value, so tune it to your setup.

Three weeks at $2/$10 is a cheap way to find out whether Carbon solves anything Argon can't. If it does, the result might just be a routing rule that sends a handful of hard bugs to Carbon while Argon keeps everything else.

## Sources

- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog), Gemini API changelog
- [Gemini 4 Carbon is now available](https://deepmind.google/blog/gemini-4-carbon-is-now-available/), Google DeepMind blog
- [Gemini 4 Carbon in GitHub Copilot](https://github.blog/changelog/2026-11-10-gemini-4-carbon-in-github-copilot), GitHub changelog
- [llm-gemini 0.36](https://simonwillison.net/2026/Nov/10/llm-gemini/), Simon Willison
- [Google releases Gemini 4 Carbon with agent ‘swarm’ feature](https://www.theverge.com/ai-artificial-intelligence/1030787/google-gemini-4-carbon-public-rollout), The Verge AI
- [Release v0.69.0-preview.0](https://github.com/google-gemini/gemini-cli/releases/tag/v0.69.0-preview.0), Gemini CLI releases
