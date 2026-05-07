---
title: Architecture overview
description: The four layers of Cloudox — collection, modeling, interpretation, and reporting.
section: Concepts
order: 1
---

Cloudox is built around four explicit layers. Each layer has one job, so output stays trustworthy and easy to reason about.

## 1. Data Collection Layer

Read-only collectors connect to AWS-native sources and produce normalized results with raw payloads attached for evidence.

Primary data sources:

- AWS Config
- AWS Organizations
- AWS Resource Explorer
- AWS service APIs
- Resource tags

Collectors are modular per service. Each one is read-only, idempotent, and returns structured data — no interpretation.

## 2. Knowledge Model Layer

Raw cloud data is normalized into typed entities and explicit relationships:

- Organizations and accounts
- Regions
- Environments (production, staging, development, sandbox, …)
- Systems and workloads
- Resources
- Relationships across topology, networking, security, IAM, compute, data, and DNS

Inferred entities carry a **confidence level** (high / medium / low) and an **evidence list**.

## 3. Graph & Interpretation Layer

Pure functions over the knowledge graph extract relationships and run interpreters:

- Environment classification (tags → naming → resource patterns)
- Workload grouping (anchors expanded via deterministic relationships)
- System grouping (driven by application-level tags)
- Internet exposure detection

This layer never calls AWS and never invents architecture.

## 4. Output Generation Layer

The graph is rendered into a clean Markdown discovery report:

- Executive summary
- Architecture overview
- Environment structure
- Networking
- Security overview
- Observability
- Findings and risks
- Assumptions and unknowns

Reports are predictable, scannable, and easy to commit alongside code.
