# Classic v1 preservation and restoration

## Preserved baseline

- Source: `8bb60746d20d5982ea9165e07a270633cb3a425d`.
- Archive branch: `archive/website-classic-v1` (leave this branch unchanged).
- Preservation release: `website-classic-v1`.
- Release URL: https://github.com/masoodazizi/cloudox-website/releases/tag/website-classic-v1
- Release packaging workflow: branch `archive/website-classic-package`.
- GitHub recorded a successful Cloudflare production build for this source on
  2026-07-30: build `e15d78e6-ad8f-4f6f-a30e-4c1e20a84a1d`.
- That build's Cloudflare version: `68de3cf3-f551-413c-9d7e-437491b66dc2`.

This is the last successful production build exposed by GitHub at preservation
time. It is not independent proof that no later manual Cloudflare deployment
occurred. Confirm the version in Cloudflare before using an emergency rollback.

The release workflow checks out the exact baseline, runs the existing checks,
and produces a rebuilt static archive, resolved package lock, runtime versions
and SHA-256 checksum. This is a rebuild, not a byte-for-byte export of the historical
deployment. The live site refused automated access to its public form configuration.
The archived build therefore uses the existing unconfigured contact-page fallback.
To restore working form submissions from source, rebuild with PUBLIC_WEB3FORMS_KEY
from the existing Cloudflare environment. Immediate Cloudflare version rollback
retains the previously configured build. Existing release assets are not overwritten.
The repository's source ZIP/tarball is available from the tagged release as well.

## Immediate deployment rollback

In Cloudflare, open the `cloudox` Worker, select Deployments, confirm the preserved
version and choose Rollback. Verify the homepage, Product, contact form rendering,
legal links, and www-to-apex redirect. Do not submit a real contact request merely
to test a rollback. Cloudflare's rollback history is limited; retain the Git release.

Then revert the redesign PR in GitHub and merge the revert through normal checks.
This ensures the next automatic deployment keeps the restored design. Do not reset
or force-push main. Coordinate a rollback with any unrelated changes merged later.

## Restore through source

For an isolated redesign merge, revert that merge or squash commit in a new branch,
run `npm run check` and `npm test`, and merge a restoration PR. If the old source
needs rebuilding independently, create a new branch from `website-classic-v1` (or
from the immutable baseline SHA above). Use the archived lockfile and Node version
for the preserved build; keep the live Cloudflare environment configuration.

The test command builds with a placeholder form key. Never deploy that test output.
Run the production build again with the real PUBLIC_WEB3FORMS_KEY before deploying.

For the built archive, verify its SHA-256 and extract it into an empty directory.
It contains dist/, workers/, wrangler.jsonc and build inputs. The archive is useful
for design recovery and comparison; rebuild with the original public form
configuration before deploying a fully functional contact form.
The archive includes no Cloudflare credentials or other secrets.

## Reuse the template later

Create a new branch from current main. Port the Classic layouts, components and
style tokens from the preserved tag. Keep current content, legal configuration,
security fixes and evidence data. Restoring the entire old release restores old
content too; it is appropriate for immediate rollback, not automatic long-term reuse.

Reference: https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/
