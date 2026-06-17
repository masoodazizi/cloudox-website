---
title: Trust and the role of AI
description: How CloudoX uses AI — and where it deliberately doesn't.
section: Concepts
order: 6
---

CloudoX is **AI-assisted, not AI-invented**. AI explains interpreted knowledge in stakeholder-friendly language — it is never the source of truth or meaning. Every AI-assisted experience follows the same discipline:

> Deterministic analysis → interpretation → view projection → AI narration.

No capability sends raw infrastructure data straight to a model. The knowledge graph holds the facts, the interpretation layer holds the meaning, and the model is handed a closed, citeable context to narrate.

## What AI is used for

- **Narration** — turning interpreted, audience-specific knowledge into clear prose.
- **Summarization** — distilling structured findings for a given view.
- **Classification** — recognizing patterns and naming conventions to assist interpretation.
- **Optional quality review** — critiquing whether a view is useful, without ever changing the facts.

## What AI is *not* used for

- Inventing ownership.
- Inventing environments.
- Inventing architecture.
- Hiding uncertainty.

If CloudoX can't back a statement with AWS-native evidence or labeled inference, it doesn't make the statement. When the model is narrating a view, anything it cites must already be in the context it was given — citations outside that closed set are rejected before they reach the page.

## Confidence and evidence

Every important inferred finding is tagged with a confidence level and a list of evidence:

- Tags
- Naming conventions
- Network relationships
- AWS Organizations data
- Multiple evidence sources

A single weak signal stays at **low** confidence. Conflicting weak signals collapse to **unknown** rather than producing an aggressive guess.

## Why this matters

Cloud consultants and engineers are accountable for the documents they hand to stakeholders. A discovery report that fabricates ownership or invents a workload is worse than no report at all. CloudoX is built so the people who sign reports can defend every line.
