---
name: create-blog-post
description: >-
  Write and publish a CloudoX website blog post end to end: a humanized,
  easy-to-read Markdown post under src/content/blog/ plus a generated on-brand
  SVG cover image shown on the blog index card and at the top of the post. Use
  when the user asks to create, write, draft, or publish a blog post / article
  for the CloudoX website (cloudox-website).
---

# Create a CloudoX blog post

Produce one blog post that reads like a founder/engineer wrote it — clear,
simple, human — and ships with a generated cover image. Three things must always
hold: (1) the prose passes the humanization bar below, (2) the post exposes **no
internal knowledge** (see Confidentiality), (3) the post has a cover.

Also load the repo rule `.cursor/rules/website-writing-style.mdc` (voice,
formatting, frontmatter, confidentiality). This skill adds the cover workflow, a
stronger humanization standard, and a self-contained confidentiality gate; the
rule is the source of truth for voice and what is safe to publish.

## Workflow

```
- [ ] 1. Agree the slug + one-sentence takeaway
- [ ] 2. Write the post (humanized — see standard below)
- [ ] 3. Self-edit against the humanization checklist
- [ ] 4. Confidentiality pass — strip any internal knowledge
- [ ] 5. Generate the cover image
- [ ] 6. Add cover/coverAlt to frontmatter
- [ ] 7. Verify (npm run check)
```

### 1. Slug + takeaway

- Slug: short, lowercase, hyphenated. File: `src/content/blog/<slug>.md`.
- One post = one idea. Write the single takeaway in a sentence before drafting.
  If it needs "and", split it into two posts.

### 2. Write the post

Frontmatter (the `cover` lines are added in step 6):

```yaml
---
title: "Short, specific, no clickbait"
description: "One human sentence describing the post."
pubDate: 2026-06-10
author: "The CloudoX team"
tags: ["cloudox", "<topic>", "<topic>"]
draft: false
---
```

Body: ~250–500 words, sentence-case headings, short paragraphs, prose over
bullet spam. As you draft, stay inside the Confidentiality boundary below —
write about *what changed and why it matters*, not how the product works
internally.

### 3. Humanization standard (the important part)

The user requirement: posts must be easy to read, simple, high quality, and so
human that no one suspects AI wrote them. Write to that bar and then edit to it.

Do:

- **Plain words.** Prefer the everyday word: "use" not "utilize", "help" not
  "facilitate", "about" not "approximately", "so" not "thus".
- **Vary the rhythm.** Mix short and longer sentences. A three-word sentence is
  allowed. Real writing is uneven.
- **One concrete detail beats three abstractions.** Show the actual situation
  (the console crawl, the diagram nobody trusts) instead of naming a category.
- **Write from a point of view.** "We were tired of…", "Here's what we found".
  A human has an opinion and a reason.
- **Contractions on.** "it's", "we're", "doesn't" — this is a blog, not a spec.
- **Get to the point in sentence one.** No throat-clearing preamble.

Avoid the AI tells:

- Formulaic openers: "In today's fast-paced world", "In the world of cloud",
  "Imagine a scenario where".
- The "It's not just X, it's Y" and "Whether you're X or Y" constructions.
- Rule-of-three everywhere ("fast, reliable, and scalable"). Use it once at
  most.
- Hype/marketing verbs banned by the style rule: revolutionary, game-changing,
  supercharge, unlock, leverage, seamless, robust, delve, elevate, harness.
- Empty conclusions: "In conclusion", "Ultimately, the key takeaway is".
- Uniform paragraph lengths and every paragraph starting the same way.
- Em-dash overuse and emoji/decorative symbols (the brand uses neither for
  emphasis spam).
- Hedging filler: "it's important to note that", "needless to say".

Read it out loud in your head. If a real founder couldn't send it to a customer
without it sounding generated, rewrite it.

### Confidentiality — never expose internal knowledge

A public post must not leak how CloudoX works internally, the decisions behind
it, or its strategy. This is a hard gate, equal to humanization — a beautifully
written post that exposes an internal mechanism still fails.

Keep these **out** of any post:

- **Internal mechanisms / decisions.** Discovery, filtering, deduplication, and
  interpretation logic; prompt engineering; allow/deny lists; type-coverage
  lists; identifier mappings; thresholds, caps, and tuning choices.
- **Internal data.** Customer environment details or sizes, performance numbers,
  cost breakdowns, internal benchmarks.
- **Strategy / timing.** Roadmap dates and sequencing, pricing strategy,
  competitive positioning.
- **Anything not already public.** If it isn't in the public README, the public
  GitHub repo, or the live marketing site, don't name it on the website yet.

How to write about the product safely:

- **Generalize, don't itemize.** "We combine deep and broad collection" — not
  the specific rules, lists, or limits behind it.
- **Name only shipped, publicly known capabilities.** Describe the *what* and
  the *why*, not the *how*.
- **State direction as direction.** "On the roadmap" / "we're exploring" — never
  a delivery date or commitment.
- **When in doubt, omit.** The post is still useful at the level of "what
  changed and why it matters."

The full policy lives in `.cursor/rules/website-writing-style.mdc`
(Confidentiality); if it and this section ever drift, the rule wins.

### 5. Generate the cover image

Run from the repo root:

```bash
npm run cover -- <slug>
```

This reads `title` + `tags` from `src/content/blog/<slug>.md` and writes a
deterministic, on-brand SVG to `public/blog/covers/<slug>.svg` (dark gradient,
grid, accent glow, knowledge-graph motif — matching `public/og/cloudox-og.svg`).
The accent colour is chosen from the post's topic tag. The script prints the
exact frontmatter lines to paste.

Overrides when needed:

```bash
npm run cover -- <slug> --tag cost --accent "#22b8a6"   # force label/colour
npm run cover -- --all                                   # regenerate every cover
```

The cover doubles as the post's social `og:image`, so no separate OG step is
needed. If you ever want a custom (non-generated) image, point `cover` at any
path under `public/` instead — the templates render whatever it points to.

### 6. Add cover frontmatter

Paste the printed lines into the post frontmatter:

```yaml
cover: "/blog/covers/<slug>.svg"
coverAlt: "CloudoX cover image for <title>"
```

The blog index card and the post page render the cover automatically once these
fields exist (both are optional in the schema, so a post without them still
builds).

### 7. Verify

```bash
npm run check        # astro type/content check
npm run dev          # optional: eyeball /blog and /blog/<slug>
```

Confirm: cover shows on the `/blog` card and at the top of the post, the
reading-time and date line looks right, and `npm run check` is clean.

## Pre-publish sanity check

- One takeaway, stated plainly.
- Reads human — passes the humanization checklist, no AI tells.
- **Exposes no internal knowledge** — passes the Confidentiality gate: no
  internal mechanisms/decisions, no internal data, no strategy or roadmap dates,
  nothing that isn't already public.
- No unshipped promises.
- Cover generated and wired into frontmatter; `npm run check` passes.
