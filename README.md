# CloudoX Website

Public marketing and documentation site for **CloudoX** — the Intelligent Cloud Knowledge Platform.

This repository is **public**. It does not contain any internal CloudoX implementation, prompts, scanning logic, or proprietary heuristics. It only contains the public-facing website content.

---

## Stack

- [Astro](https://astro.build/) — static site generator
- TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- Markdown / MDX content collections (blog and docs)
- `@astrojs/sitemap` for sitemap generation
- `@astrojs/rss` for the blog RSS feed
- `@fontsource/inter` + `@fontsource/jetbrains-mono` — self-hosted fonts (no
  request to Google Fonts on any page)
- Optimized for **Cloudflare Pages** static deployment

---

## Project structure

```text
cloudox-website/
├── astro.config.mjs           # Astro config (Tailwind + sitemap + MDX)
├── tsconfig.json              # TypeScript with @ path aliases
├── .env.example               # Document required env vars
├── package.json
├── public/
│   ├── _headers               # Cloudflare Pages headers
│   ├── .well-known/security.txt # RFC 9116 security contact
│   ├── favicon.png            # Browser tab icon (v4 "CdX" mark)
│   ├── robots.txt
│   ├── llms.txt               # LLM-readable site summary
│   ├── brand/logo/v4/         # Official v4 brand pack (wordmark, icon, favicons)
│   └── og/cloudox-og.svg      # Default OG/social image
├── docs/
│   ├── legal-privacy-implementation-audit.md # internal: what the site actually does
│   └── legal-compliance-checklist.md         # internal: Masood's DPA/account follow-ups
└── src/
    ├── env.d.ts               # ImportMetaEnv types for env vars
    ├── styles/global.css      # Tailwind v4 entry + theme tokens
    ├── config/site.ts         # Site name, nav, metadata
    ├── config/legal.ts        # Central operator identity + processor list (validated at build time)
    ├── layouts/BaseLayout.astro
    ├── layouts/LegalLayout.astro # Shared shell for imprint/privacy/terms
    ├── components/            # Header, Footer, Hero, CTA, Section,
    │                          # FeatureCard, FeatureGrid, CodeBlock, Logo
    ├── content.config.ts      # docs + blog content collections
    ├── content/
    │   ├── docs/              # Markdown docs (Concepts, Reference, …)
    │   └── blog/              # Markdown blog posts
    └── pages/
        ├── index.astro        # Home
        ├── product.astro
        ├── use-cases.astro
        ├── how-it-works.astro
        ├── contact.astro      # Early-access form (Web3Forms)
        ├── security.astro     # Product + website security/trust page
        ├── imprint.astro      # German DDG §5 imprint
        ├── privacy.astro      # Privacy notice (GDPR)
        ├── terms.astro        # Website Terms of Use
        ├── 404.astro
        ├── docs/              # /docs index + dynamic [...slug]
        ├── blog/              # /blog index + dynamic [...slug]
        └── rss.xml.ts
```

---

## Local development

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- npm (or pnpm / yarn)

### Install & run

```bash
npm install
npm run dev
```

Then open [http://localhost:4321](http://localhost:4321).

### Available scripts

| Command           | Description                                        |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the local dev server                         |
| `npm run build`   | Build the production site to `./dist/`             |
| `npm run preview` | Preview the production build locally               |
| `npm run check`   | Run `astro check` for TypeScript / template checks |
| `npm test`        | Build the site, then run the `node:test` suite against the build output (`tests/`) |
| `npm run test:unit` | Fast unit tests for `src/config/legal.ts` only, no build required |

---

## Content authoring

### Blog posts

Add a new Markdown file under `src/content/blog/`:

```markdown
---
title: "Your post title"
description: "One-sentence summary used for SEO and listings."
pubDate: 2026-05-07
author: "The CloudoX team"
tags: ["aws", "discovery"]
draft: false
---

Post content in Markdown or MDX.
```

Posts are listed at `/blog` and served at `/blog/<file-slug>`.

### Docs

Add a new Markdown file under `src/content/docs/`:

```markdown
---
title: "Doc title"
description: "Short description shown in the listing."
section: "Concepts"   # Getting Started | Concepts | Guides | Reference
order: 2              # ordering within a section
draft: false
---

Doc content in Markdown or MDX.
```

Docs are listed at `/docs` and served at `/docs/<file-slug>`.

---

## Design system

- Brand tokens are defined in `src/styles/global.css` via Tailwind v4's
  `@theme` block (`--color-brand-*`, `--color-ink-*`, fonts).
- Light / dark color schemes are exposed as CSS variables (`--bg`, `--fg`,
  `--accent`, etc.) and switch via `prefers-color-scheme`.
- Reusable building blocks live in `src/components/` — prefer composing
  these over inventing new patterns.

---

## SEO

- Per-page `<title>`, `<meta name="description">`, canonical URL and
  OpenGraph / Twitter tags are handled by `BaseLayout.astro`.
- Default OG image: `public/og/cloudox-og.svg` (override with the `image`
  prop on `BaseLayout`).
- `sitemap-index.xml` is generated by `@astrojs/sitemap`.
- `public/robots.txt` references the sitemap.
- Blog has an RSS feed at `/rss.xml`.

---

## Legal pages

`/imprint`, `/privacy`, `/terms`, and `/security` are generated from one
central, typed source: `src/config/legal.ts` (`LEGAL_OPERATOR`,
`WEBSITE_PROCESSORS`, `LEGAL_LAST_UPDATED`). Update the operator identity or
processor list there — every page derives from it, so the facts cannot drift
between pages. Importing that module fails the build (`assertLegalConfigValid`)
if the operator name, address, or either contact email is ever left empty.

Optional identity fields (`phone`, `legalForm`, `registerCourt`,
`registerNumber`, `vatId`) are typed as optional and rendered conditionally —
leave them unset rather than filling in a placeholder; see the comments in
`src/config/legal.ts` before adding any of them.

Every public page links to all four routes from a dedicated footer bar
(`LEGAL_NAV` in `src/config/site.ts`, rendered by `src/components/Footer.astro`)
that is always visible without opening a menu.

The factual basis for `/privacy` and `/security` — what the deployed
implementation actually does — is recorded in
`docs/legal-privacy-implementation-audit.md`. Outstanding account-level
actions (provider DPAs, dashboard settings that can't be verified from this
repo) are tracked in `docs/legal-compliance-checklist.md`. Re-run the audit
whenever a new third-party script, form field, or hosting feature is added.

## Testing

`npm test` builds the site and runs the Node.js built-in test runner
(`node --experimental-strip-types --test`, no extra test framework
dependency) against the build output in `tests/`:

- `tests/legal-config.test.ts` — unit tests for `src/config/legal.ts`
  (`assertLegalConfigValid` failure modes, processor list, nav wiring).
- `tests/site-build.test.ts` — assertions against the generated `dist/`
  HTML: the four legal routes build and are indexable, the footer legal bar
  appears on every generated page, the Imprint contains the required
  identity and omits anything invented (phone, VAT ID, register entry, "UG"/
  "GmbH", corporate-officer titles), the Privacy Notice names every verified
  processor and never claims all data stays in Germany, the contact form
  shows its privacy acknowledgement before the submit control, no page loads
  an analytics/tracking script or renders a cookie-consent banner, and
  `/.well-known/security.txt` is present with the required fields.

`npm test` sets a placeholder `PUBLIC_WEB3FORMS_KEY` for the build so the
real contact form (not its "not configured yet" fallback) is what gets
tested; it never touches your local `.env`.

## Deployment — Cloudflare Pages

The site is a static Astro build and deploys cleanly to Cloudflare Pages.

### Connect the repository

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages**.
2. Connect this GitHub repository.
3. Use the following build settings:

| Setting                | Value           |
| ---------------------- | --------------- |
| Framework preset       | `Astro`         |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | (leave empty)   |
| Node.js version        | `22`            |

### Required: `NODE_VERSION` environment variable

> ⚠ **Cloudflare Pages does not reliably read `.nvmrc`, `.node-version`,
> or `engines.node`.** The current Astro framework preset deploys via
> `npx wrangler versions upload`, which requires Node ≥ 22, and Vite's
> bundler (`rolldown`) requires Node ≥ 22.12.

You **must** add an environment variable in the Pages project settings:

1. Open **Workers & Pages → your project → Settings → Variables and Secrets**.
2. Add a variable for **Production** (and **Preview**):
   - Name: `NODE_VERSION`
   - Value: `22.20.0` (or any 22.12+ release)
3. Save and re-trigger the deploy.

The repo also ships `.nvmrc`, `.node-version`, `.tool-versions`, and
`engines.node` as fallback signals, but `NODE_VERSION` in the dashboard
is the only setting Cloudflare consistently honors.

### Why `package-lock.json` is gitignored

Vite (≥ 8) uses [`rolldown`](https://rolldown.rs/) for bundling, which
ships per-platform native bindings. Due to a long-standing
[npm bug](https://github.com/npm/cli/issues/4828), a `package-lock.json`
generated on macOS does not include the Linux x64 bindings, which causes
Cloudflare's Linux build environment to fail with
`Cannot find module '@rolldown/binding-linux-x64-gnu'` during
`npm clean-install`.

To avoid this, `package-lock.json` is `.gitignore`d. Cloudflare runs
`npm install` (fresh resolution on Linux), which correctly installs the
required platform binding. The site is fully static and uses caret semver
ranges, so the loss of strict cross-environment reproducibility is
acceptable for this use case.

### Alternative: pure static deploy (no Wrangler)

If you'd rather bypass the Astro-on-Workers adapter entirely and deploy
the static `dist/` directory directly (no Wrangler, no Node-version
constraints from the deploy step):

1. In the Pages project, go to **Settings → Builds & deployments**.
2. Set **Framework preset** to `None`.
3. Keep build command `npm run build` and output directory `dist`.
4. Save and re-deploy.

This deploys the prerendered HTML straight to Cloudflare's CDN with
no Workers runtime in front of it. The site is 100% static — both
deploy paths produce identical output.

### Custom domain

In the Pages project, go to **Custom domains → Set up a custom domain** and
add `cloudox.io` (and `www.cloudox.io` if desired). Cloudflare handles TLS.

### Headers

Static cache and basic security headers are configured in `public/_headers`
and served by Cloudflare Pages automatically.

### Environment variables

| Variable               | Required | Purpose                                                                                  |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `NODE_VERSION`         | yes      | Pin the build's Node version (≥ `22.12`). Set to `22.20.0` (or compatible) in dashboard. |
| `PUBLIC_WEB3FORMS_KEY` | yes      | Access key for the contact form on `/contact`. See **Contact form setup** below.         |

See `.env.example` for the local-dev format.

---

## Contact form setup

The early-access form on `/contact` is backed by [Web3Forms](https://web3forms.com)
so the destination email is **never present in the source code or shipped
to the browser**. Only an opaque access key (essentially a form ID) is
exposed client-side. Web3Forms enforces rate limiting and spam protection
at their edge.

### One-time setup

1. Sign up for a free Web3Forms account at <https://web3forms.com>.
2. Create a new form and set the destination email address (e.g. the
   internal alias you want submissions to land in). This stays in
   Web3Forms' dashboard — never in this repo.
3. Copy the access key.
4. Add it as a Cloudflare Pages environment variable:
   - **Name**: `PUBLIC_WEB3FORMS_KEY`
   - **Value**: the access key from Web3Forms
   - Set for both **Production** and **Preview**.
5. For local dev, copy `.env.example` to `.env` and paste the key there.

If the variable is missing at build time, the form is replaced with a
placeholder message so the site still deploys cleanly.

---

## Editorial guidelines

When adding or editing site content, please follow these rules:

- The brand is rendered as **CloudoX** (capital `X`) in all prose and
  marketing copy. Lowercase `cloudox` is reserved for URLs, file slugs,
  and identifiers.
- **Do not** copy internal/private implementation details, prompts,
  scanning logic, or customer data into the website.
- **Do not** claim single-account or single-region limitations. CloudoX
  supports multi-account AWS Organizations and multi-region discovery.
- **Do not** add fake customer logos or testimonials.
- **Do not** call CloudoX a CMDB or a security scanner.
- **Prefer** evidence-based, concise messaging over generic marketing
  copy. The site should reflect the same standards as the product.
- **Do not** add absolute privacy/security claims ("100% secure", "fully
  GDPR compliant", "we never store your data", "your data never leaves
  Germany", "zero access", "no third parties"). If you add a new
  third-party script, form field, embed, or hosting feature, update
  `docs/legal-privacy-implementation-audit.md` and `/privacy` in the same
  change, and re-run `npm test`.

---

## License

The website source is provided as-is for the CloudoX project. Brand,
content, and trademarks belong to the CloudoX project.
