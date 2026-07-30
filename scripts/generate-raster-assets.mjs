#!/usr/bin/env node
// Rasterizes the site's vector and oversized assets into right-sized PNGs.
//
// Two problems this solves:
//
//   1. Social preview cards. Most consumers of `og:image` (X, LinkedIn, Slack,
//      Facebook, iMessage) do not render SVG, so an SVG-only card shows as no
//      card at all. Every SVG that is used as an `og:image` gets a 1200x630
//      PNG sibling here.
//   2. The brand wordmark. The v4 PNG pack is a ~670 KB, 2454x448 master that
//      the header renders at 26 px tall — downloaded in full on every page.
//      This emits display-sized 1x/2x variants next to the master.
//
// Outputs are committed to `public/` so the deployed site never depends on a
// build-time image pipeline, and are byte-stable for a given input (the script
// rewrites only when the result differs).
//
// Usage:
//   node scripts/generate-raster-assets.mjs [--check]
//
// `--check` verifies every expected output exists and is current without
// writing, for use in CI or before a release.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC = join(ROOT, "public");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Wordmark variant heights. The site renders the wordmark at 26 px (header) and
 * 32 px (footer), so a 32 px variant covers standard-density displays and a
 * 64 px variant covers both at 2x. `Logo.astro` derives its `srcset` density
 * descriptors from these same numbers, and falls back to the master asset for
 * any size a variant cannot serve.
 */
const LOGO_HEIGHTS = [32, 64];

const checkOnly = process.argv.includes("--check");

let written = 0;
let stale = 0;

/** Writes only when the bytes differ, so reruns stay no-ops. */
function emit(path, buffer) {
  const relPath = path.replace(`${PUBLIC}/`, "");
  const current = existsSync(path) ? readFileSync(path) : null;
  if (current && current.equals(buffer)) return;

  if (checkOnly) {
    stale += 1;
    console.error(`stale or missing: public/${relPath}`);
    return;
  }
  writeFileSync(path, buffer);
  written += 1;
  const kb = (buffer.byteLength / 1024).toFixed(1);
  console.log(`wrote public/${relPath} (${kb} KB)`);
}

/** Every SVG that is referenced as an og:image somewhere in the site. */
function socialCardSources() {
  const sources = [join(PUBLIC, "og/cloudox-og.svg")];
  const coversDir = join(PUBLIC, "blog/covers");
  if (existsSync(coversDir)) {
    for (const entry of readdirSync(coversDir).sort()) {
      if (entry.endsWith(".svg")) sources.push(join(coversDir, entry));
    }
  }
  return sources.filter((source) => existsSync(source));
}

async function rasterizeSocialCards() {
  for (const source of socialCardSources()) {
    const png = await sharp(readFileSync(source), { density: 144 })
      .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover" })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    emit(source.replace(/\.svg$/, ".png"), png);
  }
}

async function resizeWordmarks() {
  const variants = [
    "brand/logo/v4/logo-v4-bright-bg.png",
    "brand/logo/v4/logo-v4-dark-bg.png",
  ];
  for (const relPath of variants) {
    const source = join(PUBLIC, relPath);
    if (!existsSync(source)) {
      console.error(`missing wordmark source: public/${relPath}`);
      continue;
    }
    for (const height of LOGO_HEIGHTS) {
      const png = await sharp(readFileSync(source))
        .resize({ height, withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer();
      emit(source.replace(/\.png$/, `-h${height}.png`), png);
    }
  }
}

/** Reports the byte weight of what the header actually downloads. */
function reportLogoBudget() {
  const master = join(PUBLIC, "brand/logo/v4/logo-v4-bright-bg.png");
  const display = join(PUBLIC, `brand/logo/v4/logo-v4-bright-bg-h${LOGO_HEIGHTS.at(-1)}.png`);
  if (!existsSync(master) || !existsSync(display)) return;
  const kb = (path) => (statSync(path).size / 1024).toFixed(1);
  console.log(`wordmark: master ${kb(master)} KB → high-density variant ${kb(display)} KB`);
}

await rasterizeSocialCards();
await resizeWordmarks();
reportLogoBudget();

if (checkOnly && stale > 0) {
  console.error(
    `\n${stale} raster asset(s) missing or out of date. Run: npm run assets`,
  );
  process.exit(1);
}
if (!checkOnly) {
  console.log(written === 0 ? "all raster assets up to date" : `${written} asset(s) written`);
}
