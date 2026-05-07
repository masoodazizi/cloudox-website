---
title: The knowledge model
description: How Cloudox represents accounts, environments, workloads, systems, and relationships.
section: Concepts
order: 2
---

The knowledge model is what makes Cloudox trustworthy. It separates raw cloud data from interpreted understanding.

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

Inferred findings include a confidence level:

- **high** — backed by an authoritative AWS-API field or an explicit tag.
- **medium** — backed by deterministic but indirect evidence (account naming, cross-resource tag consistency).
- **low** — backed by weaker signals (resource name patterns, single-tag matches).

Conflicting weak signals collapse to **unknown** rather than guessing.

## Why this matters

Because the knowledge model is structured, AI doesn't have to read raw cloud responses or guess context. AI runs on top of explicit data — which keeps the output explainable.
