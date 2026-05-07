---
title: The discovery report
description: What Cloudox produces — structure, tone, and what to expect.
section: Concepts
order: 3
---

Cloudox produces a Markdown discovery report with a predictable structure. Reviewers know exactly where to find what they need.

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
- **Assumptions and unknowns** — everything Cloudox could not confirm — never silently guessed.

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

Cloudox prioritizes meaningful insight over raw inventory.
