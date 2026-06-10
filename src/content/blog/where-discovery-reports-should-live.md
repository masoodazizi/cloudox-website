---
title: "Where a discovery report should live"
description: "A report only matters when someone reads it. A short note on why CloudoX writes plain Markdown — and where that report can show up today."
pubDate: 2026-05-12
author: "The CloudoX team"
tags: ["cloudox", "reporting", "markdown"]
cover: "/blog/covers/where-discovery-reports-should-live.svg"
coverAlt: "CloudoX cover image for Where a discovery report should live"
---

A discovery report only earns its value when someone reads it. The most carefully written report is still wasted if it ends up in a shared drive nobody opens.

We thought about this early. The collection layer, the knowledge graph, and the rules engine matter — but they are all upstream of the question that decides whether a report gets used: *where does it show up?*

## Plain Markdown, on purpose

CloudoX writes the report as plain Markdown. Eight files, predictable names, one directory per organisation. That choice rules out a few things — there's no proprietary viewer, no exported PDF with broken layout — but it opens up everything else. Markdown survives in a Git diff, a Notion page, a Confluence space, a static site, or just a raw file in `cat`.

The format and the surface are deliberately separated. The report content is generated once; the publishing surface is the variable.

## Two destinations today

We have two live destinations a customer can look at right now.

A **hosted dashboard** at [preview.cloudox.io](https://preview.cloudox.io) — sidebar navigation, search, light and dark mode, secure by default. It is the polished read-only view we would hand to a stakeholder.

A **Git repository** is the second. Reports are just files; treat them like code. A sanitised public example lives at [github.com/cloudox-ai/cloudox-public-examples](https://github.com/cloudox-ai/cloudox-public-examples) — the same Markdown that comes out of a real run, with identifiers replaced. Diffable, reviewable, versioned.

Between those two, most of the early conversations we are having are covered.

## What's on the radar

Confluence and Notion come up in almost every customer conversation, which is not surprising — most teams already keep their architecture documentation in one of those. Both are on our roadmap. Neither is shipped yet. When they land we will write about them honestly: what they do, what they don't, and what they cost in setup time.

The longer-term point is small. Keep the report format stable, let the publishing layer grow. A team should never have to switch tools to read its own discovery report.
