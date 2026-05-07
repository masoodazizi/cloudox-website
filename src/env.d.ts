/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Web3Forms access key used by the contact form on `/contact`.
   *
   * The destination email address is configured server-side in the
   * Web3Forms dashboard and is intentionally NOT stored in this repo.
   * The access key itself is a public form identifier and is safe to
   * expose to the browser (Web3Forms enforces rate limiting and
   * spam protection at their edge).
   */
  readonly PUBLIC_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
