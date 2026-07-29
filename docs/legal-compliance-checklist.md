# Processor & compliance follow-up checklist

Internal checklist for Masood. Not published on the website. These are
account-level and legal actions the code cannot perform or verify —
see `docs/legal-privacy-implementation-audit.md` for what was verified from
the repository itself.

## Provider agreements

- [ ] Confirm/accept Cloudflare's current Data Processing Addendum (DPA).
- [ ] Confirm whether a Cloudflare account setting controls log retention,
      and note the actual retention period once known.
- [ ] Confirm whether Cloudflare Web Analytics, Workers logs, Zaraz, Bot
      Management, or Turnstile are enabled on the zone/Pages project. None
      of these are referenced in the codebase; if any are enabled in the
      dashboard, `/privacy` §3 and this checklist should be updated to name
      them explicitly.
- [ ] Confirm which Cloudflare Pages build mode is live: the Astro/Workers
      framework preset, or "Framework preset: None" (pure static deploy).
      See `README.md` "Deployment — Cloudflare Pages".
- [ ] Obtain or accept the applicable Web3Forms DPA and verify its operating
      entity, processing locations, subprocessors, and international
      transfer safeguards.
- [ ] Enable Web3Forms domain restriction (limit accepted submissions to
      `cloudox.io`) if available on the current plan.
- [ ] Confirm that the connected Web3Forms account has no webhook, Google
      Sheets, Notion, Zapier, or other secondary integration configured
      beyond the destination mailbox.
- [ ] Confirm/accept the IONOS data-processing agreement where applicable
      for the mailbox receiving form submissions and correspondence.
- [ ] Confirm/accept Zeeg's data-processing agreement.
- [ ] Review Zeeg booking-field minimization and notification privacy
      settings (only ask for what scheduling actually needs).

## Operational

- [ ] Verify that `legal@cloudox.io` and `security@cloudox.io` exist and are
      actively monitored mailboxes (both are now published on the website).
- [ ] Establish a practical, documented deletion routine for abandoned
      early-access enquiries (see `/privacy` §4 "Retention" — the notice
      deliberately does not commit to a fixed number of months until a real
      routine exists).
- [ ] Consider enabling Cloudflare Turnstile only if spam volume on the
      contact form actually justifies it — and if enabled, disclose it in
      `/privacy` §3/§4 and this checklist before turning it on.
- [ ] Namecheap (domain registrar) does not receive visitor data based on
      the current implementation and is intentionally not listed as a
      website processor in `/privacy`. Record it here for the internal
      processor inventory only; revisit if that ever changes (e.g. adding
      registrar-hosted DNS or a "protected registration" contact-forwarding
      feature that processes visitor data).

## Before commercial launch

- [ ] Re-review all four legal pages (`/imprint`, `/privacy`, `/terms`,
      `/security`) before the first paid pilot or customer contract —
      the current pages are scoped to the pre-revenue, early-access site.
- [ ] Prepare a pilot agreement / order form for the first paid engagement.
- [ ] Where customer personal data may be processed by the CloudoX product
      (as opposed to this website), prepare an appropriate
      data-processing agreement (DPA) between CloudoX and the customer —
      this is separate from, and in addition to, the website processors
      above.
- [ ] If CloudoX incorporates or transfers to a different operator before
      commercial launch, update `src/config/legal.ts` (`LEGAL_OPERATOR`)
      first — every legal page derives from that one file, so the update
      propagates automatically. Do not hand-edit the individual pages.
