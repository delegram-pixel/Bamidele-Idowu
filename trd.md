# Freelance Portfolio Website — Technical Requirements Document

## 1. Technical Objective

Build a fast, responsive, maintainable personal portfolio using Next.js, TypeScript, and Tailwind CSS.

The technical implementation must support experimental motion and large project visuals without sacrificing accessibility, SEO, reliability, or mobile performance.

## 2. Technology Stack

### Core

- Next.js App Router.
- React.
- TypeScript with strict mode.
- Tailwind CSS.
- Yarn as the package manager.
- ESLint and Prettier.

### UI and animation

- Framer Motion for component and scroll-driven animations.
- GSAP with ScrollTrigger only where complex pinned sequences justify the additional dependency.
- Lenis for optional smooth scrolling, provided native scrolling remains accessible.
- Lucide React for icons.

Choose the simplest library combination that delivers the required experience. Do not install multiple libraries to solve the same problem unnecessarily.

### Forms and validation

- Zod for server-side request validation.
- React Hook Form if the form complexity warrants it.
- A transactional email provider such as Resend, or an equivalent supported service.

### Testing

- Vitest.
- React Testing Library.
- Playwright.
- Automated accessibility checks where practical.

### Hosting

- Vercel or another compatible Next.js hosting platform.
- Custom domain with HTTPS.

## 3. Application Architecture

The portfolio is primarily a static, content-driven website. Use server rendering and static generation where appropriate.

Recommended structure:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── work/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── api/
│   │   └── contact/
│   │       └── route.ts
│   ├── robots.ts
│   ├── sitemap.ts
│   └── opengraph-image.tsx
├── components/
│   ├── layout/
│   ├── sections/
│   ├── projects/
│   ├── contact/
│   ├── motion/
│   └── ui/
├── data/
│   ├── projects.ts
│   ├── services.ts
│   ├── process.ts
│   └── site-config.ts
├── lib/
│   ├── email/
│   ├── validation/
│   ├── analytics/
│   └── utils/
├── types/
└── styles/
```

Keep reusable components separate from content and business logic.

Use Server Components by default. Add Client Components only where interaction, animation, state, or browser APIs require them.

## 4. Routing

Required routes:

- `/` — Main portfolio.
- `/work/[slug]` — Individual project case studies.

Case studies must have shareable URLs and their own page metadata.

Unknown slugs should return a proper not-found page.

Do not introduce a blog or CMS in version one.

## 5. Content Management

Store project and service content in typed TypeScript data files.

Each project should support:

- Slug.
- Title.
- Short description.
- Longer case-study narrative.
- Role.
- Technology stack.
- Status.
- Cover image.
- Gallery images.
- Relevant external links.
- Visibility and publication state.

Adding a project should require updating its data and assets rather than changing the overall layout.

All content must remain editable by the developer without a database or CMS.

## 6. Animation System

Create a reusable motion system rather than implementing every animation independently.

Required effects:

- Hero headline reveal.
- Staggered text reveals.
- Scroll-triggered section transitions.
- Horizontal case-study presentation.
- Subtle parallax on project visuals.
- Button attraction effects on suitable desktop pointers.
- Service ticker.
- Optional sound toggle, disabled by default.

Requirements:

- Respect `prefers-reduced-motion`.
- Keep all content accessible without animation.
- Do not force users to wait for transitions.
- Avoid hijacking normal scrolling.
- Support touch devices without hover dependencies.
- Ensure pinned horizontal sections do not trap mobile users.
- Provide static fallbacks if JavaScript fails.

Prefer CSS for simple transitions. Use Framer Motion for reusable interaction and GSAP only for sequences that need its capabilities.

## 7. Smooth Scrolling

If Lenis is used:

- Preserve normal browser navigation.
- Support anchor links.
- Keep keyboard scrolling functional.
- Respect reduced-motion preferences.
- Avoid conflicts with GSAP ScrollTrigger.
- Disable or simplify smooth scrolling on devices where it causes usability problems.

Smooth scrolling must enhance the experience, not interfere with it.

## 8. Clock and Availability

Display Port Harcourt local time using the `Africa/Lagos` time zone.

Requirements:

- Format time consistently.
- Avoid server/client hydration mismatches.
- Update the display without excessive rendering.
- Provide a stable fallback if client-side time cannot be read.

Treat availability as configurable content. Do not automatically claim that Bamidele is available unless that status is intentionally maintained.

## 9. Contact Form

Suggested endpoint:

`POST /api/contact`

Fields:

- Name.
- Email.
- Project type.
- Budget range.
- Message.

Requirements:

- Validate all fields on the server.
- Normalise and validate email addresses.
- Apply length limits.
- Protect against spam using a honeypot and rate limiting; add CAPTCHA only if needed.
- Send enquiries through a server-side email provider.
- Keep provider credentials in server-only environment variables.
- Return structured success and error responses.
- Do not expose stack traces or email-provider details.
- Do not log unnecessary personal information.
- Provide accessible form feedback.

The MVP does not require a database for contact enquiries if email delivery is sufficient.

## 10. Analytics

Use a privacy-friendly analytics service.

Measure events such as:

- `hero_contact_click`
- `hero_work_click`
- `project_open`
- `contact_form_start`
- `contact_form_success`
- `contact_form_error`
- `email_click`
- `whatsapp_click`

Do not send contact messages, email addresses, or other personal form data to analytics.

If consent is legally or technically required by the chosen analytics setup, implement it before tracking.

## 11. SEO

Implement:

- Page titles and descriptions.
- Canonical URLs.
- Open Graph metadata.
- Social-sharing images.
- Sitemap.
- Robots configuration.
- Appropriate person and website structured data.
- Semantic HTML.
- Descriptive image alt text.
- Meaningful case-study titles.

Only publish structured-data claims that can be verified.

## 12. Performance

Performance budget:

- Initial transfer under 1 MB excluding video.
- Mobile LCP under 2.5 seconds.
- Lighthouse performance score of 90+ as the target.
- No unnecessary animation libraries or large client bundles.
- Use modern image formats where appropriate.
- Optimise image dimensions.
- Lazy-load below-the-fold media.
- Prevent layout shifts by reserving media dimensions.
- Avoid autoplay video and unnecessary WebGL.

The optional 3D hero is out of scope for version one.

## 13. Accessibility

Target WCAG 2.2 AA principles.

- Keyboard-accessible navigation and controls.
- Visible focus indicators.
- Semantic landmarks and heading hierarchy.
- Sufficient text contrast.
- Accessible form labels and errors.
- Reduced-motion support.
- No information conveyed only through color or animation.
- Accessible horizontal case-study navigation.
- No mandatory audio.
- Screen-reader-friendly project status labels.

## 14. Security

- Validate contact requests server-side.
- Rate-limit form submissions.
- Protect email credentials.
- Use HTTPS.
- Configure appropriate security headers.
- Avoid rendering untrusted HTML.
- Avoid unnecessary dependencies.
- Keep dependencies updated.
- Do not expose secrets through `NEXT_PUBLIC_` variables.

## 15. Testing

### Unit tests

- Contact validation.
- Project data validation.
- Time formatting.
- Availability configuration.
- Analytics event mapping.

### Integration tests

- Contact API validation.
- Email provider error handling.
- Spam and rate-limit behavior.
- Case-study metadata generation.

### End-to-end tests

- Navigation.
- Hero CTA behavior.
- Case-study routes.
- Contact form submission.
- Mobile menu.
- Reduced-motion experience.
- Responsive horizontal project navigation.

## 16. Environment Variables

Document required environment variables in `.env.example`.

Possible values:

```text
SITE_URL=
CONTACT_EMAIL_TO=
EMAIL_API_KEY=
EMAIL_FROM=
ANALYTICS_ID=
```

Use the exact variable names supported by the selected providers. Do not commit actual secrets.

## 17. Required Scripts

```bash
yarn dev
yarn lint
yarn typecheck
yarn test
yarn build
yarn test:e2e
```

## 18. Definition of Done

- The production build passes.
- Type checks and linting pass.
- All routes work.
- The contact form is functional.
- Motion supports reduced-motion preferences.
- Project content is data-driven.
- SEO metadata is complete.
- No critical accessibility issues remain.
- Performance targets are tested.
- Deployment and environment setup are documented.