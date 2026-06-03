---
title: "What changed since the last scan"
description: "A first look at Environment Evolution: comparing two CloudoX discovery runs and explaining what actually changed."
pubDate: 2026-06-02
author: "The CloudoX team"
tags: ["cloudox", "evolution", "aws"]
draft: false
---

CloudoX started as a way to understand an unfamiliar cloud environment quickly — point it at an account, get an evidence-grounded report in about half an hour. That's still the core. But cloud environments don't hold still. A week later there's a new region, a database has grown, a security group has been opened "just for debugging." The report you generated on Monday is already drifting from reality.

So the question we kept hearing changed from "what's in here?" to "what changed since last time?"

That's what **Environment Evolution** answers.

## Comparing two runs

CloudoX already builds a knowledge graph of an environment on every run. Environment Evolution keeps a record of those runs and compares the current one against the previous one. The comparison is deterministic: it looks at the resources, relationships, and workloads in each graph and works out what was added, removed, modified, or moved — new regions and services, a workload that grew, an exposure that opened, a governance control that changed.

The output is a short evolution summary and a report section that answers three things: what changed, which changes are worth attention, and what a reviewer should look at first.

## The AI narrates; it doesn't invent

The same rule that governs the rest of CloudoX applies here. The differences are computed from the graphs, as observed facts. The AI then writes them up in plain language — it does not decide what changed, and it never invents a cause or a business reason that the evidence doesn't support. We also don't hand the model your full history; it works from the reduced, already-computed set of changes, not the raw graphs.

## When there's nothing to compare against

The first time you scan an environment there is no previous run, so there's nothing to diff. Instead of pretending otherwise, CloudoX records that run as the baseline and says so. Every scan after that has something to compare against.

This is a first version, and deliberately narrow: it reports the changes it can support with evidence and stays quiet about the ones it can't. It's the next step in a direction we care about — moving CloudoX from a one-time snapshot toward a continuous understanding of how an environment evolves.
