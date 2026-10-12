# Bamidele Idowu — Portfolio

A freelance portfolio site for a remote web developer and instructor based in Port Harcourt, Nigeria.

Built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS v4. The design direction is "Claret & Lavender Blush": a print-catalogue editorial layout — blush canvas, claret ink, a bordered left nav rail, oversized display serif, and monospace metadata set as spec-sheet tables.

---

## Before you start: this build fails on purpose

`yarn build` runs `yarn validate:content` as a `prebuild` step, and that gate **fails while any `TODO:` placeholder remains in the content files.**

That is deliberate. The project brief sets hard accuracy rules — no invented testimonials, client logos, user counts, revenue figures, or project outcomes — and a mechanical gate is the only reliable way to keep an unconfirmed claim from reaching production.

Running `yarn dev` works fine. Only the production build is gated.

### What to confirm before launch

Search the repository for `TODO:` to get the live list with file paths:

```bash
grep -rn "TODO:" src/
```

As the content stands, these are the outstanding items:

| File | What needs confirming |
| --- | --- |
| `src/data/site-config.ts` | Name, headline, description, location label, contact email, WhatsApp number, booking URL, social links, and the availability status with its review date |
| `src/data/projects.ts` | Bamidele's exact role on each of Admission Copilot, Iventverse, and StockSchool; Iventverse's current outcome and planned next steps; StockSchool's planned curriculum; whether Next Horizon Hub may be published |
| `src/data/services.ts` | Wording of each service, its deliverables, and the pricing label |
| `src/data/process.ts` | The four process steps |
| `src/data/pricing.ts` | Either real prices or confirmation that the "request a quote" fallback is the right posture |
| `.env.local` | The email delivery credentials (see below) |

Two content decisions are load-bearing and should not be changed casually:

- **StockSchool must always state that it does not execute real trades.** The brief requires it. The wording is in `src/data/projects.ts` and there is a test asserting it in `src/data/__tests__/projects.test.ts`.
- **Next Horizon Hub stays `published: false` until there is written client permission.** While it is false, the project is absent from every public route and `/work/next-horizon-hub` returns a 404. Flipping the flag to `true` is the only change needed once permission is confirmed — the route and layout already exist.

### A note on the availability claim

`siteConfig.availability.lastReviewed` is checked against a 60-day window. Once that date is more than 60 days old, the content gate fails. This is intentional: an availability claim nobody has re-confirmed is a claim the site should not be making.

---

## Getting started

```bash
yarn install
cp .env.example .env.local   # then fill it in
yarn dev
```

Open <http://localhost:3000>.

Node 20.9.0 or newer is required (Next.js 15's minimum).

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | In production | Canonical origin, used for metadata, `robots.txt`, and `sitemap.xml` |
| `CONTACT_EMAIL_TO` | Yes | Where contact enquiries are delivered |
| `EMAIL_API_KEY` | Yes | Resend API key |
| `EMAIL_FROM` | Yes | Verified sender address |
| `NEXT_PUBLIC_ANALYTICS_SRC` | No | Analytics script URL. Leave empty to disable analytics entirely |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | No | Analytics site domain |

Nothing secret belongs in a `NEXT_PUBLIC_` variable — those are inlined into the client bundle. The email credentials are read only in `src/lib/email/send.ts`, which is server-only.

**Without email credentials, the contact form still validates and submits**, but the endpoint reports a delivery failure rather than falsely claiming success. That is the correct behaviour: the form must never tell someone their message was sent when it was not.

---

## Design system

### Palette

Two colours, supplied by the client, and nothing else:

| Token | Value | Role | Contrast |
| --- | --- | --- | --- |
| `--color-canvas` | `#FFF0F5` | Page background (Lavender Blush) | — |
| `--color-surface` | `#FBE7EE` | Recessed panels | 8.24:1 with claret |
| `--color-plate` | `#FFFFFF` | Plates floating above the canvas | 9.85:1 with claret |
| `--color-ink` | `#7F1734` | Primary text and display (Claret) | 9.18:1 on canvas |
| `--color-ink-muted` | `#6E4A57` | Secondary body text | 6.85:1 on canvas |
| `--color-ink-faint` | `#A8768A` | Dimmed, disabled, decorative | 3.4:1 — **large or decorative only** |
| `--color-accent-deep` | `#5E0F26` | Solid fills and inverted sections | 12.11:1 with canvas |

Claret and Blush are reciprocal: claret-on-blush and blush-on-claret both measure 9.18:1, so the same pair serves normal and inverted sections. That is why no third hue is introduced anywhere.

Tokens are named for their **role**, not their colour. An earlier revision named them after their values (`midnight`, `electric`, `ice`), which is how a palette change turns into a liability: every component ends up referring to "midnight" for a pale pink. With role names, changing the palette is an edit to the `@theme` block in `src/styles/globals.css` and nothing else.

**This is a deliberate deviation from `design-brief.md` §3**, which specifies a dark-first navy and electric blue. The brief's own rules on the conversion path, accessibility targets, motion, and content accuracy still bind.

### Type

| Role | Face | Loaded by |
| --- | --- | --- |
| Display | **Instrument Serif** | `next/font/google` |
| Body | **Inter** | `next/font/google` |
| Metadata | **JetBrains Mono** | `next/font/google` |

All three are self-hosted at build time, so no request reaches a third-party font CDN. That is a performance win and a privacy one — no visitor IP is disclosed to Google by a font request.

Instrument Serif ships **one weight (400)**. `globals.css` sets `font-synthesis-weight: none`, so a `font-semibold` on a heading would silently do nothing while implying weight control that does not exist. Display hierarchy therefore comes from size, case, and letterspacing, and no component sets a weight on display text.

Two details the design depends on:

- `font-variant-numeric: lining-nums tabular-nums` on metadata figures, so index counters and the local clock do not jitter as digits change.
- Mixed roman/italic display lines — see the headline in `Hero.tsx`. The italic is where this serif has the most character.

### Other deviations from the brief, recorded

- **Display face** — §4 specifies Clash Display, a paid Fontshare licence that was never supplied. It is not bundled. Instrument Serif is free, self-hosted, and its stroke contrast is what makes the palette read as editorial rather than as a pink site.
- **Left nav rail** — §1 warns against copying a reference's menu placement. The rail is adopted at `xl` and above because the reference was supplied directly. The nav's contents, scroll-spy, mobile disclosure menu, and focus behaviour are the original implementation, unchanged.

---

## Deployment

The site deploys to Vercel with no configuration beyond the environment variables above.

1. Push the repository to a Git host.
2. Import it in Vercel. The framework preset is detected automatically.
3. Add every variable from the table above to the project's environment settings.
4. Set `SITE_URL` to the production origin, e.g. `https://bamidele.dev`.
5. Deploy.

`yarn build` will refuse to complete until the content gate passes. To preview the deployment pipeline before content is final, use the escape hatch described below — but never ship a build produced that way.

### Security headers

`next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS. A Content Security Policy is deliberately deferred and the reasoning is documented inline: Next.js injects inline scripts for hydration, so a strict CSP needs per-request nonces, and a policy loose enough to work without them provides little protection while giving a false sense of it.

---

## Rate limiting

`src/lib/rate-limit.ts` implements an in-memory sliding window: 5 submissions per IP per 10 minutes.

**This is best-effort, not a guarantee.** On a serverless platform each instance holds its own store, so an attacker spreading requests across instances can exceed the limit. It raises the cost of casual abuse; it does not stop a determined one.

For a hard limit, replace the body of `checkRateLimit` with a call to a shared store — Upstash Redis and Vercel KV both fit — keeping the same `RateLimitResult` shape. Nothing else in the codebase needs to change, because the endpoint only ever calls `checkRateLimit` and reads `allowed` and `retryAfterSeconds`.

The honeypot and minimum-fill-time checks in the same file are independent of all this and continue to work regardless.

---

## Scripts

| Command | What it does |
| --- | --- |
| `yarn dev` | Development server |
| `yarn build` | Production build. Runs the content gate first |
| `yarn start` | Serve a completed production build |
| `yarn lint` | ESLint |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn test` | Unit and integration tests (Vitest) |
| `yarn test:watch` | The same, in watch mode |
| `yarn test:e2e` | End-to-end tests (Playwright) |
| `yarn validate:content` | The content gate on its own |
| `yarn format` | Prettier, writing changes |
| `yarn format:check` | Prettier, reporting only |

### The content gate's escape hatch

```bash
SKIP_CONTENT_VALIDATION=1 yarn build
```

This builds despite unresolved placeholders. It exists so the pipeline can be verified before content is final. It prints a warning saying so, and **a build produced this way must never be deployed.**

### End-to-end tests

`playwright.config.ts` starts the **development** server rather than a production build, because the build is gated. Install the browsers once:

```bash
yarn playwright install
yarn test:e2e
```

Tests run against two projects — desktop Chrome and a Pixel 7 viewport — because several behaviours (the horizontal project rail, the mobile menu, the responsive stacking) only exist on one side of a breakpoint. Each is skipped, with a reason, on the viewport where it does not apply.

---

## Project structure

```text
src/
  app/                    Routes, metadata, API endpoint, generated OG image and icon
  components/
    analytics/            Typed event tracking
    contact/              Form and prefill context
    layout/               Header, footer, persistent CTA
    motion/               Reduced-motion-aware animation primitives
    projects/             Case-study presentation
    sections/             Homepage sections
    ui/                   Buttons, sections, badges, rules, index numerals, metadata tables
  data/                   All content, typed. This is where copy lives
  lib/                    Validation, email, rate limiting, analytics, utilities
  styles/                 Tailwind theme and design tokens
  types/                  Shared domain types
```

Content is data, not markup. Adding a project means adding an entry to `src/data/projects.ts` and, if you have one, a screenshot — never restructuring a page.

---

## Content accuracy rules

These come from the project brief and are treated as requirements:

- Only `published: true` projects appear on any public route. `featured: true` additionally places one in Selected Work.
- Optional narrative fields (`problem`, `approach`, `implementation`, `outcome`, `nextSteps`) are genuinely optional. Leaving one out is correct; the case study simply omits that block. Filling one in with a plausible-sounding outcome is not.
- A missing `coverImage` is fine and expected — the case study renders generated fallback art rather than a broken image or an invented screenshot. Alt text without the image it describes is a build error.
- A pre-launch project may not link to a live URL.
- A visible price requires a confirmed amount and currency. Prices default to hidden with a "request a quote" fallback, and the gate enforces this.
- Analytics events carry no personal data — no form contents, no email addresses, no message text. Only identifiers the code itself defines. See `src/lib/analytics/events.ts`.

### Accessibility

Targets WCAG 2.2 AA. Contrast ratios were computed rather than eyeballed, and the results are recorded in the comments in `src/styles/globals.css`. Three findings worth knowing:

- `--color-ink-faint` measures 3.4:1, which passes AA for large text and nothing else. It is **never** used for body copy or for an interactive control. The dimmed project index in the work rail — which is clickable — uses `--color-ink-muted` (6.85:1) for exactly this reason.
- Status is never conveyed by colour alone. Every badge and indicator carries text, and the dimmed/active states in the rail are carried by a left bar, the colour, and `aria-current` together.
- The form's error state moved from `red-400` (2.51:1 on blush) to `red-700` (5.93:1 on blush, 6.54:1 on a white plate). An error message is not decorative.

### Reduced motion

`MotionProvider` sets Framer Motion's `reducedMotion="user"`, and `src/styles/globals.css` carries a global override for CSS animations. Components check `useReducedMotion()` where the fallback has to be a different element rather than just a shorter animation. The end-to-end suite asserts that nothing is left stranded at zero opacity when motion is reduced.

---

## A note on what has and has not been verified

**Dependencies are installed, and `yarn typecheck` has now been run once.** It reported
`Found 11 errors in 5 files`. That is the first time any tool has been run against this source,
and it contradicted what this section previously claimed — that the redesign was
"code-complete". It did not compile. All eleven errors were in plumbing rather than in the
visual work, and all are now fixed:

| File | What was wrong | Fix |
| --- | --- | --- |
| `src/components/contact/ContactForm.tsx` | `FormValues` omitted `message`, which three call sites read | field added to the interface and to `EMPTY_VALUES` |
| `src/lib/analytics/track.ts` | `Extract<AnalyticsEvent, { name: K }>` collapsed the payload parameter to `never` | payload named as `AnalyticsEventPayloads[K]`, which defers cleanly |
| `src/components/ui/LocalTime.tsx` | `CLOCK_LOCALE` imported but never used | import removed |
| `src/app/api/contact/__tests__/route.test.ts` | `body.code` read directly off the `ContactResponse` union | `expectErrorBody` narrows it, so a success body throws |
| `src/components/contact/__tests__/ContactForm.test.tsx` | `@testing-library/dom` was never installed | added to `devDependencies` — **this needs `yarn install`** |

The first of those was not a typing problem. `values.message` was `undefined`, and
`contactSchema` requires at least 30 characters, so the client-side check rejected **every**
submission before it reached the network — the form could not be submitted at all. It also
contradicted a claim made during review that the form's behaviour was untouched. The honest
version is recorded here rather than the tidy one: a read-through did not find this, and a
compiler did.

Why `@testing-library/dom` mattered: it is a **peer** dependency of `@testing-library/react` v16,
and Yarn 1 does not install peer dependencies. Its absence surfaced as three "no exported member"
errors rather than as a missing-module error, because `render` is declared in the package itself
while `screen`, `fireEvent`, and `waitFor` are re-exported from the absent one. Adding it to
`package.json` is not sufficient on its own — it has to be installed.

**Then `yarn lint` ran**, which means `yarn typecheck` exited clean on the pass before it — the
steps are `&&`-joined. Lint reported **3 errors and 10 warnings**.

The 10 warnings were all a single deliberate idiom: a leading underscore on a name that exists
only to be kept out of a rest spread. The rule now carries `ignoreRestSiblings` and `^_` patterns
so the idiom reads as intentional, rather than the code carrying suppression comments.

The 3 errors:

| File | What was wrong | Fix |
| --- | --- | --- |
| `e2e/reduced-motion.spec.ts` | `page: import("@playwright/test").Page` — an inline `import()` type | `import { expect, test, type Page }` |
| `next-env.d.ts` | triple-slash reference, which the rule forbids | the file is generated, so ESLint ignores it |
| `src/components/ui/LocalTime.tsx` | `let timeoutId` assigned exactly once | `const` |

The `next-env.d.ts` one is worth knowing about rather than fixing: Next rewrites that file on
every `dev` and `build`, and its own header says not to edit it, so any change made in place is
reverted on the next run. The only durable fix is to stop linting it.

**The test suites have still never run.** `yarn test` has not executed once, because lint exited
non-zero before the chain reached it, and `yarn test:e2e` has not been started at all. Nothing
below has been rendered, measured, or asserted — treat the redesign as unverified until those
two commands pass.

One class of bug is worth naming explicitly, because it is the one this kind of change produces
and it is *silent*: Tailwind drops any class it does not recognise. A stale `bg-midnight` left
behind by the rename renders no background at all and reports no error, so a missed token shows
up as a missing surface rather than as a build failure. The fastest check for it is to search
`src/` for the old names:

```bash
grep -rnE "midnight|electric|offwhite|ink-ice|paper-ink|paper-muted|text-muted" src/
```

Every hit should be inside a comment explaining the palette change. Anything else is a real
defect.

Two things found by a later read-through rather than by a tool, and fixed:

- `MetaTable` declared a `tone` prop that no code read. No caller passed it, so nothing was
  broken yet — but a caller on a claret panel would have set it, seen no error, and shipped
  claret labels on claret. The prop is gone, so that mistake is now a compile error.
- `e2e/mobile-menu.spec.ts` asserted the hero headline fits within 393px while running under the
  Pixel 7 descriptor (412px). The headline box is 16px of gutter plus a 380px column, so that
  test failed on its box model alone at any font size. It now pins the viewport to 393px, which
  is what its own name claims.

One file, `implementation.md`, is a byte-for-byte duplicate of `backend-schema.md` and contains
no unique content. It has been left alone rather than deleted without asking.
# Bamidele-Idowu
