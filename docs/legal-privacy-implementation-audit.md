# Legal/privacy implementation audit

Internal note, not published on the website. Records what the deployed
`cloudox-website` implementation actually does, as the factual basis for
`/imprint`, `/privacy`, `/terms`, and `/security`. Per the CloudoX trust
principle ("claim only what the code enforces"), every statement on those
pages should trace back to a line item here. Where something cannot be
verified from the repository alone (mainly Cloudflare/Web3Forms **account
dashboard** settings, which live outside this codebase), it is flagged
explicitly rather than assumed.

Audited: 2026-07-29, against `cloudox-website` `main` at commit `26757bb`.

## 1. Framework and routing

- **Astro 5** (`astro.config.mjs`), fully static output — no SSR adapter, no
  `output: "server"`, no Astro middleware. `npm run build` prerenders every
  route to static HTML under `dist/`.
- Routing is file-based under `src/pages/`: static `.astro` pages
  (`index`, `product`, `use-cases`, `how-it-works`, `contact`, `404`) plus two
  dynamic content-collection routes, `src/pages/docs/[...slug].astro` and
  `src/pages/blog/[...slug].astro`, both driven by Markdown in
  `src/content/{docs,blog}/` via `src/content.config.ts`. `src/pages/rss.xml.ts`
  emits the blog RSS feed. `@astrojs/sitemap` generates `sitemap-index.xml`.
- No API routes, no server endpoints, no Astro `Actions`. The only outbound
  network call made by client-side JavaScript is the contact form's `fetch`
  to Web3Forms (see §4).

## 2. Hosting and Cloudflare configuration

- Deployed to **Cloudflare Pages** as a static site (confirmed by
  `README.md` "Deployment — Cloudflare Pages" section). The README documents
  two supported deploy modes — the Astro framework preset (which uploads via
  `wrangler`, i.e. runs on the Workers runtime as a static asset host) or a
  "Framework preset: None" pure static deploy. **Which of the two is
  currently selected in the live Cloudflare Pages project cannot be
  determined from this repository** — flagged for Masood in the checklist.
- No `wrangler.toml`, no `functions/` directory, and no `_redirects` file
  exist in the repository. **No Cloudflare Pages Functions, Workers, or
  edge middleware are defined in code.** If any exist, they were added
  directly in the Cloudflare dashboard outside this repo and are invisible
  to this audit — flagged for Masood to confirm.
- `public/_headers` sets response headers Cloudflare Pages applies
  automatically: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` (blocking camera/microphone/
  geolocation), plus cache-control for static assets. No cookie is set by
  any header rule.
- **Cloudflare Web Analytics, Zaraz, Turnstile, Bot Management, and Rocket
  Loader are not referenced anywhere in the repository.** No corresponding
  `<script>` tag, beacon, or config file exists in the source. These are
  Cloudflare **account/zone-level** features that can be toggled in the
  dashboard without any code change, so the repository cannot prove they are
  off — only that nothing in the codebase turns them on. **Flagged for
  Masood to confirm directly in the Cloudflare dashboard** (Pages project →
  Settings, and the zone's Analytics / Zaraz / Bot Management / Speed tabs).
- Cloudflare sits in front of every request as DNS/CDN/reverse proxy
  regardless of dashboard feature toggles, so it necessarily processes
  connection-level data (IP address, TLS/HTTP metadata, requested path,
  timestamps) for every visitor to every page. This is disclosed in
  `/privacy` §3 regardless of which optional features are enabled.

## 3. Cookies, local storage, session storage

- Full-text search of `src/**` for `document.cookie`, `localStorage`,
  `sessionStorage`, `indexedDB`, and cookie-setting patterns: **zero
  matches.** No first-party cookie, no local/session storage entry, no
  client-side persistence of any kind is written by this codebase.
- No cookie-consent library, no analytics SDK, and no A/B-testing or
  feature-flag script is present.
- Conclusion: the site currently sets **no cookies and writes no browser
  storage**, first-party or third-party, from its own code. Whether the
  Cloudflare Pages edge itself sets an infrastructure cookie (e.g. for a
  load-balancing or bot-mitigation feature) depends on the dashboard
  features in §2, which is why that item is flagged for confirmation rather
  than asserted as "never".

## 4. Third-party requests, by trigger

**Every page, on initial load** (`src/layouts/BaseLayout.astro`):

- `https://fonts.googleapis.com` — preconnect + a stylesheet request for
  Inter and JetBrains Mono (`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...">`).
- `https://fonts.gstatic.com` — preconnect; the actual font files are served
  from here once the stylesheet resolves.
- These are the **only** automatic third-party requests on page load. No
  analytics beacon, tracking pixel, or third-party script fires on load,
  navigation, or scroll.

**On contact-form submission only** (`src/pages/contact.astro`, inline
`<script>`), never before the visitor clicks submit:

- `https://api.web3forms.com/submit` — a single `fetch()` POST containing
  the form payload (exact fields in §5) plus the public Web3Forms access key.

**User-initiated outbound navigation** (plain `<a target="_blank">` links,
not automatic requests, not embeds):

- `https://zeeg.me/cloudox` — every "Book a call" link across the site
  (`index`, `product`, `use-cases`, `how-it-works`, `security`, `contact`
  pages) is a normal outbound anchor. **Zeeg is linked, never embedded** —
  no iframe, no Zeeg widget script, no Zeeg JS anywhere in `src/`. Per the
  brief's own logic, Zeeg only receives data once a visitor deliberately
  follows that link and interacts with Zeeg's own site.
- `https://preview.cloudox.io` and `https://github.com/cloudox-ai/cloudox-public-examples` —
  outbound links on `/how-it-works`, unrelated to personal data.

**Error handling:** the contact form's `fetch` call is wrapped in try/catch
and shows an inline status message on network failure; no error-reporting
SDK (Sentry or similar) is wired up, so no additional third-party call is
made on error.

**Not present anywhere in the codebase:** Google Analytics, Google Tag
Manager, Meta/Facebook Pixel, LinkedIn Insight Tag, Hotjar, Sentry, PostHog,
Plausible, Umami, Matomo, or any comparable analytics/monitoring/session-replay
product. Confirmed by pattern search across `src/**` — zero matches for any
of their standard script URLs or SDK identifiers.

## 5. Contact form — exact fields sent to Web3Forms

From `src/pages/contact.astro`, the submitted `FormData` (converted to JSON)
contains exactly:

| Field | Type | Always present | Notes |
|---|---|---|---|
| `name` | text input | yes (required) | |
| `email` | email input | yes (required) | |
| `company` | text input | no (optional) | label "Company / role" |
| `scale` | text input | no (optional) | label "AWS environment scale" |
| `message` | textarea | yes (required) | label "What would you use CloudoX for?" |
| `subject` | hidden input | yes | static string, not user data |
| `from_name` | hidden input | yes | static string, not user data |
| `botcheck` | hidden checkbox (honeypot) | yes, always empty for humans | anti-spam; CSS-hidden, `tabindex="-1"`, `aria-hidden` |
| `access_key` | appended in JS before the request | yes | Web3Forms' public form identifier, not a secret |

**No hidden field carries IP address, browser/user-agent string, or page
URL** — the client never constructs or sends any of these explicitly. That
said, IP address and user-agent are ordinary properties of any HTTPS POST
request and Web3Forms' own infrastructure necessarily observes them as the
receiving server, independent of whether the page adds a field for them —
this is disclosed in `/privacy` §4 rather than asserted as absent.

No CAPTCHA (Cloudflare Turnstile or otherwise) is wired into the form. The
only bot mitigation implemented in code is the honeypot field above; Web3Forms
may apply additional spam filtering on their own infrastructure, which this
repository cannot observe or verify.

**No webhook, Google Sheets, Notion, Zapier, or other secondary
integration is configured in code** — there is nothing in the repository
that could be, since Web3Forms integrations are configured entirely in the
Web3Forms account dashboard, not in this codebase. **Flagged for Masood to
confirm directly in the Web3Forms dashboard** that no such integration exists
beyond the configured destination mailbox.

## 6. Server-side functions and logs

There are no server-side functions in this repository (§1, §2) — nothing in
`cloudox-website`'s own code retains a submission or a technical log. The two
places a submission's data can persist are both outside this repo:

1. Web3Forms' own infrastructure (per their documentation, submissions are
   not retained as stored records, but server logs that can contain personal
   data exist and are periodically deleted — see `/privacy` §4 for the exact
   wording used, which deliberately avoids the stronger claim "nothing is
   stored").
2. The destination mailbox at IONOS, once Web3Forms forwards the message by
   email (§7).

Cloudflare's own edge and origin logs (connection metadata for every
request) are a platform-level log outside this repository's control;
retention there depends on the Cloudflare account/plan configuration, which
is flagged for Masood to confirm (§2, checklist item).

## 7. Email

Outbound/inbound correspondence resulting from the contact form, or from
directly emailing `legal@cloudox.io` / `security@cloudox.io`, is hosted at
**IONOS**. This is an operational fact stated by Masood, not something
visible in the repository (email hosting is infrastructure, not code) —
recorded here for completeness and reflected in `/privacy` §5.

## 8. Meeting scheduling (Zeeg)

Confirmed by code search (§4): every reference to Zeeg in `src/` is a plain
`<a href="https://zeeg.me/cloudox" target="_blank" rel="noopener noreferrer">`
link. There is no embedded scheduler, no Zeeg iframe, and no Zeeg JavaScript
loaded on any CloudoX page. Consistent with the brief's own logic, this means
Zeeg does not process any visitor data merely because a page containing the
link is viewed — processing begins only once a visitor deliberately follows
the link and interacts with Zeeg's own booking page, which is Zeeg's context,
not CloudoX's. `/privacy` §6 is worded accordingly (describes what happens
"when a visitor chooses to schedule a meeting", not what happens on page
load).

## 9. Claims broader than the implementation — corrected

- `src/pages/contact.astro`, "What we don't do" list: the entry **"Share
  your information"** does not state what CloudoX does do with the
  information (respond to the enquiry; use named service providers to
  deliver the site, process the form, and handle scheduling). Corrected to
  name the providers rather than assert a bare negative. See "Existing copy
  corrections" in the follow-up summary.
- The former `/privacy` and `/terms` pages (added in an earlier iteration of
  this repository, before this audit) predated the Web3Forms/Cloudflare/
  Zeeg/IONOS processor detail and the Masood Azizi operator identity. They
  are fully superseded by the pages this audit produced.
- No other absolute claims of the forbidden kind ("100% secure", "fully
  GDPR compliant", "we never store your data", "your data never leaves
  Germany", "nothing sensitive is collected", "zero access", "no third
  parties") were found elsewhere on the site as of this audit.
- `/security` (product-level claims about the CloudoX AWS discovery tool,
  as opposed to this website) was authored in a prior session against the
  `cloudox-repo` product codebase's actual IAM permission generator and its
  CI-enforced tests; those claims are out of scope for this website audit
  but were spot-checked here for the forbidden-claim list (SOC 2, ISO
  certification, penetration test, formal audit, guaranteed compliance,
  zero retention, zero risk) and none are present — the page explicitly
  states the opposite ("no third-party audit, SOC 2 report, or independent
  penetration test yet").

## 10. Material facts flagged for Masood (cannot be verified from the repository)

These are recorded as open items in `docs/legal-compliance-checklist.md`
rather than guessed at in public copy:

1. Which Cloudflare Pages build mode is active (Astro/Workers preset vs.
   "Framework preset: None" static deploy) — does not change what visitor
   data is processed, but changes which Cloudflare product sits in the
   request path.
2. Whether Cloudflare Web Analytics, Zaraz, Turnstile, or Bot Management are
   toggled on at the account/zone level (dashboard-only settings, invisible
   to this repository).
3. Cloudflare account log retention configuration.
4. Whether the connected Web3Forms account has any webhook, Google Sheets,
   Notion, Zapier, or other secondary integration configured, and whether
   domain restriction (limiting submissions to `cloudox.io`) is enabled.
5. Status of the Cloudflare DPA, the Web3Forms DPA (including its operating
   entity, processing locations, and subprocessors), the IONOS data-processing
   agreement, and the Zeeg data-processing agreement.
6. Whether `legal@cloudox.io` and `security@cloudox.io` are live, monitored
   mailboxes (the website now publishes both).

## Scope note

This audit covers the **public marketing website** (`cloudox-website`) only.
It says nothing about the CloudoX product's AWS-account data boundary, which
is a separate audit already recorded in the `cloudox-repo` repository
(`docs/16-trust-and-differentiation.md`) and separately re-verified for the
`/security` page's forbidden-claim list in §9 above. The privacy notice is
explicit that it does not yet cover a production SaaS/customer-discovery
relationship (`/privacy` §2).
