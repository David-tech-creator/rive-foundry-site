---
title: Qwen Code 0.27.0: parallel questions, honest Ctrl+C, saner sed edits
date: 2026-11-08
summary: Qwen Code 0.27.0 lets managed agents hold several questions open at once, reports cancelled shell commands as interrupted, and fixes sed edits on CRLF and Unicode files.
---

**The short version**

- v0.27.0 marks cancelled shell commands as interrupted and keeps their partial output. It's a status fix, so still check side effects yourself.
- The sed simulation now handles CRLF and Unicode in substitutions. On Windows-heavy repos, check line endings in your diffs after agent edits.
- The nightly after 0.27.0 tells the model which shell is active and fixes OpenAI cache_write_tokens telemetry. It's a pre-release, so expect dashboards to shift.

![Before/after table for Qwen Code 0.27.0: cancelled commands now marked interrupted with output kept, sed handles CRLF/Unicode, and several child questions can be pending.](/logbook/frontier/qwen-code-0-27-0-parallel-questions-honest-ctrl-c-saner-sed-edits.svg)

Qwen Code [v0.27.0](https://github.com/QwenLM/qwen-code/releases/tag/v0.27.0) came out on Nov 7 at commit `03b0c24`, with 16 contributors and the line "No known breaking changes." The desktop build followed a few hours later, along with [TypeScript SDK v0.1.30](https://github.com/QwenLM/qwen-code/releases/tag/sdk-typescript-v0.1.30), which bundles CLI 0.27.0.

The Highlights open with parallel child questions for managed agents. The Features list opens with FileChanged hooks. I keep coming back to three items in particular. Each one makes the agent's record of events match what actually happened, and that's the part that bites you at 11pm.

## Ctrl+C now says "interrupted"

Before #15836, a shell command you killed with Esc or Ctrl+C was reported as *completed*. Picture the model reading "completed" on a test run you stopped halfway, then building its next step on top of that. Now the command is marked **interrupted** and its partial output is kept.

That's a real improvement, but a narrow one. The notes don't say whether the child process gets killed along with its process group and any grandchildren. They also don't say whether output is flushed at cancel time or how the model treats the new status. If you cancel a migration halfway through, the label is correct now. The database is still half-migrated.

## sed edits on CRLF and Unicode

The shell tool doesn't run real sed. It simulates it. #15701 makes that simulation handle CRLF files and Unicode characters in substitution patterns, and the notes say this prevents "failed edits and corruption."

The PR title is "match one sed character for . and bracket expressions." My guess is that `.` or `[...]` used to match the wrong amount of text when it hit a multibyte `é` or a stray `\r`. That's a guess from the title, and no source shows a repro. Nothing confirms that files are written back with their original line endings either, only that CRLF is "handled correctly." And since it's a simulation, it can still differ from GNU or BSD sed in other edge cases.

On a repo with mixed line endings, I would check after an agent edit:

```
git ls-files --eol | grep crlf
git diff --stat
```

## Parallel child questions for managed agents

#16484, "support concurrent child questions," lets a managed-agent session keep several child questions pending at once. You can answer them in any order, and each child keeps its own drafts and errors.

The notes give no concurrency limit and don't say what happens to pending drafts on restart or timeout. They also don't cover questions that depend on each other. Five open prompts can be a lot for one human to answer. The new "Ask for details" action (#16458) helps a bit. It opens a side task that explains the options without answering for you.

## The nightly that comes after 0.27.0

The name misleads. [v0.26.9-nightly.20261107.65e1f1aeaa](https://github.com/QwenLM/qwen-code/releases/tag/v0.26.9-nightly.20261107.65e1f1aeaa) compares v0.27.0...nightly, so it's *newer* than 0.27.0. It's also a pre-release.

Two items fit the theme:

- **#16491 names the active shell in the startup context.** That's all the notes say. Telling bash from PowerShell up front sounds useful, but nothing confirms it changes the commands the model writes.
- **#16454 reports OpenAI `cache_write_tokens` as cache creation.** This fixes telemetry accounting. Usage and cost dashboards may move. The notes say nothing about billing.

## What I would do on Monday

1. Update to 0.27.0 on a normal machine. The bot says no breaking changes, which is a claim and not a test report.
2. Cancel a long command on purpose. Check that the status says interrupted, then run `ps` for leftover processes.
3. On Windows or mixed-ending repos, run the `git ls-files --eol` check after the first few agent edits.
4. Leave the nightly to one throwaway setup, unless you track OpenAI cache metrics and want the corrected numbers.

All of this comes from release notes, mostly written by a bot. None of it is independently verified. The direction is consistent, though: a stopped command, an edited file and an open question each get recorded the way they actually happened.

## Sources

- [Release v0.27.0](https://github.com/QwenLM/qwen-code/releases/tag/v0.27.0), Qwen Code releases
- [SDK TypeScript Release v0.1.30](https://github.com/QwenLM/qwen-code/releases/tag/sdk-typescript-v0.1.30), Qwen Code releases
- [Release v0.26.9-nightly.20261107.65e1f1aeaa](https://github.com/QwenLM/qwen-code/releases/tag/v0.26.9-nightly.20261107.65e1f1aeaa), Qwen Code releases
- [Qwen Code Desktop v0.27.0](https://github.com/QwenLM/qwen-code/releases/tag/desktop-v0.27.0), Qwen Code releases
