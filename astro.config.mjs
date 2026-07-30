import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://cloudox.io",
  trailingSlash: "ignore",
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  integrations: [
    mdx(),
    sitemap({
      // Keep noindex routes out of the sitemap — submitting a page that asks
      // not to be indexed is a contradictory signal.
      filter: (page) => !page.includes("/404") && !page.includes("/thanks"),
    }),
  ],
  vite: {
    // Tailwind v4 plugin — typed against a slightly different vite version,
    // so we cast to avoid a benign type mismatch in `astro check`.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  build: {
    inlineStylesheets: "auto",
  },
});
