---
title: Gemini Decision 1 is out: where I'd swap an LLM call for a decision model
date: 2026-11-12
summary: Google shipped gemini-decision-1 and a Decisions API for closed-set questions. Its clear edge over Jev is multimodal input, and its scores need checking against your own labels.
---

**The short version**

- Google released gemini-decision-1 and the Decisions API on Nov 11. It gives yes/no, choice and rubric answers with zero output tokens, from text up to video and PDFs.
- Reported price and speed trail Jev: $0.10 vs $0.042 per 1M input tokens, 211 vs 92 ms (Artificial Analysis). Gemini's edge is audio, video and PDF input.
- Before you swap out an LLM call, label real cases, run your LLM, Jev and Gemini on them, and pick thresholds from a reliability curve.

![Table comparing Gemini Decision 1 and Jev: Jev is cheaper ($0.042 vs $0.10 per 1M input tokens) and faster (92 vs 211 ms); Gemini also reads images, audio, video and PDFs.](/logbook/frontier/gemini-decision-1-is-out-where-i-d-swap-an-llm-call-for-a-decision-mod.svg)

Google shipped a model that never writes a sentence. On November 11 the [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) listed `gemini-decision-1` and a new Decisions API. They're built for "fast, calibrated binary, categorical, and rubric decisions," they produce "zero output tokens," and they take text, images, audio, video and PDFs.

That's everything the official source confirms. The rest of this post leans on Simon Willison and Latent Space, so read each spec below as reported until it's been checked.

## What it reportedly does

According to [Latent Space](https://latent.space/p/ainews-d-day-decision-models-day/), the model scores a closed set of options in one pass instead of generating tokens. It handles yes/no, multiple choice with up to 255 options, and rubric scoring. The same report claims up to 1,000 questions per request and a 256K context window. The changelog links to pricing, rate-limit and guide pages. I'd check those before building on any of these numbers.

[Willison](https://simonwillison.net/2026/Nov/11/gemini-decisions-api/) calls the API "almost identical to Jev," right down to borrowing Jev's word "Noul" for a yes/no question. He ran it on a video of a stomping robot and got:

- robot: 0.923
- dragon: 0.0498
- USA: 0.923
- France: 0.083

He says Jev and OpenAI return a hard 1.0 or 0.0. So Gemini gives soft scores, but four numbers from one video say nothing about calibration. The only aggregate figure is a Brier score of 0.18 from Artificial Analysis, and nobody gives a baseline to compare it with.

## Price and latency: Jev still wins on text

These figures all come from secondary sources:

- **Gemini Decision 1:** $0.10 per 1M input tokens, output free
- **OpenAI's GPT-6 Luna decision model:** $0.10 per 1M input tokens, output free
- **Jev:** $0.042 per 1M input tokens

Artificial Analysis puts the cost per million tasks at $345 for Gemini, $156 for Jev and $103 for Drex Max. Google claims about 200 ms end to end. Artificial Analysis measured 211 ms against 92 ms for Jev. I found no latency figure for OpenAI.

"Zero output tokens" sounds like a perk, but Jev's output price isn't stated anywhere, so there's nothing to compare it with.

Gemini's real advantage is modality. Willison says Jev reads only text and JSON, and OpenAI reads text and images. Gemini adds audio, video and PDFs. Expect per-task costs on video to look nothing like the text numbers.

## The benchmarks are close

Google says Decision 1 beats Jev 1.14 on 5 of 7 shared benchmarks and scores 92.2% to Jev's 90.0% on JevBench. Those are the vendor's numbers, and the gap is small.

Artificial Analysis gives it 66 on its Decision Index. That ties Jev 1.14 and sits 7 points behind Drex Max v1.1 and GLiDE v1.2. On AA-Paperclip it gets every question right on only 33% of documents, against 63% for Drex Max. That matters if you plan to send many questions about one PDF in a single call.

## Where I would swap one in

The early examples are mostly experiments and demos. Stitch built a rapid-design experiment on the Decisions API itself. At AI Engineer, Cloudflare described a hybrid agent where fast decision models handle tool selection and log extraction, and a large reasoning model handles only diagnosis. In its demo that cut six LLM calls to one and about 40K tokens to 1.8K.

On the [Jev](https://latent.space/p/jev-revolution/) side, Glean says it uses Jev alongside LLMs and other classifiers, and values its "zero-shot flexibility." UiPath showed a test of Jev ranking document chunks.

The candidates below are my own guesses. No source covers them:

- **Agent routing:** picking a tool from a fixed list.
- **PR triage:** rubric questions like "does this diff touch auth?"
- **Guardrail gates:** a cheap first pass. A confident score is something attackers can aim at, so I'd keep a second check behind it.
- **Eval grading:** rubric scores at scale. You get no rationale back, so auditing a bad grade is hard.

All four are closed-set questions. Anything open-ended still belongs with an LLM.

## A Monday plan

No source says to do this. It's just how I'd approach it:

1. Pull a few hundred real cases from your logs and label them.
2. Run your current LLM call, Jev and Gemini Decision 1 on the same set. The APIs are nearly the same shape, so this should be cheap.
3. Plot a reliability curve and pick thresholds from it, not from intuition.
4. Test the batch sizes you'd actually use, and watch both latency and accuracy.
5. Pin the model version and re-run the set whenever it changes.

Diogo Almeida, who led the work on Jev, says LLMs give you "Einstein 95% of the time, but Mr. Bean 5% of the time." A decision model is one day old and could have a Mr. Bean rate of its own. What I most want to find out is how many of my current prompts were really multiple-choice questions.

## Sources

- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog), Gemini API changelog
- [Gemini Decisions API](https://simonwillison.net/2026/Nov/11/gemini-decisions-api/), Simon Willison
- [AINews D-Day (Decision Models Day)](https://latent.space/p/ainews-d-day-decision-models-day/), Latent Space
- [The Jev Revolution: What Engineers Are Already Building with System One Models](https://latent.space/p/jev-revolution/), Latent Space
