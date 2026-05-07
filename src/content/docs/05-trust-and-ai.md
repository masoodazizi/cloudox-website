---
title: Trust and the role of AI
description: How Cloudox uses AI — and where it deliberately doesn't.
section: Concepts
order: 4
---

Cloudox treats AI as one tool among several. It is used where it helps, and avoided where it could fabricate facts.

## What AI is used for

- **Summarization** — turning structured findings into clear narrative.
- **Grouping** — assisting with workload and system grouping when deterministic logic is insufficient.
- **Classification** — recognizing patterns and naming conventions.
- **Pattern recognition** — surfacing common architectural patterns across the graph.

## What AI is *not* used for

- Inventing ownership.
- Inventing environments.
- Inventing architecture.
- Hiding uncertainty.

If Cloudox can't back a statement with AWS-native evidence or labeled inference, it doesn't make the statement.

## Confidence and evidence

Every important inferred finding is tagged with a confidence level and a list of evidence:

- Tags
- Naming conventions
- Network relationships
- AWS Organizations data
- Multiple evidence sources

A single weak signal stays at **low** confidence. Conflicting weak signals collapse to **unknown** rather than producing an aggressive guess.

## Why this matters

Cloud consultants and engineers are accountable for the documents they hand to stakeholders. A discovery report that fabricates ownership or invents a workload is worse than no report at all. Cloudox is built so the people who sign reports can defend every line.
