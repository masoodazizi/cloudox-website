---
title: The knowledge model
description: How CloudoX represents accounts, environments, workloads, systems, and relationships.
section: Concepts
order: 2
---

The knowledge model is what makes CloudoX trustworthy. It separates raw cloud data from interpreted understanding.

## Core entities

- **Organization** — the AWS Organization root.
- **Account** — an AWS account with its own metadata, tags, and inferred environment.
- **Region** — regions where workloads actually run.
- **Environment** — production, staging, development, sandbox, and so on.
- **System** — a logical grouping of workloads (for example a customer platform or analytics system).
- **Workload** — an application or service grouping (for example an ECS app, EKS cluster, or web platform).
- **Resource** — a normalized cloud resource (EC2 instance, ALB, RDS cluster, IAM role, …).

## Relationships

Relationships are first-class. They are typed, directed, and carry evidence. Example categories:

- **Topology / containment** — `part_of`, `contains`, `hosted_in`
- **Network** — `in_vpc`, `in_subnet`, `attached_to`, `routes_to`, `peered_with`, `connected_to`
- **Security** — `secured_by`, `allows_from`
- **IAM** — `uses_iam_role`, `has_policy`, `assumes_role`
- **Compute / load balancing** — `targets`, `member_of`, `scales`
- **Data / DNS** — `reads_from`, `writes_to`, `resolves_to`
- **Logical / inferred** — `depends_on`, `exposed_to_internet`, `part_of_workload`, `part_of_system`

Every important relationship carries source and target IDs, a confidence level, and at least one piece of evidence.

## Confidence levels

Internally, inferred findings carry a confidence level:

- **high** — backed by an authoritative AWS-API field or an explicit tag.
- **medium** — backed by deterministic but indirect evidence (account naming, cross-resource tag consistency).
- **low** — backed by weaker signals (resource name patterns, single-tag matches).

Conflicting weak signals collapse to **unknown** rather than guessing.

## The confidence model

For readers, those internal levels are projected into a plain, user-facing confidence model:

- **Verified** — backed by authoritative evidence.
- **Likely** — backed by deterministic but indirect evidence.
- **Assumed** — backed by weaker signals; treat with care.
- **Unknown** — not enough evidence to claim.

The projection only ever *maps* certainty — it never raises it. A reader always knows how much weight to give a statement, and the underlying evidence is one click away.

## Friendly naming

Cloud identifiers are precise but unreadable. CloudoX derives human-friendly names from evidence — Production Account, Shared Services Account, Production VPC — and leads with those in the main content. Names are never invented: each one records the evidence it came from, raw identifiers are always preserved in a reference appendix, and collisions are disambiguated deterministically. So prose reads in human terms while every reference stays traceable.

## Why this matters

Because the knowledge model is structured, AI doesn't have to read raw cloud responses or guess context. AI narrates explicit, interpreted data — which keeps the output explainable and defensible.
