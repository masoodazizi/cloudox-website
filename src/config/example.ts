/**
 * Facts from the public, sanitized CloudoX example report.
 *
 * Every number on the website that describes a real environment comes from
 * here, and every number carries the basis it was derived from. The rule is
 * the product's own: a count is never published without saying what it counts
 * and what it excludes.
 *
 * Source of truth: the published example report
 * (https://github.com/cloudox-ai/cloudox-public-examples, mirrored at
 * https://preview.cloudox.io). Each entry below is quoted from that report —
 * do not adjust a figure here without re-reading the corresponding section.
 * All identifiers in the example are deterministic synthetic replacements, so
 * they are safe to show publicly.
 */

export const EXAMPLE = {
  /** Where a reader can verify every figure on this page for themselves. */
  previewUrl: "https://preview.cloudox.io",
  repoUrl: "https://github.com/cloudox-ai/cloudox-public-examples",
  /** Discovery date of the published snapshot (report `generated_at`). */
  generatedAt: "2026-07-21",
  generatedAtLabel: "21 July 2026",
  /** Wall-clock label used in the proof caption. */
  workspace: "cloudox-demo",
} as const;

export type ConfidenceLabel = "Verified" | "Likely" | "Assumed" | "Unknown";

/**
 * The account structure exactly as the example publishes it: the friendly name
 * CloudoX derived, the provider identifier it was derived from, and the
 * per-account confidence. Source: the Scope of Assessment table in
 * `views/security/security-overview.md`.
 *
 * Deliberately no per-account scope claim — the report states the headline
 * "6 of 7 known accounts in scope" without naming the excluded account, so
 * neither does this.
 */
export interface ExampleAccount {
  name: string;
  id: string;
  confidence: ConfidenceLabel;
}

export const EXAMPLE_ACCOUNTS: ExampleAccount[] = [
  { name: "Management", id: "110319895932", confidence: "Verified" },
  { name: "Workload Prod", id: "122122642149", confidence: "Verified" },
  { name: "Workload Dev", id: "105769365151", confidence: "Verified" },
  { name: "Sandbox", id: "161388682021", confidence: "Verified" },
  { name: "Log Archive", id: "122980216815", confidence: "Likely" },
  { name: "Audit", id: "110019496666", confidence: "Likely" },
  { name: "Platform", id: "150982215529", confidence: "Likely" },
];

/**
 * One real finding, shown as an evidence trail: what was found, what
 * relationship supports it, and which resource it resolves to. Source:
 * `views/security/security-overview.md` and `views/executive/executive-summary.md`.
 */
export const EXAMPLE_EVIDENCE = {
  finding: "One security group became reachable from the internet since the previous run",
  confidence: "Verified" as ConfidenceLabel,
  trail: [
    { step: "Finding", detail: "New internet exposure — validate whether it was intentional" },
    { step: "Relationship", detail: "security group allows ingress from 0.0.0.0/0" },
    { step: "Resource", detail: "sg-0d6a48061beb72eae" },
  ],
  /** The counterpart change in the same period, so the delta reads honestly. */
  counterpart: "A different security group lost internet reachability in the same period",
} as const;

/**
 * What each audience lens leads with in the published example. `answer` is a
 * condensed quote from that view; `confidence` is the view's own overall
 * confidence label as published.
 */
export interface ExampleView {
  key: string;
  name: string;
  audience: string;
  question: string;
  answer: string;
  confidence: ConfidenceLabel;
  href: string;
}

export const EXAMPLE_VIEWS: ExampleView[] = [
  {
    key: "executive",
    name: "Executive",
    audience: "CTO / engineering leadership",
    question: "What deserves my attention?",
    answer:
      "Three areas: an internet exposure that opened since the last run, a disaster-recovery build-out to verify, and tagging debt that makes 94% of classification inferred rather than authoritative.",
    confidence: "Likely",
    href: "https://preview.cloudox.io",
  },
  {
    key: "architect",
    name: "Architect",
    audience: "Solutions / cloud architects",
    question: "How is this environment actually built?",
    answer:
      "A landing-zone account structure with 15 VPCs and 63 subnets; the production API workload fronted by an internet-facing load balancer and dependent on a PostgreSQL datastore.",
    confidence: "Likely",
    href: "https://preview.cloudox.io",
  },
  {
    key: "operations",
    name: "Operations",
    audience: "Platform & operations engineers",
    question: "What breaks first, and what can't I confirm?",
    answer:
      "The production API has a verified dependency on one database instance — the highest-priority resource to keep available. Two meta-collectors were unavailable, so gap assessments are lower bounds.",
    confidence: "Likely",
    href: "https://preview.cloudox.io",
  },
  {
    key: "security",
    name: "Security",
    audience: "Security & governance teams",
    question: "What is exposed, and what is unproven?",
    answer:
      "Three security groups are open to the internet, and 75 IAM roles exist with no customer-managed policies in evidence. Both are stated with the coverage gap that limits them.",
    confidence: "Verified",
    href: "https://preview.cloudox.io",
  },
  {
    key: "finops",
    name: "FinOps",
    audience: "FinOps & finance",
    question: "What is driving the bill?",
    answer:
      "Eight architectural cost drivers — ECS services, Lambda, API Gateway, a NAT gateway — not one dominant line item. Ranking signals, not dollar attribution: ~1% of resources carry a cost-allocation tag.",
    confidence: "Assumed",
    href: "https://preview.cloudox.io",
  },
  {
    key: "generic",
    name: "Generic",
    audience: "Any technical reader",
    question: "What is this environment?",
    answer:
      "A multi-account AWS environment across 6 of 7 known accounts and 2 regions, 833 resources, 4 significant workloads, with every unknown named rather than smoothed over.",
    confidence: "Likely",
    href: "https://preview.cloudox.io",
  },
];
