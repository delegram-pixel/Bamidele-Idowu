# Freelance Portfolio Website — Design Brief

## 1. Creative Direction

**Concept:** Kinetic Editorial  
**Mood:** Midnight studio, experimental, confident, premium.  
**Primary goal:** Make the portfolio memorable while clearly communicating services and generating client enquiries.

The reference website demonstrates the value of motion, personality, and project-focused storytelling. The portfolio must borrow that level of ambition—not its actual design.

Create an original visual identity, composition, navigation, and motion language.

## 2. Brand Personality

The website should feel:

- Technically capable.
- Creative without being chaotic.
- Confident without being arrogant.
- Premium without feeling inaccessible.
- Modern without chasing every trend.
- Human and understandable to non-technical clients.

Avoid generic developer portfolios, excessive glassmorphism, and decorative effects that compete with project content.

## 3. Color Palette

Use a dark-first palette.

| Token | Value | Purpose |
|---|---|---|
| Midnight navy | `#0B1020` | Main background |
| Electric blue | `#2F6BFF` | Primary accent and key actions |
| Ice cyan | `#7DD3FC` | Small highlights |
| Off-white | `#F4F6FB` | Primary text and light surfaces |
| Slate | `#8A94A8` | Secondary text |
| Deep surface | `#131B30` | Layered panels and content surfaces |

Electric blue should be used intentionally for headlines, controls, and graphics. Body text should remain highly readable.

A light section can use off-white as its background and midnight navy as its primary text while retaining the same blue accents.

## 4. Typography

### Headlines: Clash Display

Use oversized headlines with a strong editorial character.

### Body: Inter

Use Inter for paragraphs, navigation, form labels, and explanatory copy.

### Technical labels: JetBrains Mono

Use for local time, project metadata, technology labels, and small status indicators.

All fonts should be loaded efficiently using a supported Next.js font strategy.

Typography should establish hierarchy before decoration. Large type must remain readable and avoid awkward clipping on mobile.

## 5. Signature Layout

Create a distinctive editorial composition built around:

- Large typography.
- Confident whitespace.
- Asymmetrical alignment.
- Layered project imagery.
- Strong section transitions.
- Large case-study spreads.
- Compact metadata.
- Clear conversion actions.

Do not copy the reference's exact menu placement, vertical branding, character, carousel arrangement, or composition.

## 6. Hero

The hero must immediately communicate what Bamidele does.

Suggested headline:

**I build web products people actually use.**

Supporting text:

"Bamidele Idowu — remote web developer and instructor. I build MVPs, business websites, and digital products, and help teams learn along the way."

Primary CTA: Start a Project.

Secondary CTA: See My Work.

Include the live Port Harcourt local time and a configurable availability indicator.

### Hero motion

Animate headline lines into place on initial load. Use restrained transitions and maintain readability during animation.

A layered composition of project screenshots and graphic shapes may support the hero, but it should not obstruct the main message.

## 7. Navigation

Build an original, compact navigation system with links to:

- Work.
- Services.
- About.
- Process.
- Contact.

Use smooth anchor navigation and a clear active or hover state.

Keep a contact CTA accessible while scrolling.

## 8. Selected Work

The portfolio's signature feature should be a series of large, editorial case-study spreads.

Each project should receive a distinctive composition suited to its screenshots and story.

Possible visual approaches:

- Oversized product screenshot.
- Layered device or browser mockups.
- Large project title with compact technical metadata.
- Full-width editorial panel.
- Scroll-driven reveal of project details.

Do not force every project into an identical template if different compositions improve the storytelling.

Project status and role must be clear.

## 9. Horizontal Case-Study Experience

A horizontal project sequence may be used on desktop to create a cinematic presentation.

Requirements:

- Provide intuitive navigation.
- Keep text and controls accessible.
- Avoid scroll trapping.
- Support touch and smaller screens.
- Preserve browser scrolling.
- Include a clear position indicator where useful.

On mobile, use a vertical layout or a simple, touch-friendly carousel rather than forcing the desktop experience into a narrow viewport.

## 10. Services

Services should be visually distinct but easy to scan.

Use a typographic layout, restrained borders, numbered sections, or subtle motion.

For each service, communicate:

- The intended client.
- The deliverable.
- The outcome.
- A clear next step.

## 11. About and Teaching

Use real product imagery instead of requiring a portrait.

The section should communicate Bamidele's development philosophy and teaching experience.

Keep the writing concise, personal, and specific.

## 12. Process and Pricing

Present the four-step process with a simple visual progression.

Pricing should be straightforward and trustworthy. Use confirmed figures or explain how a custom quote is determined.

Avoid invented urgency, fake discounts, or unsupported guarantees.

## 13. Contact

The contact section should feel like a clear invitation to collaborate.

Use a prominent heading, a compact form, and alternative contact links.

Form controls should have obvious labels, readable focus states, helpful validation, and clear submission feedback.

## 14. Motion Language

### Required effects

- Hero headline rise-and-settle.
- Staggered text reveals.
- Scroll-driven section transitions.
- Project image parallax.
- Horizontal case-study movement where appropriate.
- Subtle pointer-responsive buttons on desktop.
- Slow service ticker.
- Clip-path transitions where they improve section changes.

### Motion rules

- Nothing blocks reading.
- Every essential element remains accessible without animation.
- Respect reduced-motion preferences.
- Avoid excessive parallax.
- Do not force users to scroll in a particular direction.
- Keep animations smooth on mid-range phones.
- Do not animate every element.
- Sound must remain off by default and be fully optional.

## 15. Custom Cursor

A custom cursor may be used on desktop as a small enhancement.

It must:

- Never replace the normal cursor for essential interactions.
- Remain subtle.
- Avoid obscuring text.
- Be disabled on touch devices.
- Respect reduced-motion preferences.
- Never be required to navigate the site.

## 16. Audio

If implemented, the audio toggle should be optional and off by default.

Do not autoplay sound. Do not make audio necessary to understand any content.

Audio should be omitted if it compromises performance or delivery time.

## 17. Responsive Behavior

Support screen widths from 320px to large desktop.

Test:

- 320px.
- 375px.
- 390px.
- 768px.
- 1024px.
- 1440px and above.

Ensure typography wraps correctly, project images remain legible, contact controls are accessible, and no section causes unintended horizontal overflow.

## 18. Accessibility

Target WCAG 2.2 AA principles.

- Keyboard-accessible navigation.
- Visible focus states.
- Adequate contrast.
- Semantic HTML.
- Accessible forms.
- Reduced-motion support.
- No essential hover-only interactions.
- Clear project statuses.
- Screen-reader-friendly dynamic elements.

## 19. Performance

- Avoid a full 3D scene in version one.
- Optimise images.
- Lazy-load below-the-fold media.
- Minimise JavaScript.
- Avoid unnecessary animation loops.
- Prevent layout shifts.
- Keep initial transfer under 1 MB excluding video.

## 20. Design Deliverables

- Design tokens.
- Homepage composition.
- Navigation.
- Hero animation.
- Services section.
- Selected-work spreads.
- Project case-study template.
- About and teaching section.
- Process section.
- Pricing section.
- Contact form.
- Footer.
- Mobile layouts.
- Motion and reduced-motion behavior.
- Loading, error, and form feedback states.

## 21. Quality Standard

The finished portfolio should feel like a carefully art-directed digital experience—not a generic template.

Its visual identity must be original, its projects credible, and its calls to action unmistakable.

The motion should attract attention; the work should earn trust; the contact experience should convert interest into enquiries.