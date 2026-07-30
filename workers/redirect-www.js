/**
 * The Worker entrypoint the site deploys behind (see `wrangler.jsonc`).
 *
 * The site's canonical host is the apex domain, and every canonical tag,
 * sitemap entry, and internal link points there. Without this rule the www
 * host also serves the site, so the same page is reachable at two addresses —
 * a split-signal problem for search engines and an inconsistent address to
 * share. 301 preserves the path and query string.
 *
 * This can't be a plain `_redirects` rule: Cloudflare Workers Static Assets
 * only supports relative (same-host, path-only) rules in `_redirects` — an
 * absolute-URL "from" like `https://www.cloudox.io/*` is rejected at deploy
 * time ("Only relative URLs are allowed", error 100324). Classic Cloudflare
 * Pages allowed that; Workers Static Assets does not, so a host-level
 * redirect has to live in the Worker script instead.
 */

const CANONICAL_HOST = "cloudox.io";
const WWW_HOST = "www.cloudox.io";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === WWW_HOST) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
