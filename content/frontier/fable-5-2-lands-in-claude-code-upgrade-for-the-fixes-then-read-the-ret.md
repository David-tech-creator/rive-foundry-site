---
title: Fable 5.2 lands in Claude Code: upgrade for the fixes, then read the retention terms
date: 2026-11-10
summary: Claude Code 2.1.321 makes Fable 5.2 the default Fable model. It fixes three permission and sandbox gaps and an MCP OAuth token leak. Before you switch models, check the retention rules on Copilot and Bedrock.
---

**The short version**

- Upgrade to Claude Code 2.1.321 or later now. It fixes an MCP OAuth token leak, a sandbox bypass and two Bash write-permission gaps.
- Fable 5.2 costs $8/$40 per Mtok with 1M context. Mike Krieger still calls Opus 5.5 the daily driver.
- On Copilot and Bedrock, Fable 5.2 keeps your data by default. The ZDR exemptions end on different dates. Check them before you flip the policy.

![Table comparing Fable 5.2 data retention on GitHub Copilot and Bedrock, and when each one's zero-data-retention exemption ends: end of calendar year vs at least June 30, 2027.](/logbook/frontier/fable-5-2-lands-in-claude-code-upgrade-for-the-fixes-then-read-the-ret.svg)

[Claude Code v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321) shipped on 09 Nov with Claude Fable 5.2 (`claude-fable-5-2`) as the new default *Fable* model. That word matters. The notes say Fable 5.2 replaces 5.1 inside the Fable tier. They don't make it the Claude Code default overall, and my first draft of this post got that wrong.

The numbers: 1M context, $8 per Mtok input, $40 output, $0.20 for cache reads. The same release also fixes some security holes, and I'd deal with those first.

## Upgrade for the fixes, whatever model you pick

Version 2.1.321 fixes four security bugs:

- MCP OAuth requests could send secrets like refresh tokens to another host when a server redirected them.
- A read-only Bash command could run outside the sandbox without a permission prompt.
- Bash permission checks could judge a file write from the wrong folder and skip the prompt.
- Deny rules and protected-file prompts didn't apply to the file that a `cp` or `mv` into a directory writes.

The notes give no severity, no exploit preconditions and no CVE. So I can't tell you whether you were exposed. If you use OAuth-backed MCP servers or rely on deny rules to keep the agent away from sensitive files, those were the protections with holes. That alone is reason enough to upgrade.

[2.1.322](https://github.com/anthropics/claude-code/releases/tag/v2.1.322) followed on 10 Nov and adds fast mode on Vertex in the global, us and eu regions. If Vertex refuses fast mode, it falls back to standard speed. Useful if you run Claude Code on Vertex, minor if you don't.

## What switches on its own

Saved Fable 5.1 picks move to `fable`. On Pro and Max that happens immediately. On Team and Enterprise it waits until the org allows it. To go back:

```
/model claude-fable-5-1
```

## What Krieger says

Mike Krieger's newest [LinkedIn post](https://www.linkedin.com/in/mikekrieger/recent-activity/all/), about 11 hours old with no permalink, claims Fable 5.2 runs for hours on its own and generates output up to 30% faster than 5.1. Treat those as unconfirmed vendor claims. GitHub's "fewer steps and tool calls" comes with no numbers either. The line I'd actually take from him: "I still recommend using Opus 5.5 as a daily driver."

## The retention catch

This is the part that matters for companies. In [GitHub Copilot](https://github.blog/changelog/2026-11-09-claude-fable-5-2-in-github-copilot), Fable 5.2 is generally available on Pro+, Max, Business and Enterprise. It's off by default for Business and Enterprise until an admin enables the policy. Data retention is required by default: prompts and outputs are kept so safety classifiers can run on them, and they aren't used for training. Eligible enterprises keep zero data retention (ZDR) until the end of the calendar year. After that they need Enterprise Frontier Safeguards (EFS).

[Bedrock](https://aws.amazon.com/blogs/machine-learning/introducing-claude-fable-5-2-on-aws/) is stricter in some ways and more generous in others:

- Model ID `global.anthropic.claude-fable-5-2`, served through US Geo and Global CRIS inference profiles.
- It's a "Covered Model": data is kept for up to 30 days, and Amazon personnel can do human safety review. You must set `aws_review` retention mode before invoking it.
- Until EFS is available, eligible customers can use ZDR for internal use through at least June 30, 2027.
- Declined requests don't retry automatically; the retry is your code's job. The post says you can retry a declined cyber query on Opus 4.8 and a declined bio query on Opus 5. If the declined request hit the prompt cache, the refusal includes a fallback credit token; send it with the retry and that cache is billed as cache reads.

GitHub and Bedrock end the ZDR exemption at different dates, so check which one applies to your setup.

## The one-sentence prompt (unconfirmed)

[Simon Willison quotes](https://simonwillison.net/2026/Nov/10/prompting-claude-fable-52/) Anthropic's "Prompting Claude Fable 5.2" guidance, which I couldn't check directly. The suggested sentence:

```
This codebase is yours: what it's for and how it's built are your call, and you'll keep building on it.
```

On small coding tasks, the model merged repeated code in about half of tries with the sentence and under a tenth without it. Without it, the model tended to add to the existing structure.

Small tasks aren't a multi-module repo, and more refactoring isn't always what you want. "Your call" can mean big diffs nobody asked for, and those run straight into team conventions. I would try it on one module, on a branch, and compare diff size and review time against a run without it.

## My Monday list

1. Upgrade Claude Code to 2.1.321 or later.
2. Decide on retention before anyone turns on the Copilot policy or sets `aws_review`.
3. Keep Opus 5.5 as the default and use Fable 5.2 for long jobs.
4. Run the ownership-sentence experiment on one module, if the doc turns out to say what Willison quotes.

The interesting part of this release is the cost of the model: $8/$40 per Mtok, plus data retention by default on Copilot and Bedrock for anyone outside their ZDR exemptions.

## Sources

- [v2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321), Claude Code releases
- [v2.1.322](https://github.com/anthropics/claude-code/releases/tag/v2.1.322), Claude Code releases
- [Claude Fable 5.2 in GitHub Copilot](https://github.blog/changelog/2026-11-09-claude-fable-5-2-in-github-copilot), GitHub changelog
- [Introducing Claude Fable 5.2 on AWS](https://aws.amazon.com/blogs/machine-learning/introducing-claude-fable-5-2-on-aws/), AWS machine learning blog
- [Quoting Prompting Claude Fable 5.2](https://simonwillison.net/2026/Nov/10/prompting-claude-fable-52/), Simon Willison
- [We launched Fable 5.2 and Mythos 5.2 today!](https://www.linkedin.com/in/mikekrieger/recent-activity/all/), Mike Krieger (Anthropic) on LinkedIn
