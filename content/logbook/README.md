# Logbook

Write a post by adding a Markdown file to this folder. The file name becomes
the address, so `my-first-entry.md` is published at `/logbook/my-first-entry`.

Start the file with a few lines between `---`:

```
---
title: Why I keep my data at home
date: 2026-11-02
summary: One or two sentences that show up in the list, in search results and on link previews.
---

The post itself, in Markdown.
```

What works in the post:

- paragraphs, `## headings` and `### smaller headings`
- `**bold**`, `*italic*`, `` `code` `` and [links](https://example.com)
- lists with `-` or `1.`
- `> quotes`
- code blocks between three backticks
- images: `![what the image shows](/logbook/my-image.webp)`, with the file in `public/logbook/`

Add `draft: true` to keep a post out of the site while you work on it.

A new post goes live with the next deploy (push to main). This README is never
published.
