---
title: "Diagrams that explain how an environment works"
description: "The road to architecture diagrams in CloudoX: why a resource map isn't enough, and how we landed on diagrams the AI designs and CloudoX draws."
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

## Two jobs, kept separate

The fix was to split the work into two responsibilities that don't belong together.

Deciding what a diagram should say is a judgement call: which resources matter, how to group them, what to label a cluster of things, which relationships are worth a line. That is where AI is genuinely good. Drawing the result — placing every element, routing every arrow, producing the same image every time — should be boring and exact. That is where AI is a liability and a deterministic renderer belongs.

So CloudoX works in layers. It takes the knowledge graph it already builds, reduces it to a focused slice for one section of the report, and asks the model to design a diagram from it. The model returns a structured description of the picture, not the picture itself. CloudoX validates that description against what it actually discovered, then renders it to an image and drops it into the report next to the prose it supports.

## Keeping the picture honest

Because the renderer is deterministic and the design is checked against the graph, the diagram can't quietly invent a resource, a relationship, or an exposure path that the discovery didn't find. The model gets to be creative about clarity; it doesn't get to be creative about facts. That line is the whole point of the feature.

Most of the remaining work was unglamorous: making the output actually readable. Real service icons instead of generic shapes, clean grouping for accounts and networks, arrows that connect things without crossing through them, labels that stay short. Each pass looked a little more like a diagram an architect would draw by hand, and a little less like something a machine generated.

It's a first working version, and there's plenty left to refine. But it now does the thing we wanted at the start: it shows how an environment fits together, from the same evidence the rest of the report is built on.
