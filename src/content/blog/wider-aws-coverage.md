---
title: "More of AWS, with the gaps shown"
description: "How CloudoX's AWS discovery grew from a handful of services to layered coverage that names what it sees and what it doesn't."
pubDate: 2026-05-19
author: "The CloudoX team"
tags: ["cloudox", "discovery", "aws"]
cover: "/blog/covers/wider-aws-coverage.svg"
coverAlt: "CloudoX cover image for More of AWS, with the gaps shown"
draft: false
---

AWS is enormous. A single account can lean on a handful of core services or a few hundred, and no report can go deep on everything at once without turning into noise. That's the honest problem behind AWS discovery, and it's worth being upfront about.

The first version of CloudoX covered the services a cloud architect reasons about most — EC2, S3, IAM, VPC, RDS, Lambda, and a handful of others. That was enough for a genuinely useful first report.

But almost every real environment eventually reaches past that list. Auth built on Cognito, an event bus in EventBridge, a long tail that includes Step Functions or AppSync. A report that stays silent about those resources isn't more focused — it's just incomplete, and incomplete reports lose trust the moment someone notices what's missing.

## Depth where it matters, breadth for the rest

Going equally deep on every AWS service doesn't scale, and most of the long tail doesn't need the same depth as a VPC or an IAM role. What it does need is to be seen at all — named, placed in the picture, and counted as evidence, even without every property filled in.

So CloudoX combines two things: deep, opinionated understanding for the services that drive the architecture story, and a broader, lighter pass that keeps the rest of the account visible. Both feed the same knowledge graph, and nothing gets counted twice.

## Naming the gaps

A discovery report that quietly underreports is worse than a thin one that says so. That's why the report carries a **Coverage and gaps** section: what was captured, and where AWS shows resources CloudoX hasn't gone deep on yet. If the broader pass is off for a given run, the section says that plainly instead of implying complete coverage.

Consultants walking into an unfamiliar AWS estate need to know what was looked at, not just what was found. That's the smaller, more honest promise underneath this: not "we saw everything," but "here's exactly what we saw, and here's what's still open."
