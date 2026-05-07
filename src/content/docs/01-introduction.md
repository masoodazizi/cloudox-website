---
title: Introduction to CloudoX
description: What CloudoX is, what it isn't, and who it's for.
section: Getting Started
order: 1
---

CloudoX is an AI-powered cloud discovery and documentation platform. It scans cloud environments, builds a structured knowledge model, and generates stakeholder-ready discovery reports.

The MVP focuses on **AWS**, including:

- Multi-account AWS Organizations environments
- Multi-region resource discovery
- Architecture, networking, security, and observability understanding
- Markdown discovery reports

CloudoX is designed to evolve into a broader multi-cloud discovery platform — Azure and GCP support are part of the roadmap.

## Who CloudoX is for

- AWS solutions architects and consultants
- Cloud engineers inheriting unfamiliar environments
- Pre-sales and cloud advisory teams
- Cloud platform and SRE teams auditing their own footprint

## What CloudoX is *not*

- **Not a CMDB** — CloudoX builds working understanding for a moment in time, not a permanent system of record.
- **Not a security scanner** — security findings focus on architectural exposure and obvious gaps, not vulnerability scanning or compliance.
- **Not a diagram-only tool** — CloudoX produces structured Markdown documentation. Understanding comes first; visuals support it.

## Core principles

- **Evidence over assumptions** — every important finding is backed by AWS-native evidence or clearly labeled as inferred.
- **AWS as the source of truth** — Config, Organizations, Resource Explorer, service APIs, and tags are primary sources.
- **Structured data first** — raw cloud data is normalized into typed models before any AI runs.
- **Confidence is explicit** — inferred entities carry a confidence level (high / medium / low) and a list of evidence.
