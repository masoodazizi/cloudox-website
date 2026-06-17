---
title: How a discovery run works
description: From read-only access to audience-specific understanding, in about 30 minutes.
section: Getting Started
order: 2
---

CloudoX is in early access today, so runs happen with the team alongside you. The flow itself is simple — and read-only from start to finish.

## 1. Connect, read-only

CloudoX is given **read-only** access to an AWS Organization, an account set, or a single account. It never creates, modifies, or deletes anything in your environment. Multi-account and multi-region are the default, not an add-on.

## 2. Discover and interpret

CloudoX collects AWS-native data across accounts and regions, builds a typed [knowledge graph](/docs/03-knowledge-model), and [interprets](/docs/02-architecture-overview) what it means — classifying environments, grouping workloads, and detecting exposure. Then it generates ranked, evidence-grounded [Knowledge Intelligence](/docs/knowledge-intelligence).

For a typical environment, the initial pass takes about **30 minutes**.

## 3. Read your Knowledge Views

The result is audience-specific understanding, not a wall of inventory. Open the [Knowledge View](/docs/knowledge-views) for who you are — Executive, Architect, Operations, Security, FinOps, or the balanced Generic view — each narrated in plain language and grounded in evidence.

You can read the output in a hosted dashboard, commit it to Git, or browse the [sanitised public example](/docs/04-discovery-report).

## What to expect

- **Evidence, not assumptions.** Every important statement cites AWS-native evidence or is labelled by confidence — Verified, Likely, Assumed, or Unknown.
- **Honest coverage.** The output names what was and wasn't captured, so you always know what was looked at.
- **AI-assisted, not AI-invented.** Deterministic analysis decides the facts and the meaning; AI only narrates. See [trust and the role of AI](/docs/05-trust-and-ai).

Ready to try it on a real environment? [Request early access](/contact).
