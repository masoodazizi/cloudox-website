---
title: Reports and output
description: How you read CloudoX — Knowledge Views, AI-narrated reports, diagrams, and where they live.
section: Concepts
order: 5
---

A report is one way to read interpreted knowledge — not the product. CloudoX produces **audience-specific understanding**, and the reports, diagrams, and dashboard are lenses on the same knowledge foundation.

## View-centric output

Instead of a single fixed document, CloudoX renders **one page per Knowledge View** — Generic, Executive, Architect, Operations, Security, and FinOps — each framed for its audience and narrated in plain language. A reader picks who they are and reads understanding written for them, not a wall of inventory.

Each view leads with understanding (what matters and why), then supports it with evidence: key entities by friendly name, assumptions, unknowns, and a reference appendix that traces every name back to its raw identifier.

## Tone

Output is written to be:

- concise
- consultant-friendly
- technically credible

Avoiding hype, generic AI wording, and filler.

## Understanding before inventory

Preferred:

> A likely production workload runs behind an Application Load Balancer and connects to an RDS database. No centralized monitoring configuration was detected.

Avoided:

> 3 EC2 instances and 1 database were found.

CloudoX prioritizes meaningful insight over raw inventory.

## Diagrams

Architecture diagrams — account structure, workload architecture, and network topology — are generated deterministically from the knowledge graph and embedded where they support understanding. They illustrate the interpreted knowledge; they are never the source of it.

## Where it lives

Because the output is plain Markdown, the same understanding can be published to whichever surface your team uses. Live today:

- **CloudoX Dashboard** — a hosted preview at [preview.cloudox.io](https://preview.cloudox.io) with navigation, search, and theming. The dashboard is evolving toward a knowledge-centric experience organized around Knowledge Views and snapshots.
- **Git repository** — the output is just files. Commit it to a normal Git repo and diff, review, and version it like code. A sanitised public example lives at [github.com/cloudox-ai/cloudox-public-examples](https://github.com/cloudox-ai/cloudox-public-examples).

Confluence and Notion integrations are on the roadmap so understanding can land directly in the documentation tool your team already uses. The publishing surface is intentionally decoupled from the format: new destinations slot in without changing the output.
