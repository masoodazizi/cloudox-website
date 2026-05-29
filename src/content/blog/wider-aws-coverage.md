---
title: "More of AWS, with the gaps shown"
description: "How CloudoX's AWS discovery grew from a handful of services to layered coverage that names what it sees and what it doesn't."
pubDate: 2026-05-19
author: "The CloudoX team"
tags: ["cloudox", "discovery", "aws"]
---

The first version of CloudoX covered a few AWS services well. EC2, S3, IAM, VPC, RDS, Lambda — the core surface a cloud architect actually reasons about. It was enough for the first useful report, and we shipped it.

Then the feedback started landing.

> "Great, but we use Cognito heavily for the auth side."
>
> "What about the EventBridge buses our platform team relies on?"
>
> "Our long tail is Step Functions and AppSync. Why are they missing?"

The answer at the time was: each new service meant a new collector, a normalisation pass, and a new test suite. We kept adding them — Backup, Access Analyzer, GuardDuty, ECS, EKS, CloudFront, KMS, and a few dozen others — until typed coverage spanned the services that show up in most real engagements.

That bought us breadth, but not enough.

## The wall we hit

AWS has hundreds of services. Writing one collector per service does not scale, and most of the long tail does not need the same depth as a VPC or an IAM role. A team that uses MediaStore or AppMesh wants the report to *know* those resources exist; it does not need the full property bag for them.

We needed two things working together: deep, opinionated collection for the architecture-critical services, and broad, lightweight coverage for everything else.

## The shape we landed on

CloudoX now runs a layered discovery model. The deep collectors keep doing what they did — pulling typed properties, tags, and relationships for the services that drive the architecture story. On top of them, a second layer uses AWS-native cross-service inventory to sweep the rest of the account.

The combined output flows through the same knowledge graph, with one safeguard: a resource the deep collectors already captured is never re-listed by the broader sweep. The reader sees one consistent picture, not two overlapping ones.

## Why the gaps are part of the report

A discovery report that quietly underreports is worse than a thin one. So the report carries a new section, **Coverage and gaps**, that states what CloudoX captured and where AWS itself reports resources the deep collectors do not yet type. If the broader layer is turned off, the section says so plainly rather than implying total coverage.

The point is small but, we think, important. Consultants walking into an unfamiliar AWS estate need to know what was looked at, what was found, and what the tool could not yet see. Deep collectors will keep landing where the property bag matters. The broader layer is what keeps the rest of the account from quietly disappearing in between.
