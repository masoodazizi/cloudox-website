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
      "Innsbrucker Str. 18",
      "10825",
      "Berlin",
      "legal@cloudox.io",
    ]) {
      assert.ok(html.includes(required), `imprint page is missing "${required}"`);
    }
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
