---
title: Introduction to CloudoX
description: What CloudoX is, what it isn't, and who it's for.
section: Getting Started
order: 1
---

CloudoX is an intelligent cloud knowledge platform. It discovers cloud environments with provider-native evidence, builds a typed **knowledge graph**, interprets what that graph means, and projects audience-specific understanding for the people who need it.

The core asset is the **knowledge graph plus its interpretation** — the source of truth and the source of meaning. Reports, the dashboard, and exports are *lenses* on top of that knowledge, not the reason it exists. CloudoX is not a report-generation tool; a report is one way to read interpreted knowledge.

The conceptual model is one foundation, interpreted once, read many ways:

```text
Cloud environment
  → Discovery
  → Knowledge graph
  → Interpretation
  → Knowledge Intelligence
  → Knowledge Views
  → AI-narrated understanding
```

The MVP focuses on **AWS**, including:

- Multi-account AWS Organizations environments
- Multi-region resource discovery
- Architecture, networking, security, operational, and cost understanding
- Audience-specific Knowledge Views, AI-narrated reports, architecture diagrams, and a hosted dashboard

CloudoX is designed to evolve into a broader multi-cloud knowledge platform — Azure and GCP support are part of the roadmap.

The product focus today is unchanged and deliberately narrow: help technical stakeholders understand any cloud environment in under 30 minutes.

## Who CloudoX is for

The same knowledge foundation serves many audiences through Knowledge Views:

- Cloud solutions architects and consultants
- Cloud, platform, and DevOps engineers
- Security and governance teams
- FinOps and finance
- Engineering leadership and CTOs

## What CloudoX is *not*

- **Not a CMDB** — CloudoX builds working understanding, not a permanent system of record for every asset.
- **Not a security scanner** — security intelligence covers architectural exposure and obvious gaps, not vulnerability scanning or compliance.
- **Not a FinOps platform** — it explains cost in architectural context; it complements Cost Explorer and FinOps tools rather than replacing them.

## Core principles

- **Evidence over assumptions** — every important finding is backed by AWS-native evidence or clearly labeled as inferred.
- **AWS as the source of truth** — Config, Organizations, Resource Explorer, service APIs, and tags are primary sources.
- **Structured data first** — raw cloud data is normalized into typed models, then interpreted, before any AI narration runs.
- **Confidence is explicit** — inferred findings carry a user-facing confidence (Verified / Likely / Assumed / Unknown) and a list of evidence.
- **AI-assisted, not AI-invented** — AI narrates interpreted knowledge; it is never the source of truth or meaning.
