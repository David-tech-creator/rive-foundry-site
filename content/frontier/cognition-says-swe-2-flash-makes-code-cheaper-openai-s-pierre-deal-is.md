---
title: Cognition says SWE-2 Flash makes code cheaper. OpenAI's Pierre deal is about reviewing it
date: 2026-11-05
summary: Cognition's blog index lists SWE-2 Flash with no price or speed figures. The same day, OpenAI said it will buy Pierre, the team behind Codex's diff tooling. Cost per reviewed change is what I would test.
---

**The short version**

- SWE-2 Flash is announced, but the blog index gives no price, speed, benchmark or availability. Read the full post before planning a test.
- OpenAI will buy Pierre, whose Trees and Diffs already power Codex review. The deal hasn't closed, so nothing in Codex changes this week.
- Run one harness on your own repo tasks and measure cost per accepted change and reviewer minutes. Treat Kimi K3.1 Pro as unconfirmed.

![Side-by-side comparison: SWE-2 Flash says it makes writing code cheap, while reviewing code (Pierre) still costs the same. Measure cost per accepted change and reviewer minutes.](/logbook/frontier/cognition-says-swe-2-flash-makes-code-cheaper-openai-s-pierre-deal-is.svg)

On 4 November Cognition published a post called "Introducing SWE-2 Flash". The [blog index](https://cognition.ai/blog) describes it in one line: "a fully American coding model that sets a new bar for intelligence at low cost and high speed." That line gives no price and no tokens per second. There is no benchmark either, and nothing on whether it ships in Devin, Windsurf, the CLI or an API. My notes only cover the index, so that line is everything I have.

On the same day, OpenAI said it [will acquire Pierre Computer Company](https://openai.com/index/openai-to-acquire-pierre). Pierre makes the Trees and Diffs libraries that already run file browsing and change review in the Codex app. Taken together, the two announcements tell one story. Writing code keeps getting cheaper, and reading it still costs the same.

## What is known about SWE-2 Flash

Cognition's earlier releases hint at what Flash might look like, and they prove nothing about it. SWE-1.5 ran on Cerebras at up to 950 tok/s, which Cognition called "13x faster than Sonnet 4.5". SWE-Check claimed to match Opus 4.6 on internal evals while running "~10x faster". In September, SWE-2 was described as "pushing the Pareto frontier of capability and inference cost". Every one of those is a vendor claim about a different model.

Any Flash numbers will probably cite FrontierCode 2.0, though that isn't confirmed. Open-source maintainers grade that benchmark on whether agent output is "actually mergeable", which is a good thing to measure. It also belongs to Cognition, so it can't independently check Cognition's own model.

## Pierre: what you can use today

The deal is still open. It needs regulatory approval, and until it closes OpenAI and Pierre stay separate companies. The post doesn't give a price or a closing date, so Codex doesn't change this week.

Here is what the post describes:

- **Diffs Edit mode**, where a reviewer fixes a line directly in the diff.
- **Highlights**, a syntax highlighter that updates as an agent streams code.
- **Code Storage**, a service that lets apps store code and track its history using Git. Customers can keep using it, and OpenAI is working to bring its features into Codex.

OpenAI says Pierre's open-source projects "will remain open-source", but it gives no license or governance detail. It also runs Pando, its own in-house source-control backend, which it wrote about on 2 November. How Code Storage and Pando fit together is an open question, and lock-in depends on the answer.

I have a question about Edit mode too. Fixing a line inside the diff is fast. It also makes it easy to patch an agent's symptom without asking why the agent got it wrong. I would want to know whether it improves review quality or only speeds it up.

## Kimi K3.1 Pro: all of this is unconfirmed

A [Hugging Face model card](https://huggingface.co/moonshotai/Kimi-K3.1-Pro) surfaced through Hacker News, and I have no official Moonshot source, so treat everything below as unconfirmed. The card describes a 2.8T-parameter MoE with 104B active, a 1M-token context, and an API model called `kimi-k3.1-pro` with OpenAI- and Anthropic-compatible endpoints.

Moonshot's own table gives mixed results:

- **DeepSWE v1.1:** Kimi 75.5, Opus 5.5 74.2. DeepSeek-V4.1-Flash-1017 beats both at 77.0.
- **ProgramBench:** Kimi 31.5, Opus 5.5 65.0.

Kimi was evaluated mostly with the Claude Code harness, and several competitor scores come from other parties, so the rows aren't like-for-like. Self-hosting 104B active parameters needs serious hardware. The custom license terms aren't described.

## What I would run on Monday

Instead of four separate checklists, I would use one harness:

1. Pick 15 to 20 closed tickets from my own repo that already have merged fixes.
2. Run them through my current model. Add Kimi through the API only if the license terms check out, and add SWE-2 Flash once Cognition publishes price and access.
3. Record cost per accepted change, wall-clock latency, reviewer minutes per diff, and how many lines get edited during review.
4. Review every diff in the same viewer, so the tooling isn't a variable.

The number I care about most is reviewer minutes. If a model cost a tenth as much but doubled review time, it could still cost more overall, depending on what an hour of reviewer time costs.

Cognition's full post will probably answer the price question. No vendor post will measure reviewer minutes on my repo, so that part of the test is mine to run.

## Sources

- [Cognition blog](https://cognition.ai/blog), Cognition blog
- [OpenAI to acquire Pierre Computer Company, Inc.](https://openai.com/index/openai-to-acquire-pierre), OpenAI news
- [Welcome Pierre Computer Company to OpenAI!](https://www.linkedin.com/in/thegdb/recent-activity/all/), Greg Brockman (OpenAI) on LinkedIn
- [Introducing Images 2.6](https://openai.com/index/introducing-images-2-6), OpenAI news
- [Kimi K3.1 Pro model weights are out](https://huggingface.co/moonshotai/Kimi-K3.1-Pro), Hacker News top stories
