---
title: Knowledge Views
description: Audience lenses over one interpreted knowledge foundation.
section: Concepts
order: 3
---

A **Knowledge View** is an audience lens over the same interpreted knowledge. It selects, prioritizes, and frames the understanding a specific stakeholder needs — and it is narrated in plain language, grounded in evidence.

The governing rule:

> Different audiences receive different explanations and priorities. They must never receive different truths.

Every view reads the same knowledge graph and the same interpretation. A view curates and presents — it never re-derives, re-interprets, or contradicts the shared understanding. That is how CloudoX serves many stakeholders without maintaining many divergent copies of the truth.

## The views

| View | Audience | Focus |
|------|----------|-------|
| **Generic** | Any technical reader | A balanced, full-depth read. The default when no audience is selected. |
| **Executive** | CTO / engineering leadership | Risk, decisions, and cost at a glance — understanding first, inventory never. |
| **Architect** | Solutions & cloud architects | Architecture, workloads, dependencies, networking, and design risks. |
| **Operations** | Platform & operations engineers | Connectivity, routing, observability, backup, and recovery readiness. |
| **Security** | Security & governance teams | Exposure, identity, governance, and evidence gaps. |
| **FinOps** | FinOps & finance | Cost drivers and optimization in architectural context. |

The set is **extensible** — a new audience is a new lens, not a new discovery or interpretation path.

## Persona questions

Each view is built to answer the strategic questions its audience actually asks. For example:

- **Executive** — What requires leadership attention? What are the highest risks? What decisions are needed?
- **Architect** — What design issues exist? Which dependencies matter? What modernization opportunities exist?
- **Operations** — What can break? What needs operational attention? What recovery risks exist?
- **Security** — What is exposed, and to whom? Where is access over-privileged or unclear? What governance or evidence gaps exist?
- **FinOps** — What is driving cost? Where is the waste? What optimization is worth validating?

These questions are both a design contract (what the view must surface) and a quality target (see [Knowledge Intelligence & Quality](/docs/knowledge-intelligence)).

## Friendly naming and confidence, per view

Views lean on the [friendly naming layer and confidence model](/docs/03-knowledge-model) to the degree their audience needs. Executive and FinOps views lead hardest with human names and a concise confidence label; Architect and Operations views show more identifiers and depth. The names and confidence are shared, so views differ in emphasis — never in the underlying names or certainty.

## Change and cost inside the view

Views are built to show current state alongside what changed since the previous discovery, and to surface cost inside the FinOps and Architect views connected to the workloads that drive it. Change and cost become part of everyday understanding rather than separate reports a reader has to seek out.
