/**
 * The Pages document that IS the homepage.
 *
 * A Pages document needs a slug (every collection here auto-generates one from
 * the title), but the homepage's real address is `/` — so this one slug is
 * special-cased in three places that must agree, which is why it lives here
 * rather than in any one of them:
 *
 *   - `src/app/page.tsx`      renders this document at `/`.
 *   - `src/app/[...slug]`     redirects `/anasayfa` → `/` so the same content
 *                             is never served at two addresses.
 *   - `src/app/sitemap.ts`    lists it once, as `/`.
 */
export const HOMEPAGE_SLUG = "anasayfa";
