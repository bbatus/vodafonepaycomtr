import Link from "next/link";

/**
 * `trail` is the Butterfly-parity gap-fill for Pages' `parent` reference
 * (docs/RFP-OPEN-ITEMS.md §8) — an optional chain of intermediate crumbs
 * between "Ana Sayfa" and `current` (e.g. a parent Page's title/href).
 * Every other caller of this component omits it and keeps today's
 * two-crumb behavior.
 *
 * Live parity (17.09.2026, `widget_General_Breadcrumb`, measured on
 * /kampanyalar — the same widget on every live page that has one):
 * - `max-width 1300px; margin 20px auto; padding 0 20px`, VodafoneRegular 16/24
 * - crumbs 16px apart; links black; the 16×16 #0D0D0D chevron sits between
 *   them; the current page is black at 50% opacity
 * - below md only a back arrow (to "/") and the current page are shown
 * Was a 1030px, 14px grey strip before — narrower and lighter than live.
 */
function Chevron() {
  return (
    <svg className="hidden md:block" width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5.1665 2.3335L10.8332 8.00016L5.1665 13.6668" stroke="#0D0D0D" strokeMiterlimit={10} strokeLinecap="round" />
    </svg>
  );
}

/**
 * `root` replaces the leading "Ana Sayfa" crumb (and the mobile back arrow's
 * target). `variant="blog"` is the live blog post's own copy of this widget:
 * `widget_Blog` renders its breadcrumb in VodafoneLight with `py-3` instead
 * of the general widget's VodafoneRegular and `my-5`, rooted at
 * "Vodafone Pay Bloglar" → /blog.
 */
export function Breadcrumb({
  current,
  trail,
  root = { label: "Ana Sayfa", href: "/" },
  variant = "default",
}: {
  current: string;
  trail?: { label: string; href: string }[];
  root?: { label: string; href: string };
  variant?: "default" | "blog";
}) {
  return (
    <div
      className={
        variant === "blog"
          ? "mx-auto w-full max-w-[1300px] px-5 py-3 font-light text-base leading-6 text-black subpixel-antialiased"
          : "mx-auto my-5 w-full max-w-[1300px] px-5 font-sans text-base leading-6 text-black subpixel-antialiased"
      }
    >
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-x-4">
          <li className="md:hidden">
            <Link href={root.href} aria-label={root.label} className="inline-flex items-center justify-center p-2">
              <svg width={15} height={12} viewBox="0 0 15 12" fill="none" aria-hidden="true">
                <path
                  d="M0 5.86322C0 6.03272 0.0738373 6.19433 0.20224 6.30485L6.32772 11.5845C6.43801 11.6797 6.57361 11.7263 6.70828 11.7263C6.87245 11.7263 7.03521 11.6574 7.15038 11.5236C7.36075 11.2796 7.33312 10.9109 7.08954 10.701L2.15359 6.44626L13.8663 6.44626C14.1883 6.44626 14.45 6.18504 14.45 5.86299C14.45 5.54094 14.1883 5.27972 13.8663 5.27972L2.15405 5.27972L7.08954 1.02549C7.33312 0.815583 7.36075 0.44686 7.15038 0.202825C6.94048 -0.040745 6.57129 -0.0697689 6.32772 0.141991L0.20224 5.42136C0.0738373 5.53212 0 5.69349 0 5.86322Z"
                  fill="#333333"
                />
              </svg>
            </Link>
          </li>
          <li className="hidden md:block">
            <Link href={root.href}>{root.label}</Link>
          </li>
          <Chevron />
          {(trail ?? []).map((crumb) => (
            <li key={crumb.href} className="hidden items-center gap-x-4 md:flex">
              <Link href={crumb.href}>{crumb.label}</Link>
              <Chevron />
            </li>
          ))}
          <li className="opacity-50" aria-current="page">
            {current}
          </li>
        </ol>
      </nav>
    </div>
  );
}
