---
title: FAQ
description: Answers to common questions about CloudoX.
section: Reference
order: 1
---

## Does CloudoX modify anything in my AWS environment?

No. CloudoX uses **read-only** access. It doesn't create, modify, or delete anything in customer environments.

## Does CloudoX support AWS Organizations and multiple accounts?

Yes. CloudoX is designed for multi-account AWS Organizations environments and tracks workloads, networking, and dependencies across accounts.

## Does CloudoX support multiple regions?

Yes. Resources, networking, and dependencies are tracked per region.

## Does CloudoX use AI?

Yes — for summarization, grouping, classification, and pattern recognition. AI does **not** invent ownership, environments, or architecture, and every important finding is backed by AWS-native evidence or clearly labeled as inferred.

## What does the report look like?

A Markdown directory with eight predictable sections — executive summary, architecture, environment structure, networking, security, observability, findings, and assumptions. See the [discovery report doc](/docs/04-discovery-report).

## Can I keep my report?

Yes. Reports are plain Markdown files. You can commit them to a repo, drop them into Confluence, or share them as you would any document.

## Will CloudoX support Azure or GCP?

Azure and GCP are part of the roadmap. The architecture is designed to be multi-cloud — see the [multi-cloud vision doc](/docs/06-multi-cloud-vision).

## Is CloudoX a CMDB or security scanner?

No. CloudoX is a cloud discovery and documentation platform. It is intentionally not a CMDB, vulnerability scanner, or compliance product.

## How do I get access?

[Request early access](/contact) — we're working hands-on with a small group of consultants and engineers to shape the platform.
