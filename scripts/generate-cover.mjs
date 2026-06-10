#!/usr/bin/env node
// Deterministic, dependency-free SVG cover generator for CloudoX blog posts.
//
// Produces a 1200x630 (Open Graph ratio) brand-consistent cover image that
// matches the look of public/og/cloudox-og.svg: dark gradient, grid pattern,
// accent glow, and a subtle "knowledge graph" node motif (a nod to the
// product). Output is written to public/blog/covers/<slug>.svg and is also
// usable as the per-post og:image.
//
// Usage:
//   node scripts/generate-cover.mjs <slug> [--title "..."] [--tag "..."]
//                                          [--accent "#2f80ff"] [--force]
//   node scripts/generate-cover.mjs --all          # regenerate every post's cover
//
// When --title / --tag are omitted they are read from the post frontmatter at
// src/content/blog/<slug>.md. The script never edits the Markdown file; add the
// `cover:` field to frontmatter yourself (the skill workflow does this).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BLOG_DIR = join(ROOT, "src/content/blog");
const COVERS_DIR = join(ROOT, "public/blog/covers");

const WIDTH = 1200;
const HEIGHT = 630;

// Brand-aligned accent themes (glow + motif colour). Keyed by tag so related
// posts share a tone; falls back to a deterministic pick from the slug.
const THEMES = {
  discovery: "#2f80ff",
  aws: "#2f80ff",
  cost: "#22b8a6",
  evolution: "#7c5cff",
  security: "#ff7847",
  diagrams: "#58a3ff",
  reporting: "#22b8a6",
  cloudox: "#2f80ff",
};
const THEME_ROTATION = ["#2f80ff", "#58a3ff", "#7c5cff", "#22b8a6", "#ff7847"];
// Generic tags carry the default brand blue; prefer a more specific topic tag
// for the accent so covers vary by subject rather than all looking the same.
const GENERIC_TAGS = new Set(["cloudox", "aws", "discovery"]);

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 — small deterministic PRNG seeded from the slug.
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Parse the flat frontmatter block we use for blog posts. Good enough for the
// controlled schema (title, tags); not a general YAML parser.
function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (key === "tags") {
      const arr = [...val.matchAll(/"([^"]*)"|'([^']*)'/g)].map((x) => x[1] ?? x[2]);
      out.tags = arr;
      continue;
    }
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

// Choose the largest font size from a ladder that fits the title in <=3 lines.
function layoutTitle(title) {
  const maxWidth = 760;
  const ladder = [76, 68, 60, 52];
  const words = title.split(/\s+/).filter(Boolean);
  for (const size of ladder) {
    const maxChars = Math.floor(maxWidth / (size * 0.56));
    const lines = wrap(words, maxChars);
    if (lines.length <= 3) return { size, lines };
  }
  const size = 52;
  const maxChars = Math.floor(maxWidth / (size * 0.56));
  let lines = wrap(words, maxChars);
  if (lines.length > 3) {
    lines = lines.slice(0, 3);
    lines[2] = lines[2].replace(/\s*\S*$/, "") + "…";
  }
  return { size, lines };
}

function wrap(words, maxChars) {
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// A small constellation of nodes + edges on the right, evoking a knowledge graph.
function buildMotif(rng, accent) {
  const nodes = [];
  const count = 7;
  const xMin = 740, xMax = 1110, yMin = 130, yMax = 520;
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: xMin + rng() * (xMax - xMin),
      y: yMin + rng() * (yMax - yMin),
      r: 5 + rng() * 7,
    });
  }
  // Make one node a "hub".
  const hub = Math.floor(rng() * count);
  nodes[hub].r = 16;

  const edges = [];
  for (let i = 0; i < count; i++) {
    if (i === hub) continue;
    edges.push([hub, i]); // spokes from the hub
    if (rng() > 0.5) {
      const j = Math.floor(rng() * count);
      if (j !== i) edges.push([i, j]);
    }
  }

  let svg = `  <g opacity="0.9">\n`;
  for (const [a, b] of edges) {
    svg += `    <line x1="${nodes[a].x.toFixed(1)}" y1="${nodes[a].y.toFixed(1)}" x2="${nodes[b].x.toFixed(1)}" y2="${nodes[b].y.toFixed(1)}" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.28"/>\n`;
  }
  nodes.forEach((n, i) => {
    const isHub = i === hub;
    const fill = isHub ? accent : i % 2 === 0 ? "#58a3ff" : "#2a3340";
    svg += `    <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${(n.r + 6).toFixed(1)}" fill="${accent}" opacity="0.10"/>\n`;
    svg += `    <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="${fill}" stroke="#0a0d12" stroke-width="2"/>\n`;
  });
  svg += `  </g>\n`;
  return svg;
}

function buildSvg({ slug, title, eyebrow, accent }) {
  const rng = makeRng(hash(slug));
  const { size, lines } = layoutTitle(title);
  const motif = buildMotif(rng, accent);

  const titleBlockHeight = lines.length * (size * 1.12);
  const titleStartY = 330 - titleBlockHeight / 2 + size * 0.8;
  const titleTspans = lines
    .map((line, i) => {
      const y = titleStartY + i * size * 1.12;
      return `      <tspan x="100" y="${y.toFixed(0)}">${escapeXml(line)}</tspan>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0d12"/>
      <stop offset="1" stop-color="#11161f"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="8%" r="70%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#1f2733" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" opacity="0.5"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

${motif}
  <g font-family="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif">
    <text x="100" y="120" font-size="22" letter-spacing="4" font-weight="600" fill="${accent}">${escapeXml(eyebrow)}</text>

    <text font-size="${size}" font-weight="700" letter-spacing="-1.5" fill="#f7f8fa">
${titleTspans}
    </text>

    <text x="100" y="556" font-size="26" font-weight="700" letter-spacing="-0.5">
      <tspan fill="#eef0f4">Cloudo</tspan><tspan fill="${accent}">X</tspan>
    </text>
    <text x="1100" y="556" font-size="24" font-weight="600" fill="#8b95a7" text-anchor="end">cloudox.io</text>
  </g>
</svg>
`;
}

function resolveAccent({ tags, accentArg }) {
  if (accentArg) return accentArg;
  const keys = (tags ?? []).map((t) => t.toLowerCase());
  // Prefer a specific topic tag over the generic brand tags.
  for (const k of keys) {
    if (!GENERIC_TAGS.has(k) && THEMES[k]) return THEMES[k];
  }
  for (const k of keys) {
    if (THEMES[k]) return THEMES[k];
  }
  const primary = keys.find((k) => !GENERIC_TAGS.has(k)) ?? keys[0] ?? "";
  return THEME_ROTATION[hash(primary || "cloudox") % THEME_ROTATION.length];
}

function generateForSlug(slug, opts = {}) {
  const file = join(BLOG_DIR, `${slug}.md`);
  let fm = {};
  if (existsSync(file)) fm = parseFrontmatter(readFileSync(file, "utf8"));

  const title = opts.title ?? fm.title;
  if (!title) {
    throw new Error(`No title for "${slug}" (pass --title or add it to ${file}).`);
  }
  const tags = opts.tag ? [opts.tag] : fm.tags ?? [];
  // The eyebrow label only skips the brand tag itself ("cloudox"); topic tags
  // like "discovery" are fine to surface.
  const topic =
    opts.tag ??
    tags.find((t) => t.toLowerCase() !== "cloudox") ??
    tags[0] ??
    "CloudoX";
  const eyebrow = topic.toUpperCase();
  const accent = resolveAccent({ tags, accentArg: opts.accent });

  const svg = buildSvg({ slug, title, eyebrow, accent });
  mkdirSync(COVERS_DIR, { recursive: true });
  const outPath = join(COVERS_DIR, `${slug}.svg`);
  writeFileSync(outPath, svg, "utf8");
  return { outPath, accent, title };
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all" || a === "--force") args[a.slice(2)] = true;
    else if (a.startsWith("--")) args[a.slice(2)] = argv[++i];
    else args._.push(a);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.all) {
    const slugs = readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
      .map((f) => basename(f).replace(/\.(md|mdx)$/, ""));
    for (const slug of slugs) {
      const { outPath, accent } = generateForSlug(slug);
      console.log(`✓ ${slug}  ${accent}  →  ${outPath.replace(ROOT + "/", "")}`);
    }
    return;
  }

  const slug = args._[0];
  if (!slug) {
    console.error("Usage: node scripts/generate-cover.mjs <slug> [--title ...] [--tag ...] [--accent #hex]");
    console.error("       node scripts/generate-cover.mjs --all");
    process.exit(1);
  }
  const { outPath, accent, title } = generateForSlug(slug, {
    title: args.title,
    tag: args.tag,
    accent: args.accent,
  });
  console.log(`✓ Cover for "${title}"`);
  console.log(`  accent: ${accent}`);
  console.log(`  file:   ${outPath.replace(ROOT + "/", "")}`);
  console.log(`  add to frontmatter:`);
  console.log(`    cover: "/blog/covers/${slug}.svg"`);
  console.log(`    coverAlt: "Cover image for ${title}"`);
}

main();
