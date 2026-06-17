---
title: Multi-cloud vision
description: AWS-first today, multi-cloud tomorrow — and why the architecture is ready for it.
section: Concepts
order: 7
---

The CloudoX MVP is focused on AWS, but the architecture is intentionally built to be multi-cloud.

## Today: AWS-first

The first release is production-grade AWS discovery:

- AWS Organizations and multi-account support
- Multi-region resource discovery
- AWS-native data sources (Config, Organizations, Resource Explorer, service APIs, tags)
- Markdown discovery reports

## Tomorrow: Azure and GCP

The roadmap covers:

- **Azure** — subscription and management group discovery, identity, networking, and compute coverage.
- **GCP** — organization, folder, and project discovery, with GCP-native networking, IAM, and compute.
- **Unified multi-cloud discovery** — a cross-cloud knowledge graph with consistent reporting structure across providers.

## Why the architecture is ready

The layered architecture (discovery → knowledge graph → interpretation → intelligence → views → narration) makes adding a new cloud a matter of:

1. Adding new collectors for the cloud's native data sources.
2. Mapping the cloud's resources into the existing typed knowledge model.
3. Adding cloud-specific relationship extractors.
4. Reusing the same interpretation, intelligence, Knowledge Views, and narration layers.

Only the discovery and graph-mapping layers are provider-specific. The knowledge model, interpretation, intelligence, and Knowledge Views are designed to be cloud-shaped, not AWS-shaped — so Azure and GCP plug in without rewriting the platform.
