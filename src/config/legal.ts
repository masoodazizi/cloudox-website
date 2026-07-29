/**
 * Central, typed source for the legal/operator identity published on
 * /imprint, /privacy, /terms, and /security. Every legal page reads from
 * here rather than repeating values inline, so the underlying facts cannot
 * drift between pages — update the operator once, here, and every page
 * reflects it.
 *
 * CloudoX is currently operated by a named individual, not a registered
 * company: there is no legal form, no commercial-register entry, and no
 * VAT ID. Those fields are typed as optional and left `undefined` rather
 * than filled with an invented or placeholder value. When the operator
 * changes (e.g. incorporation, or CloudoX transferring to a company before
 * commercial launch), update `LEGAL_OPERATOR` here — every page that
 * depends on it updates automatically. Pages MUST render optional fields
 * conditionally and omit them cleanly (no empty heading, no "N/A" string)
 * when absent; see `hasValue()` below.
 */

export interface LegalOperator {
  /** The natural person or company legally responsible for this website. */
  operatorName: string;
  /** Public trading name shown alongside the operator name. */
  tradingName: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  /** Country, in English, for an international audience. */
  country: string;
  /** General legal / privacy contact. */
  legalEmail: string;
  /** Responsible security disclosure contact. */
  securityEmail: string;
  /** Omit entirely rather than publish a placeholder or invented number. */
  phone?: string;
  /** e.g. "GmbH", "UG (haftungsbeschränkt)". Omit while unregistered. */
  legalForm?: string;
  /** Commercial register court, e.g. "Amtsgericht Berlin (Charlottenburg)". */
  registerCourt?: string;
  /** Commercial register number, e.g. "HRB 123456 B". */
  registerNumber?: string;
  /** VAT identification number (USt-IdNr.). */
  vatId?: string;
  /**
   * Person editorially responsible for the site's content (relevant under
   * German press/media law for editorial content). Defaults to the operator
   * when one person runs the site directly.
   */
  responsibleEditorName?: string;
}

export const LEGAL_OPERATOR: LegalOperator = {
  operatorName: "Masood Azizi",
  tradingName: "CloudoX",
  streetAddress: "Innsbrucker Str. 18",
  postalCode: "10825",
  city: "Berlin",
  country: "Germany",
  legalEmail: "legal@cloudox.io",
  securityEmail: "security@cloudox.io",
  responsibleEditorName: "Masood Azizi",
  // phone, legalForm, registerCourt, registerNumber, vatId: intentionally
  // absent. CloudoX is not currently a registered company. Do not fill
  // these in without an actual registration, and do not add a phone number.
};

/** German-language legal description, used on /imprint alongside the English form. */
export const LEGAL_DESCRIPTION_DE = `${LEGAL_OPERATOR.operatorName}, handelnd unter der Geschäftsbezeichnung ${LEGAL_OPERATOR.tradingName}`;
export const LEGAL_DESCRIPTION_EN = `${LEGAL_OPERATOR.operatorName}, trading as ${LEGAL_OPERATOR.tradingName}`;

/**
 * ISO dates (YYYY-MM-DD). Bump the relevant entry whenever that page's
 * substantive content changes — not on every unrelated site edit.
 */
export const LEGAL_LAST_UPDATED = {
  imprint: "2026-07-29",
  privacy: "2026-07-29",
  terms: "2026-07-29",
  security: "2026-07-29",
} as const;

/**
 * Service providers that process website-visitor data on CloudoX's behalf,
 * as verified against the deployed implementation
 * (see `docs/legal-privacy-implementation-audit.md`). Kept next to the
 * operator config, not duplicated per page, so `/privacy` cannot list a
 * provider the code doesn't actually use, or omit one it does.
 *
 * Namecheap (domain registration) is deliberately not listed here: nothing
 * in the deployed implementation sends visitor data to the registrar, so it
 * belongs in the internal processor inventory
 * (`docs/legal-compliance-checklist.md`), not the public notice.
 */
export interface WebsiteProcessor {
  name: string;
  role: string;
  dataCategories: string;
  /** Short, honest note on international transfer — omit if purely domestic. */
  transferNote?: string;
}

export const WEBSITE_PROCESSORS: WebsiteProcessor[] = [
  {
    name: "Cloudflare",
    role: "DNS, content delivery, hosting, and website security",
    dataCategories:
      "Technical request data for every visit: IP address, requested URL, timestamps, browser/device metadata, and security/diagnostic information",
    transferNote:
      "Cloudflare operates a global network; processing can involve infrastructure outside the EEA, carried out under Cloudflare's standard contractual safeguards",
  },
  {
    name: "Web3Forms",
    role: "Processing and forwarding the contact and early-access form",
    dataCategories:
      "The fields you submit (name, email, and the other form fields listed in Section 4), plus technical metadata inherent to any web request",
    transferNote:
      "May involve processing outside the EEA; see Web3Forms' own documentation for its current infrastructure and safeguards",
  },
  {
    name: "IONOS",
    role: "Hosting the email mailbox that receives forwarded form submissions and direct correspondence",
    dataCategories: "Email content and metadata for messages sent to or from CloudoX addresses",
  },
  {
    name: "Zeeg",
    role: "Appointment scheduling, only when a visitor follows the booking link",
    dataCategories: "Name, email, selected appointment, timezone, and any details entered when booking",
    transferNote: "Zeeg states that scheduling data is stored and processed on servers in Germany",
  },
];

/** True when a value is a non-empty, non-whitespace string. Use in templates to skip optional fields cleanly. */
export function hasValue(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function assertNonEmpty(value: string | undefined, field: string): asserts value is string {
  if (!hasValue(value)) {
    throw new Error(
      `[legal config] "${field}" is required to publish /imprint and /privacy and must not be empty. ` +
        `Set it in src/config/legal.ts before building for production.`,
    );
  }
}

function assertEmail(value: string, field: string): void {
  assertNonEmpty(value, field);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`[legal config] "${field}" ("${value}") is not a valid email address.`);
  }
}

/**
 * Fails fast when the mandatory identity fields are missing or malformed.
 * Called eagerly below, so importing this module — which every legal page
 * does — fails `astro build` immediately if the operator config regresses
 * to an empty name, an unserviceable address, or a broken legal email. This
 * is the "production cannot be built with an empty operator identity"
 * guarantee without adding a schema-validation dependency.
 */
export function assertLegalConfigValid(operator: LegalOperator = LEGAL_OPERATOR): void {
  assertNonEmpty(operator.operatorName, "operatorName");
  assertNonEmpty(operator.tradingName, "tradingName");
  assertNonEmpty(operator.streetAddress, "streetAddress");
  assertNonEmpty(operator.postalCode, "postalCode");
  assertNonEmpty(operator.city, "city");
  assertNonEmpty(operator.country, "country");
  assertEmail(operator.legalEmail, "legalEmail");
  assertEmail(operator.securityEmail, "securityEmail");
}

assertLegalConfigValid();
