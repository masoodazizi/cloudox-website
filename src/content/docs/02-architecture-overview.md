---
title: Architecture overview
description: The layers of CloudoX — from discovery to audience-specific understanding.
section: Concepts
order: 1
---

CloudoX is layered so that **one evidence-grounded knowledge foundation, interpreted once, feeds many audiences and channels**. Each layer has one job, so the output stays trustworthy and easy to reason about.

```text
Cloud environment
  → Discovery            (provider-native, evidence-first)
  → Knowledge graph      (canonical facts: entities + typed relationships)
  → Interpretation       (reusable, per-domain meaning)
  → Knowledge Intelligence (ranked, evidence-grounded findings)
  → Knowledge Views      (audience lenses)
  → AI-narrated understanding (plain-language explanation)
```

## 1. Discovery

Read-only collectors connect to AWS-native sources and produce normalized results with raw payloads attached for evidence.

Primary data sources:

- AWS Config
- AWS Organizations
- AWS Resource Explorer
- AWS service APIs
- Resource tags

Collectors are modular per service — read-only, idempotent, and structured. Deep collectors cover the architecture-critical services; a broader sweep keeps the long tail visible.

## 2. Knowledge graph

Raw cloud data is normalized into typed entities and explicit, evidence-bearing relationships:

- Organizations and accounts
- Regions
- Environments (production, staging, development, sandbox, …)
- Systems and workloads
- Resources
- Relationships across topology, networking, security, IAM, compute, data, and DNS

The graph is the **source of truth**. Inferred entities carry a confidence level and an evidence list.

## 3. Interpretation

Pure functions over the knowledge graph extract relationships and run interpreters — environment classification, workload grouping, system grouping, internet-exposure detection. The meaning is then captured **once per domain** (architecture, networking, security, cost, operational) as reusable interpretation, so every channel reads the same meaning instead of re-deriving it.

This layer is the **source of meaning**. It never calls AWS and never invents architecture.

## 4. Knowledge Intelligence

A single, ranked set of evidence-grounded items — findings, risks, recommendations, opportunities, and evidence gaps — is generated **once per environment** and prioritized by significance. Every downstream view selects and prioritizes from the same set rather than re-deriving "what matters."

## 5. Knowledge Views

Audience lenses — Generic, Executive, Architect, Operations, Security, and FinOps — project the interpreted knowledge for each stakeholder. A view selects, prioritizes, and frames; it never re-derives or contradicts the facts. Different audiences receive different explanations and priorities, **never different truths**. See [Knowledge Views](/docs/knowledge-views).

## 6. Consumption

The same understanding is read through several channels — AI-narrated reports, architecture diagrams, and a hosted dashboard — all rendered from the same foundation, never re-derived. Because everything reads from one knowledge graph, new channels can be added without changing the layers beneath. Two further consumption layers ship today: **Environment Evolution** (what changed since the previous discovery) and **Cost Intelligence** (spend explained in architectural context). Both are pure readers of the graph — deterministic analysis first, AI narration second.
