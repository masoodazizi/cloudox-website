/**
 * Unit tests for the central legal/operator configuration.
 *
 * Run with: node --experimental-strip-types --test
 * (see package.json "test" script — Node 22.6+ required).
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  LEGAL_OPERATOR,
  LEGAL_LAST_UPDATED,
  WEBSITE_PROCESSORS,
  hasValue,
  assertLegalConfigValid,
  type LegalOperator,
} from "../src/config/legal.ts";
import { LEGAL_NAV, FOOTER_NAV } from "../src/config/site.ts";

describe("LEGAL_OPERATOR", () => {
  test("mandatory fields are present and non-empty", () => {
    assert.ok(hasValue(LEGAL_OPERATOR.operatorName));
    assert.ok(hasValue(LEGAL_OPERATOR.tradingName));
    assert.ok(hasValue(LEGAL_OPERATOR.streetAddress));
    assert.ok(hasValue(LEGAL_OPERATOR.postalCode));
    assert.ok(hasValue(LEGAL_OPERATOR.city));
    assert.ok(hasValue(LEGAL_OPERATOR.country));
    assert.ok(hasValue(LEGAL_OPERATOR.legalEmail));
    assert.ok(hasValue(LEGAL_OPERATOR.securityEmail));
  });

  test("does not invent a legal form, register entry, VAT ID, or phone number", () => {
    assert.equal(LEGAL_OPERATOR.legalForm, undefined);
    assert.equal(LEGAL_OPERATOR.registerCourt, undefined);
    assert.equal(LEGAL_OPERATOR.registerNumber, undefined);
    assert.equal(LEGAL_OPERATOR.vatId, undefined);
    assert.equal(LEGAL_OPERATOR.phone, undefined);
  });

  test("legal and security contact addresses are distinct cloudox.io mailboxes", () => {
    assert.equal(LEGAL_OPERATOR.legalEmail, "legal@cloudox.io");
    assert.equal(LEGAL_OPERATOR.securityEmail, "security@cloudox.io");
    assert.notEqual(LEGAL_OPERATOR.legalEmail, LEGAL_OPERATOR.securityEmail);
  });
});

describe("assertLegalConfigValid", () => {
  test("passes for the real, current operator config", () => {
    assert.doesNotThrow(() => assertLegalConfigValid());
  });

  const requiredFields: (keyof LegalOperator)[] = [
    "operatorName",
    "tradingName",
    "streetAddress",
    "postalCode",
    "city",
    "country",
    "legalEmail",
    "securityEmail",
  ];

  for (const field of requiredFields) {
    test(`fails when "${field}" is empty`, () => {
      const broken: LegalOperator = { ...LEGAL_OPERATOR, [field]: "" };
      assert.throws(() => assertLegalConfigValid(broken), /is required|is not a valid email/);
    });
  }

  test("fails when legalEmail is not a valid email address", () => {
    const broken: LegalOperator = { ...LEGAL_OPERATOR, legalEmail: "not-an-email" };
    assert.throws(() => assertLegalConfigValid(broken), /valid email address/);
  });

  test("fails when securityEmail is not a valid email address", () => {
    const broken: LegalOperator = { ...LEGAL_OPERATOR, securityEmail: "also not an email" };
    assert.throws(() => assertLegalConfigValid(broken), /valid email address/);
  });

  test("optional fields may be omitted without failing validation", () => {
    const minimal: LegalOperator = {
      operatorName: "Test Operator",
      tradingName: "Test",
      streetAddress: "Test Street 1",
      postalCode: "12345",
      city: "Test City",
      country: "Testland",
      legalEmail: "legal@example.com",
      securityEmail: "security@example.com",
    };
    assert.doesNotThrow(() => assertLegalConfigValid(minimal));
  });
});

describe("hasValue", () => {
  test("is false for undefined, null, and whitespace-only strings", () => {
    assert.equal(hasValue(undefined), false);
    assert.equal(hasValue(null), false);
    assert.equal(hasValue("   "), false);
    assert.equal(hasValue(""), false);
  });

  test("is true for a non-empty string", () => {
    assert.equal(hasValue("Berlin"), true);
  });
});

describe("LEGAL_LAST_UPDATED", () => {
  test("declares an ISO date for every required legal route", () => {
    for (const key of ["imprint", "privacy", "terms", "security"] as const) {
      assert.match(LEGAL_LAST_UPDATED[key], /^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("WEBSITE_PROCESSORS", () => {
  test("names every processor verified in the implementation audit", () => {
    const names = WEBSITE_PROCESSORS.map((p) => p.name);
    for (const expected of ["Cloudflare", "Web3Forms", "IONOS", "Zeeg"]) {
      assert.ok(names.includes(expected), `expected ${expected} to be listed as a processor`);
    }
  });

  test("does not list Namecheap as a website-visitor processor", () => {
    const names = WEBSITE_PROCESSORS.map((p) => p.name);
    assert.ok(!names.includes("Namecheap"));
  });

  test("every processor entry has a role and data-category description", () => {
    for (const processor of WEBSITE_PROCESSORS) {
      assert.ok(hasValue(processor.name));
      assert.ok(hasValue(processor.role));
      assert.ok(hasValue(processor.dataCategories));
    }
  });
});

describe("LEGAL_NAV", () => {
  test("lists exactly the three statutory-notice routes", () => {
    const hrefs = LEGAL_NAV.map((item) => item.href).sort();
    assert.deepEqual(hrefs, ["/imprint", "/privacy", "/terms"]);
  });
});

describe("FOOTER_NAV", () => {
  test("carries /security instead of the dedicated legal bar", () => {
    const allHrefs = FOOTER_NAV.flatMap((column) => column.items.map((item) => item.href));
    assert.ok(allHrefs.includes("/security"), "/security should be reachable from the main footer");
  });

  test("no longer duplicates the legal routes already covered by LEGAL_NAV", () => {
    const allHrefs = FOOTER_NAV.flatMap((column) => column.items.map((item) => item.href));
    for (const legalHref of ["/imprint", "/privacy", "/terms"]) {
      assert.ok(!allHrefs.includes(legalHref), `${legalHref} should only appear in the dedicated legal bar`);
    }
  });
});
