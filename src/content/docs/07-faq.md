---
title: FAQ
description: Answers to common questions about CloudoX.
section: Reference
order: 1
---

## Does CloudoX modify anything in my AWS environment?

No, and it can't. CloudoX only calls describe and list operations. The permissions it needs are declared in one place in the codebase, and an automated test walks every collector on each commit — failing the build if anything creates, modifies, or deletes. Read-only is enforced by the build rather than promised in a document. See [security](/security).

## What exactly can CloudoX read in my account?

Configuration metadata: how resources are set up, how the network is put together, how access is structured, resource tags, and account and region structure. Not the contents of your systems — no objects or files, no secrets or environment variables, no database rows, no logs.

The access it asks for is generated from its own collector code, so you can print the exact permission set and hand it to your security team before granting anything. It deliberately excludes data-plane reads, and also excludes EC2 user data and Lambda environment variables — two things broad AWS-managed audit policies would grant and that commonly carry credentials. The [security page](/security) lists the exclusions.

## Do I have to grant CloudoX access to my account at all?

No. CloudoX runs as a command-line tool inside your own environment, with your own credentials, writing to your own storage — no CloudoX account and no cross-account role. If you would rather evaluate it without granting a vendor anything, that is the supported way to do it.

## Does my infrastructure data get sent to an LLM?

Only a bounded summary of already-interpreted knowledge, and only if you want narration. Discovery and analysis are deterministic and involve no model at all; raw provider data, the full knowledge graph, and billing records never reach one.

You can also turn narration off completely and still get a full report, or run narration through Amazon Bedrock in your own AWS account so it stays inside your own model boundary.

## Can't we just build this ourselves with an LLM and a script?

You can build the first version in an afternoon, and it will look convincing. The gap shows up in three places.

**Where relationships come from.** A model reading raw API output infers connections from names and adjacency. It will assert links that don't exist and miss ones that do, and neither is visible in the output. CloudoX derives relationships deterministically from provider evidence, and every one carries the evidence it came from. The model describes those relationships; it never decides them.

**Whether you get the same answer twice.** Prompt-driven analysis isn't reproducible. Every layer of CloudoX's analysis is deterministic and content-hashed, which is also what makes comparing two discovery runs meaningful — you can't diff runs whose differences might just be model variance.

**How you know nothing was invented.** CloudoX rejects any statement citing something outside the evidence it was given, validates the finished report, and scores whether each audience view actually answered its audience's questions. A script has a person reading the output and hoping.

Then there's the part nobody budgets for: keeping collectors correct across dozens of services as provider APIs drift, and doing it forever. The realistic comparison isn't tooling cost against a weekend project — it's against what an environment handover currently costs you in senior engineering time.

## Does CloudoX support AWS Organizations and multiple accounts?

Yes. CloudoX is designed for multi-account AWS Organizations environments and tracks workloads, networking, and dependencies across accounts.

## Does CloudoX support multiple regions?

Yes. Resources, networking, and dependencies are tracked per region.

## Does CloudoX use AI?

CloudoX is AI-assisted, not AI-invented. Deterministic analysis decides the facts and the meaning; AI narrates that interpreted knowledge in plain language. AI does **not** invent ownership, environments, or architecture, and the model never sees raw cloud data — only a closed, citeable context. See [trust and the role of AI](/docs/05-trust-and-ai).

## What are Knowledge Views?

Knowledge Views are audience lenses over the same interpreted knowledge — Generic, Executive, Architect, Operations, Security, and FinOps. Each one frames the understanding a specific stakeholder needs. Different audiences get different explanations and priorities, never different truths. See [Knowledge Views](/docs/knowledge-views).

## What does the output look like?

Audience-specific, AI-narrated understanding in clean Markdown — one page per Knowledge View — plus architecture diagrams generated from the knowledge graph. You can read it in a hosted dashboard, commit it to Git, or browse the [sanitised public example](/docs/04-discovery-report).

## Can I keep my report?

Yes. Reports are plain Markdown files. You can commit them to a repo, drop them into Confluence, or share them as you would any document.

## Will CloudoX support Azure or GCP?

Azure and GCP are part of the roadmap. The architecture is designed to be multi-cloud — see the [multi-cloud vision doc](/docs/06-multi-cloud-vision).

## Is CloudoX a CMDB or security scanner?

No. CloudoX is an intelligent cloud knowledge platform — it discovers, interprets, and explains cloud environments. It is intentionally not a CMDB, vulnerability scanner, compliance product, or FinOps platform.

## Is CloudoX only a documentation tool?

No. A report is one way to read the knowledge CloudoX builds — not the product. The core is an evidence-grounded knowledge graph and its interpretation; Knowledge Views, AI-narrated reports, architecture diagrams, and a hosted dashboard are all lenses on top of it. Two further consumption layers ship in early form today: **Environment Evolution** (what changed between two discoveries) and **Cost Intelligence** (spend explained in architectural context). Both are first versions and deliberately narrow.

## Does CloudoX track what changes over time?

A first version does. **Environment Evolution** records each discovery run and compares the current one against the previous run, then reports what was added, removed, or modified — backed by evidence, never invented. The first run is recorded as a baseline. Continuous and scheduled discovery is still a direction on the roadmap.

## Does CloudoX cover every AWS service?

CloudoX combines deep collectors for the architecture-critical services with a broader, lightweight sweep across the rest of the account. The report includes a **Coverage and gaps** section that states what was captured and where resources exist that the deep collectors do not yet type — so you always know what was and wasn't looked at.

## Where does the name CloudoX come from?

It started as a play on **Cloud Documentation**: Cloud Documentation → Cloud Docs → Cloudocs → **CloudoX**. The capital `X` keeps the nod to documentation while signalling discovery and exploration — "X marks the spot" for mapping unfamiliar cloud territory. The product has since grown into a cloud knowledge platform, but the name kept its roots.

## How do I get access?

[Request early access](/contact) — we're working hands-on with a small group of consultants and engineers to shape the platform.
