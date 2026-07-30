/**
 * Tests against the production build output (`dist/`).
 *
 * Requires `npm run build` to have run first — the `npm test` script does
 * this automatically (`npm run build && node --experimental-strip-types --test`).
 * These tests exercise the actual static HTML Cloudflare Pages serves,
 * which is a closer proxy for "does the deployed site satisfy the legal
 * baseline" than testing component source directly.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LEGAL_NAV } from "../src/config/site.ts";
import { WEBSITE_PROCESSORS, LEGAL_OPERATOR } from "../src/config/legal.ts";
import redirectWorker from "../workers/redirect-www.js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, "dist");

function readDist(relPath: string): string {
  return readFileSync(join(DIST, relPath), "utf-8");
}

/** Every generated `index.html` under dist/, recursively. Used to assert
 * site-wide invariants (footer links, no analytics, no cookie banner) across
 * every actual page rather than a hand-picked subset. */
function allPageHtmlFiles(dir = DIST, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      allPageHtmlFiles(full, acc);
    } else if (entry.endsWith(".html")) {
      acc.push(full);
    }
  }
  return acc;
}

before(() => {
  if (!existsSync(DIST) || !existsSync(join(DIST, "index.html"))) {
    throw new Error(
      `dist/ not found or incomplete at ${DIST}. Run "npm run build" before "npm test" ` +
        `(the "test" script does this automatically).`,
    );
  }
});

describe("required legal/trust routes build successfully", () => {
  for (const route of ["imprint", "privacy", "terms", "security"]) {
    test(`/${route} produces non-empty HTML`, () => {
      const html = readDist(`${route}/index.html`);
      assert.ok(html.length > 500, `${route}/index.html looks too small (${html.length} bytes)`);
      assert.match(html, /<html/i);
    });
  }
});

describe("footer legal links appear on every generated page", () => {
  const pages = allPageHtmlFiles();
  assert.ok(pages.length > 10, "expected many generated pages, found suspiciously few");

  for (const file of pages) {
    const relPath = file.replace(`${DIST}/`, "");
    test(`${relPath} links to all four legal routes without a menu`, () => {
      const html = readFileSync(file, "utf-8");
      for (const item of LEGAL_NAV) {
        assert.match(
          html,
          new RegExp(`href="${item.href}"`),
          `${relPath} is missing a footer link to ${item.href}`,
        );
      }
      // The legal bar must be plain anchors, not hidden behind a <details>/menu toggle.
      assert.doesNotMatch(html, /<nav aria-label="Legal"[^>]*>\s*<button/i);
    });
  }
});

describe("Imprint content", () => {
  const html = readDist("imprint/index.html");

  test("contains the required operator identity", () => {
    for (const required of [
      "Masood Azizi",
      "CloudoX",
      "c/o Autorenglück #33770",
      "Albert-Einstein-Str. 47",
      "02977",
      "Hoyerswerda",
      "legal@cloudox.io",
    ]) {
      assert.ok(html.includes(required), `imprint page is missing "${required}"`);
    }
  });

  test("does not publish the previous home address", () => {
    assert.doesNotMatch(html, /Innsbrucker/);
  });

  test("does not contain a phone number placeholder", () => {
    assert.doesNotMatch(html, /Phone:|Tel\.:|Telefon/i);
  });

  test("does not contain a VAT ID placeholder", () => {
    assert.doesNotMatch(html, /\bVAT ID\b|\bUSt-IdNr\b/i);
  });

  test("does not contain a commercial-register placeholder", () => {
    assert.doesNotMatch(html, /Amtsgericht|Handelsregister|\bHRB\b|\bHRA\b|Commercial Register/i);
  });

  test('does not use "UG" or "GmbH" as a legal form', () => {
    assert.doesNotMatch(html, /\bUG\b/);
    assert.doesNotMatch(html, /GmbH/);
  });

  test('does not use corporate-officer titles like "CEO" or "Founder"', () => {
    assert.doesNotMatch(html, /\bCEO\b/);
    assert.doesNotMatch(html, /Founder/i);
  });

  test("does not link to the discontinued EU ODR platform", () => {
    assert.doesNotMatch(html, /ec\.europa\.eu\/consumers\/odr/i);
  });
});

describe("Privacy content", () => {
  const html = readDist("privacy/index.html");

  test("names every verified active processor", () => {
    for (const processor of WEBSITE_PROCESSORS) {
      assert.ok(html.includes(processor.name), `privacy page is missing processor "${processor.name}"`);
    }
  });

  test("discloses that some processing may occur outside the EEA/Germany", () => {
    assert.match(html, /outside (the )?(EEA|Germany)/i);
  });

  test("does not claim that all data remains exclusively in Germany", () => {
    // The page legitimately discusses Germany (e.g. Zeeg's own claim); it must
    // instead explicitly negate the "everything stays in Germany" claim.
    const normalized = html.replace(/\s+/g, " ");
    assert.ok(
      normalized.includes("We do not claim that all website data remains exclusively in Germany"),
      "expected the explicit negation of the Germany-only claim to be present",
    );
  });

  test("does not promise absolute security or zero retention", () => {
    for (const forbidden of [
      "100% secure",
      "fully GDPR compliant",
      "we never store your data",
      "zero risk",
      "zero retention",
    ]) {
      assert.ok(!html.toLowerCase().includes(forbidden.toLowerCase()), `privacy page contains forbidden claim "${forbidden}"`);
    }
  });

  test("names the Berlin data protection authority for complaints", () => {
    assert.match(html, /Berlin Commissioner for Data Protection/i);
  });

  test("shows a Last updated date", () => {
    assert.match(html, /Last updated:/);
  });
});

describe("Terms content", () => {
  const html = readDist("terms/index.html");

  test('is scoped as "Website Terms of Use", not a SaaS subscription agreement', () => {
    assert.match(html, /Website Terms of Use/);
    assert.match(html, /not the future CloudoX SaaS subscription terms/i);
  });

  test("does not exclude liability for intent or gross negligence", () => {
    assert.match(html, /gross negligence/i);
  });

  test("does not link to the discontinued EU ODR platform", () => {
    assert.doesNotMatch(html, /ec\.europa\.eu\/consumers\/odr/i);
  });

  test("shows a Last updated date", () => {
    assert.match(html, /Last updated:/);
  });
});

describe("Security page claims", () => {
  const html = readDist("security/index.html");

  test("publishes the security disclosure address", () => {
    assert.ok(html.includes(LEGAL_OPERATOR.securityEmail));
  });

  test("does not claim certifications, audits, or guarantees it does not have", () => {
    for (const forbidden of [
      "SOC 2 certified",
      "SOC2 certified",
      "ISO 27001 certified",
      "independently audited",
      "zero risk",
      "guaranteed compliance",
    ]) {
      assert.ok(!html.toLowerCase().includes(forbidden.toLowerCase()), `security page contains forbidden claim "${forbidden}"`);
    }
  });

  test("explicitly states what is not yet true, rather than only strengths", () => {
    assert.match(html, /no third-party audit, SOC 2 report, or independent penetration test/i);
  });
});

describe("Contact form privacy notice", () => {
  const html = readDist("contact/index.html");

  test("shows a privacy acknowledgement linking to /privacy before the submit control", () => {
    const ackIndex = html.indexOf("you acknowledge that");
    const submitIndex = html.indexOf('data-submit');
    assert.notEqual(ackIndex, -1, "expected an acknowledgement sentence on the contact page");
    assert.notEqual(submitIndex, -1, "expected the submit control to be present");
    assert.ok(ackIndex < submitIndex, "the privacy acknowledgement must appear before the submit button in the document");
    assert.match(html.slice(ackIndex, ackIndex + 400), /href="\/privacy"/);
  });

  test("warns against submitting credentials or secrets near the free-text field", () => {
    const normalized = html.replace(/\s+/g, " ");
    assert.match(normalized, /don't include AWS credentials, account exports, secrets/i);
  });

  test("does not claim to never share information without naming the providers used", () => {
    assert.doesNotMatch(html, /Share your information/);
  });
});

describe("No non-essential third-party requests or trackers", () => {
  const pages = allPageHtmlFiles();

  test("no page loads Google Fonts, analytics, or tag-manager scripts", () => {
    const offenders: string[] = [];
    const patterns = [
      /fonts\.googleapis\.com/i,
      /fonts\.gstatic\.com/i,
      /googletagmanager\.com/i,
      /google-analytics\.com/i,
      /connect\.facebook\.net/i,
      /snap\.licdn\.com/i,
      /static\.hotjar\.com/i,
      /browser\.sentry-cdn\.com/i,
      /app\.posthog\.com/i,
    ];
    for (const file of pages) {
      const html = readFileSync(file, "utf-8");
      for (const pattern of patterns) {
        if (pattern.test(html)) offenders.push(`${file.replace(`${DIST}/`, "")}: ${pattern}`);
      }
    }
    assert.deepEqual(offenders, []);
  });

  test("no page renders an interactive cookie-consent banner/widget", () => {
    // Looks for an actual banner UI (class/id hooks, known consent-management
    // vendors, or an "Accept ... cookies" call-to-action) — not prose that
    // merely *discusses* cookies/consent, which /privacy legitimately does.
    const offenders: string[] = [];
    const patterns = [
      /class="[^"]*cookie-banner[^"]*"/i,
      /id="[^"]*cookie-banner[^"]*"/i,
      /class="[^"]*cookie-consent[^"]*"/i,
      /id="[^"]*cookie-consent[^"]*"/i,
      /cookiebot|onetrust|cookieyes|osano\.com|termly\.io|iubenda/i,
      /<button[^>]*>\s*accept (all )?cookies/i,
    ];
    for (const file of pages) {
      const html = readFileSync(file, "utf-8");
      for (const pattern of patterns) {
        if (pattern.test(html)) offenders.push(`${file.replace(`${DIST}/`, "")}: ${pattern}`);
      }
    }
    assert.deepEqual(offenders, []);
  });
});

describe("External links are implemented safely", () => {
  test("the Zeeg booking link opens in a new tab without leaking a referrer/opener", () => {
    const html = readDist("contact/index.html");
    const match = html.match(/<a[^>]+href="https:\/\/zeeg\.me\/cloudox"[^>]*>/);
    assert.ok(match, "expected a Zeeg booking link on the contact page");
    assert.match(match![0], /target="_blank"/);
    assert.match(match![0], /rel="noopener noreferrer"/);
  });
});

describe(".well-known/security.txt is present and complete", () => {
  test("is published at the RFC 9116 well-known path with the required fields", () => {
    const txt = readDist(".well-known/security.txt");
    assert.match(txt, /Contact:\s*mailto:security@cloudox\.io/);
    assert.match(txt, /Policy:\s*https:\/\/cloudox\.io\/security/);
    assert.match(txt, /Canonical:\s*https:\/\/cloudox\.io\/\.well-known\/security\.txt/);
  });
});

describe("Social and canonical metadata", () => {
  const pages = allPageHtmlFiles();

  test("every page emits exactly one og:type", () => {
    const offenders: string[] = [];
    for (const file of pages) {
      const html = readFileSync(file, "utf-8");
      const count = (html.match(/property="og:type"/g) ?? []).length;
      if (count !== 1) offenders.push(`${file.replace(`${DIST}/`, "")}: ${count}`);
    }
    assert.deepEqual(offenders, [], "expected one og:type per page");
  });

  test("blog articles declare og:type=article, other pages declare website", () => {
    const article = readDist("blog/welcome-to-cloudox/index.html");
    assert.match(article, /<meta property="og:type" content="article">/);
    for (const route of ["index.html", "product/index.html", "security/index.html"]) {
      assert.match(readDist(route), /<meta property="og:type" content="website">/);
    }
  });

  test("social card images are raster, since SVG og:image is widely unsupported", () => {
    const offenders: string[] = [];
    for (const file of pages) {
      const html = readFileSync(file, "utf-8");
      const match = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (!match) {
        offenders.push(`${file.replace(`${DIST}/`, "")}: no og:image`);
        continue;
      }
      if (match[1].endsWith(".svg")) offenders.push(`${file.replace(`${DIST}/`, "")}: ${match[1]}`);
    }
    assert.deepEqual(offenders, []);
  });

  test("every referenced social card image exists in the build output", () => {
    const missing: string[] = [];
    for (const file of pages) {
      const html = readFileSync(file, "utf-8");
      const match = html.match(/<meta property="og:image" content="https:\/\/cloudox\.io([^"]+)"/);
      if (match && !existsSync(join(DIST, match[1]))) {
        missing.push(`${file.replace(`${DIST}/`, "")} → ${match[1]}`);
      }
    }
    assert.deepEqual(missing, []);
  });

});

describe("The deployed Worker redirects www to the canonical apex host", () => {
  // Cloudflare Workers Static Assets rejects an absolute-URL `_redirects`
  // rule ("Only relative URLs are allowed", error 100324), so this host
  // redirect lives in workers/redirect-www.js instead — see wrangler.jsonc.
  test("redirects https://www to the apex, preserving path and query", async () => {
    const res = await redirectWorker.fetch(
      new Request("https://www.cloudox.io/product?ref=test"),
      {},
    );
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("location"), "https://cloudox.io/product?ref=test");
  });

  test("also redirects the http scheme to https on the apex", async () => {
    const res = await redirectWorker.fetch(new Request("http://www.cloudox.io/"), {});
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("location"), "https://cloudox.io/");
  });

  test("passes apex requests straight through to static assets", async () => {
    let calledWith: Request | null = null;
    const env = {
      ASSETS: {
        fetch: async (request: Request) => {
          calledWith = request;
          return new Response("ok");
        },
      },
    };
    const request = new Request("https://cloudox.io/product");
    const res = await redirectWorker.fetch(request, env);
    assert.equal(calledWith, request, "expected the apex request to reach env.ASSETS.fetch unmodified");
    assert.equal(await res.text(), "ok");
  });
});

describe("Page weight of the brand wordmark", () => {
  test("the header serves a display-sized wordmark, not the print master", () => {
    const html = readDist("index.html");
    // Both the light and dark variant (see Logo.astro's two-<img> theme
    // swap) must point at generated, display-sized variants.
    const light = html.match(/<img[^>]+class="logo-img-light"[^>]*>/);
    const dark = html.match(/<img[^>]+class="logo-img-dark"[^>]*>/);
    assert.ok(light, "expected the light-variant wordmark image in the header");
    assert.ok(dark, "expected the dark-variant wordmark image in the header");
    assert.match(light![0], /src="\/brand\/logo\/v4\/logo-v4-bright-bg-h\d+\.png"/);
    assert.match(light![0], /srcset="[^"]*-h\d+\.png \d/);
    assert.match(dark![0], /src="\/brand\/logo\/v4\/logo-v4-dark-bg-h\d+\.png"/);
    assert.match(dark![0], /srcset="[^"]*-h\d+\.png \d/);
  });

  test("no page references the multi-hundred-kilobyte master wordmark as an image source", () => {
    const offenders: string[] = [];
    for (const file of allPageHtmlFiles()) {
      const html = readFileSync(file, "utf-8");
      if (/(?:src|srcset)="\/brand\/logo\/v4\/logo-v4-(?:bright|dark)-bg\.png"/.test(html)) {
        offenders.push(file.replace(`${DIST}/`, ""));
      }
    }
    assert.deepEqual(offenders, []);
  });

  test("each wordmark variant stays within a sane byte budget", () => {
    for (const relPath of [
      "brand/logo/v4/logo-v4-bright-bg-h32.png",
      "brand/logo/v4/logo-v4-bright-bg-h64.png",
      "brand/logo/v4/logo-v4-dark-bg-h32.png",
      "brand/logo/v4/logo-v4-dark-bg-h64.png",
    ]) {
      const path = join(DIST, relPath);
      assert.ok(existsSync(path), `missing generated wordmark variant ${relPath}`);
      const kb = statSync(path).size / 1024;
      assert.ok(kb < 40, `${relPath} is ${kb.toFixed(1)} KB — regenerate with "npm run assets"`);
    }
  });
});

describe("Header navigation is accessible on small screens", () => {
  const html = readDist("index.html");

  test("the menu button declares its expanded state and the panel it controls", () => {
    const button = html.match(/<button[^>]+data-mobile-nav-toggle[^>]*>/);
    assert.ok(button, "expected a mobile navigation toggle");
    assert.match(button![0], /aria-expanded="false"/);
    assert.match(button![0], /aria-controls="mobile-nav"/);
    assert.match(html, /id="mobile-nav"/);
  });

  test("the header CTA has a short label for narrow viewports", () => {
    // The full label wraps to two lines beside the logo and menu button at 390px.
    assert.match(html, /<span class="sm:hidden">Get access<\/span>/);
    assert.match(html, /<span class="hidden sm:inline">Request Early Access<\/span>/);
  });

  test("the drawer also offers the primary action, since it is shortened outside", () => {
    const drawer = html.slice(html.indexOf('id="mobile-nav"'));
    assert.match(drawer.slice(0, 1500), /href="\/contact"/);
  });
});

describe("Theme toggle degrades without JavaScript", () => {
  const html = readDist("index.html");

  test("a manual theme toggle button is present, both on desktop and in the mobile drawer", () => {
    const matches = html.match(/data-theme-toggle/g);
    assert.ok(matches && matches.length >= 2, "expected the toggle in both the desktop header and the mobile drawer");
  });

  test("with no JavaScript, the system preference alone still decides the theme", () => {
    // No `data-theme` attribute is rendered server-side — only an explicit
    // click (which requires JS) ever sets one. Absent that, global.css's
    // plain `prefers-color-scheme` rules keep governing, so the page is
    // never stuck in the wrong theme just because JS failed to load.
    assert.doesNotMatch(html, /<html[^>]+data-theme=/);
  });

  test("the theme-color meta tag is singular and JS-updatable, not split across media queries", () => {
    const matches = html.match(/<meta name="theme-color"[^>]*>/g);
    assert.ok(matches && matches.length === 1, "expected exactly one theme-color meta tag");
    assert.doesNotMatch(matches![0], /media=/);
  });
});

describe("Structured data represents visible content", () => {
  test("every FAQPage question is also rendered as visible page text", () => {
    const html = readDist("security/index.html");
    const schemaBlock = html.match(/\{"@context":"https:\/\/schema\.org","@type":"FAQPage".*?\}(?=<\/script>)/);
    assert.ok(schemaBlock, "expected FAQPage structured data on /security");
    const schema = JSON.parse(schemaBlock![0]) as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    assert.ok(schema.mainEntity.length >= 4);

    // Compare against the rendered body with entities decoded the same way
    // Astro escapes them, so quoted copy still matches.
    const body = html
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&#8217;|&rsquo;/g, "\u2019")
      .replace(/&#8212;|&mdash;/g, "\u2014")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");

    for (const entry of schema.mainEntity) {
      assert.ok(
        body.includes(entry.name.replace(/\s+/g, " ")),
        `FAQ question is in structured data but not visible on the page: "${entry.name}"`,
      );
      const answerStart = entry.acceptedAnswer.text.slice(0, 60).replace(/\s+/g, " ");
      assert.ok(
        body.includes(answerStart),
        `FAQ answer is in structured data but not visible on the page: "${answerStart}…"`,
      );
    }
  });
});

describe("Contact form works without JavaScript", () => {
  const html = readDist("contact/index.html");

  test("posts to a real endpoint instead of re-requesting the current page", () => {
    const form = html.match(/<form[^>]+id="contact-form"[^>]*>/);
    assert.ok(form, "expected the contact form");
    assert.match(form![0], /method="POST"/i);
    assert.match(form![0], /action="https:\/\/api\.web3forms\.com\/submit"/);
  });

  test("carries the fields a plain POST needs, including a confirmation target", () => {
    assert.match(html, /name="access_key"/);
    assert.match(html, /name="redirect" value="https:\/\/cloudox\.io\/thanks"/);
    assert.ok(existsSync(join(DIST, "thanks/index.html")), "expected the /thanks confirmation page");
  });

  test("the confirmation page is not indexable and stays out of the sitemap", () => {
    assert.match(readDist("thanks/index.html"), /<meta name="robots" content="noindex/);
    const sitemap = readDist("sitemap-0.xml");
    assert.doesNotMatch(sitemap, /\/thanks/);
  });
});

describe("Product page leads with verifiable product proof", () => {
  const html = readDist("product/index.html");

  test("shows real example figures in the page", () => {
    for (const figure of ["833", "6 of 7", "4 of 5", "92.06"]) {
      assert.ok(html.includes(figure), `product page is missing the example figure "${figure}"`);
    }
  });

  test("labels the proof as a sanitized example rather than implying a live customer", () => {
    assert.match(html, /Sanitized example/i);
    assert.match(html, /synthetic equivalents/i);
  });

  test("qualifies the resource count instead of presenting it as a full inventory", () => {
    const normalized = html.replace(/\s+/g, " ");
    assert.match(normalized, /lower bound/i);
    assert.match(normalized, /rather than a full inventory/i);
  });

  test("does not present one environment's figures as product statistics", () => {
    const normalized = html.replace(/\s+/g, " ");
    assert.match(normalized, /not product statistics/i);
  });

  test("links to the live example so every figure can be checked", () => {
    assert.match(html, /href="https:\/\/preview\.cloudox\.io"/);
  });

  test("confidence is never carried by colour alone", () => {
    // Each confidence pill must contain its written label.
    const pills = html.match(/<span class="conf conf-[a-z]+[^"]*"[^>]*>([^<]*)</g) ?? [];
    assert.ok(pills.length > 0, "expected confidence labels on the product page");
    for (const pill of pills) {
      assert.match(pill, /Verified|Likely|Assumed|Unknown/);
    }
  });

  test("shows a real screenshot of the dashboard, not just a synthetic canvas", () => {
    assert.match(html, /src="\/screenshots\/operations-view\.png"/);
    assert.match(html, /alt="[^"]*Operations view[^"]*"/);
  });
});

describe("Home page stays light and does not duplicate Product's proof canvas", () => {
  const html = readDist("index.html");

  test("does not repeat the full example-evidence canvas Product already leads with", () => {
    assert.doesNotMatch(html, /Sanitized example · real AWS environment/);
  });

  test("still links out to the checkable example", () => {
    assert.match(html, /href="https:\/\/preview\.cloudox\.io"/);
  });
});

describe("Audience view switcher degrades without JavaScript", () => {
  const html = readDist("index.html");

  test("panels are rendered visible and reachable by anchor, not hidden by default", () => {
    assert.match(html, /id="view-executive"/);
    assert.match(html, /href="#view-executive"/);
    const panel = html.match(/<section id="view-executive"[^>]*>/);
    assert.ok(panel);
    assert.doesNotMatch(panel![0], /hidden/);
  });

  test("tab semantics are applied by script, so no-JS users never see dead controls", () => {
    const link = html.match(/<a href="#view-executive"[^>]*>/);
    assert.ok(link);
    assert.doesNotMatch(link![0], /role="tab"/);
  });
});

describe("Pipeline page states the AI boundary and the missing-evidence behaviour", () => {
  const html = readDist("how-it-works/index.html").replace(/\s+/g, " ");

  test("every stage says what happens when the evidence is missing", () => {
    const stages = (html.match(/If evidence is missing/g) ?? []).length;
    assert.equal(
      stages,
      6,
      `expected all six stages to declare their missing-evidence behaviour, found ${stages}`,
    );
  });

  test("names the single stage a model touches instead of implying AI throughout", () => {
    assert.match(html, /only stage a model touches/i);
    assert.match(html, /Not the graph, not raw provider responses/i);
  });

  test("links to the security page rather than restating the whole boundary", () => {
    assert.match(html, /href="\/security"/);
  });
});

describe("Use-cases page frames decisions and states the product's limits", () => {
  const html = readDist("use-cases/index.html").replace(/\s+/g, " ");

  test("each moment names the decision it supports", () => {
    const decisions = (html.match(/Decision it supports/g) ?? []).length;
    assert.equal(decisions, 6, `expected six decision moments, found ${decisions}`);
  });

  test("keeps the four boundary statements reachable by anchor", () => {
    assert.match(html, /id="boundaries"/);
    for (const boundary of ["Not a CMDB", "Not a security scanner", "Not a FinOps platform", "Not a monitoring tool"]) {
      assert.ok(html.includes(boundary), `use-cases page is missing the boundary "${boundary}"`);
    }
  });

  test("does not promise dollar attribution the product refuses to produce", () => {
    assert.doesNotMatch(html, /cost per workload|exact cost|guaranteed savings/i);
  });
});

describe("Product page leads with the artifacts a run produces", () => {
  const html = readDist("product/index.html").replace(/\s+/g, " ");

  test("the artifacts section precedes the platform-layer vocabulary", () => {
    const artifacts = html.indexOf("Six artifacts");
    const layers = html.indexOf("layers that make those artifacts");
    assert.ok(artifacts > 0 && layers > 0, "expected both the artifacts and layers sections");
    assert.ok(artifacts < layers, "platform vocabulary should come after the tangible outputs");
  });

  test("each artifact is backed by something the published example shows", () => {
    const examples = (html.match(/In the example:/g) ?? []).length;
    assert.equal(examples, 6, `expected all six artifacts to cite the example, found ${examples}`);
  });
});

describe("Basic accessibility and indexing hygiene on legal pages", () => {
  for (const route of ["imprint", "privacy", "terms", "security"]) {
    test(`/${route} has a title, description, single h1, and is indexable`, () => {
      const html = readDist(`${route}/index.html`);
      assert.match(html, /<title>[^<]+<\/title>/);
      assert.match(html, /<meta name="description" content="[^"]+"/);
      const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
      assert.equal(h1Count, 1, `expected exactly one <h1> on /${route}, found ${h1Count}`);
      assert.doesNotMatch(html, /<meta name="robots" content="noindex/);
      assert.match(html, /<html lang="en">/);
    });
  }
});
