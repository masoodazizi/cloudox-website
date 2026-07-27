---
title: "Diagrams that explain how an environment works"
description: "The road to architecture diagrams in CloudoX: why a resource map isn't enough, and what it takes to keep a diagram grounded in evidence."
pubDate: 2026-06-09
author: "The CloudoX team"
tags: ["cloudox", "diagrams", "aws"]
cover: "/blog/covers/diagrams-that-explain-the-architecture.svg"
coverAlt: "CloudoX cover image for Diagrams that explain how an environment works"
draft: false
---

A discovery report is easier to trust when you can see the environment, not just read about it. So from early on we wanted CloudoX to draw the architecture it discovers. Getting there took longer than the rest of the report, and it's worth saying why.

## The first version looked like an inventory

Our first diagrams projected resources straight onto a canvas: every service became a box, every connection a line. They were accurate and almost useless. A wall of boxes answers "what exists?" when the question a consultant actually has is "how does this work?" A good architecture diagram leaves things out on purpose — it groups, names, and simplifies until the shape of the system shows through. Raw projection does the opposite.

## Keeping the picture honest

Getting from there to something worth putting in a report meant treating two problems separately. Deciding what a diagram should say — which resources matter, how to group them, what a cluster of things should be called — is a design decision. Drawing it precisely, the same way every time, is a different kind of work, and it's the part that has to be exact.

We keep those two apart, and every diagram is checked against what CloudoX actually discovered before it's published. A resource or a relationship that isn't backed by evidence is rejected rather than drawn — the whole point of the design is to keep the picture grounded in what was found, not in what would simply look good.

## Making it readable

Most of the remaining work was unglamorous: making the output actually readable. Real service icons instead of generic shapes, clean grouping for accounts and networks, arrows that connect things without crossing through them, labels that stay short. Each pass looked a little more like a diagram an architect would draw by hand, and a little less like something churned out on the fly.

It's a first working version, and there's plenty left to refine. But it now does the thing we wanted at the start: it shows how an environment fits together, from the same evidence the rest of the report is built on.
