---
title: The discovery report
description: What CloudoX produces — structure, tone, and what to expect.
section: Concepts
order: 3
---

CloudoX produces a Markdown discovery report with a predictable structure. Reviewers know exactly where to find what they need.

## Report structure

```text
aws-discovery-report/
├── README.md
├── 01-executive-summary.md
├── 02-architecture-overview.md
├── 03-environment-structure.md
├── 04-networking.md
├── 05-security-overview.md
├── 06-observability.md
├── 07-findings-and-risks.md
└── 08-assumptions-and-unknowns.md
```

## Sections at a glance

- **Executive summary** — high-level overview of the environment, key workloads, environments, and notable risks.
- **Architecture overview** — inferred workloads and systems, written in plain language with evidence.
- **Environment structure** — accounts, organizational units, environment classification.
- **Networking** — VPC topology, peering, internet exposure, routing.
- **Security overview** — architectural exposure, identity boundaries, tagging hygiene.
- **Observability** — what's logged, what's monitored, and what isn't.
- **Findings and risks** — operational gaps, exposure, missing observability, unclear ownership.
- **Assumptions and unknowns** — everything CloudoX could not confirm — never silently guessed.

## Tone

Reports are written to be:

- concise
- consultant-friendly
- technically credible

Avoiding hype, generic AI wording, and filler.

## Findings style

Preferred:

> A likely production workload is running behind an Application Load Balancer and connected to an RDS database. No centralized monitoring configuration was detected.

Avoided:

> 3 EC2 instances and 1 database were found.

CloudoX prioritizes meaningful insight over raw inventory.

## Where reports live

Because the output is plain Markdown, the same report can be published to
whichever surface your team actually uses. Two destinations are live today:

- **CloudoX Dashboard** — a hosted preview at
  [preview.cloudox.io](https://preview.cloudox.io) with sidebar navigation,
  search, and light/dark theming. Useful for sharing a polished read-only
  view with stakeholders.
- **Git repository** — the report is just files. Commit it to a normal Git
  repo and diff, review, and version it like code. A sanitised public
  example lives at
  [github.com/cloudox-ai/cloudox-public-examples](https://github.com/cloudox-ai/cloudox-public-examples).

Confluence and Notion integrations are on the roadmap so reports can land
directly in the documentation tool your team already uses, without an extra
copy step.

The publishing surface is intentionally decoupled from the report format:
new destinations slot in without changing the report itself.
