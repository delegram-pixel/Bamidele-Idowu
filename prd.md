# Freelance Portfolio Website — Product Requirements Document

**Version:** 1.0  
**Owner:** Bamidele Idowu  
**Product type:** Personal freelance portfolio and lead-generation website  
**Primary objective:** Generate qualified freelance enquiries

## 1. Product Overview

Build a distinctive, motion-driven personal portfolio that presents Bamidele Idowu as a web developer and instructor who builds practical digital products.

The website must balance creative presentation with commercial clarity. Visitors should quickly understand what Bamidele builds, what services are available, what he has worked on, how projects are delivered, and how to start a project.

The website takes inspiration from the energy, motion, and project-focused presentation of danieldere.com without copying its layout, assets, typography, or distinctive visual elements.

## 2. Problem Statement

A portfolio can look impressive but still fail to convert visitors if it does not clearly communicate its services, credibility, process, and pricing expectations.

Bamidele has experience across web applications, event platforms, blockchain-related products, client websites, and JavaScript teaching. This experience needs to be presented as a coherent professional offering rather than a collection of unrelated projects.

The opportunity is to build a memorable portfolio that demonstrates technical capability while making the decision to hire straightforward.

## 3. Product Goals

- Generate qualified freelance and client enquiries.
- Communicate services clearly within the first 30 seconds.
- Showcase three to five carefully selected projects.
- Demonstrate technical ability through credible project case studies.
- Explain the process of working together.
- Give visitors clear pricing expectations or explain how quotations work.
- Make contacting Bamidele easy on desktop and mobile.
- Demonstrate high-quality frontend engineering through motion, responsiveness, accessibility, and performance.

### Success metrics

Initial targets for the first 90 days:

- Five qualified enquiries.
- Hero-to-contact click-through rate above 8%.
- Mobile Largest Contentful Paint below 2.5 seconds.
- Lighthouse performance score of 90 or higher.
- Lighthouse accessibility score of 95 or higher.
- Average engagement time above 90 seconds.

These are initial targets, not guaranteed outcomes.

## 4. Target Audience

### Audience A: Startup founders

People who need an MVP, web application, or product website and want a developer who can turn an idea into a working product.

### Audience B: Small and medium-sized businesses

Businesses and organisations that need professional websites, internal tools, or improved digital experiences.

### Audience C: Schools and training teams

Organisations seeking JavaScript instruction, beginner web development training, or code review.

### Audience needs

Visitors should be able to answer these questions quickly:

1. Who is Bamidele?
2. What can he build?
3. Can he demonstrate relevant experience?
4. What does working with him look like?
5. How much might the project cost?
6. How can they contact him?

## 5. Positioning

**Proposed core message:** “I build web products people actually use.”

Supporting message: Bamidele Idowu is a remote web developer and instructor who builds MVPs, business websites, and digital products while explaining the process clearly.

Use straightforward, confident language. Avoid exaggerated claims, generic developer slogans, and unsupported statements about business results.

## 6. Scope

### Included in version one

- One-page portfolio website.
- Responsive navigation.
- Hero section with animated typography.
- Services section.
- Selected-work showcase.
- Individual project case studies.
- About and teaching section.
- Four-step project process.
- Pricing signals.
- Contact form and contact alternatives.
- Persistent contact call to action.
- Live Port Harcourt local-time display.
- Availability indicator.
- Privacy-friendly analytics.
- SEO and social sharing metadata.
- Sitemap and robots configuration.
- Custom-domain deployment with HTTPS.

### Excluded from version one

- Blog.
- Content management system.
- E-commerce.
- User accounts.
- Interactive coding playground.
- Multilingual support.
- A manual dark/light theme switch.
- A full 3D scene.
- Testimonials without genuine, approved testimonials.

## 7. Information Architecture

### 7.1 Hero

Requirements:

- Clear headline communicating the value offered.
- Concise supporting copy.
- Primary CTA: Start a Project.
- Secondary CTA: See My Work.
- Live local-time display.
- Availability indicator.
- Original scroll-driven typography animation.

### 7.2 Services

Present three or four clear service offers.

Initial service categories:

- MVPs and web applications.
- Business websites.
- JavaScript training.
- Code review and technical guidance.

Each service must identify its intended audience, typical deliverable, and expected outcome.

### 7.3 Selected Work

Show three to five featured projects as visually distinctive case-study spreads.

Candidate projects:

- Admission Copilot.
- Iventverse.
- StockSchool.
- Next Horizon Hub, subject to client permission.

Each project should include its title, summary, role, technology stack, current status, and available project link.

Each case study should explain:

1. The problem.
2. The approach.
3. The implementation.
4. The result or current status.
5. What could be improved next.

Use genuine project screenshots and mockups supplied or approved by Bamidele.

### 7.4 About and Teaching

Explain Bamidele's approach to development and include his teaching experience as a credibility signal.

Use project photography and product imagery instead of requiring a personal portrait.

### 7.5 Process

Show four stages:

1. Discovery and requirements.
2. Scope and planning.
3. Design and development.
4. Launch and support.

### 7.6 Pricing

Show starting prices, realistic ranges, or a clear explanation of how quotations are calculated.

All amounts must be confirmed before launch. Do not publish invented prices as final offers.

### 7.7 Contact

Include:

- Name.
- Email.
- Project type.
- Budget range.
- Message.
- Email contact link.
- WhatsApp contact link.
- Optional booking link.
- Spam protection.
- Submission confirmation.
- A persistent contact CTA.

### 7.8 Footer

Include social links, location, availability, and copyright information.

## 8. Project Content and Accuracy

- Admission Copilot must be labelled accurately as pre-launch where applicable.
- Iventverse must use Bamidele's confirmed role.
- StockSchool must be described as an educational tokenized-equities project that does not execute real trades.
- Next Horizon Hub must only be presented as a public case study with the client's permission.
- In-progress projects must be labelled as such or omitted.
- Bug bounty work must only be included if Bamidele chooses to publish it.
- Do not invent testimonials, client logos, user counts, revenue figures, or project outcomes.

## 9. Functional Requirements

- FR-01: Visitors can navigate between all main sections.
- FR-02: Visitors can explore featured projects and open case studies.
- FR-03: Visitors can understand each service and its intended audience.
- FR-04: Visitors can understand the project process and pricing approach.
- FR-05: Visitors can submit a contact enquiry.
- FR-06: Valid enquiries are delivered to the configured email destination.
- FR-07: The form provides clear validation, loading, success, and error states.
- FR-08: Contact CTAs remain accessible during scrolling.
- FR-09: The local clock displays the correct Port Harcourt time.
- FR-10: The availability indicator uses configurable content.
- FR-11: Analytics can measure CTA clicks and successful form submissions.
- FR-12: Pages include appropriate SEO and social-sharing metadata.
- FR-13: The website works on mobile, tablet, and desktop.
- FR-14: Motion respects reduced-motion preferences.
- FR-15: New projects can be added through typed data files without redesigning the page.

## 10. Non-Functional Requirements

- Target WCAG 2.2 AA accessibility principles.
- Target mobile LCP below 2.5 seconds.
- Target Lighthouse performance of 90+.
- Target Lighthouse accessibility of 95+.
- Keep the initial transfer under 1 MB excluding video.
- Optimise and lazy-load imagery where appropriate.
- Support slow connections and mid-range Android devices.
- Keep code maintainable and documented.
- Protect the contact form against spam and abuse.
- Avoid unnecessary third-party scripts.

## 11. Risks

**Visual effects harm performance:** Use a motion budget, lazy loading, and fallbacks.

**Portfolio looks impressive but lacks clarity:** Make services, process, pricing signals, and contact prominent.

**Limited public results:** Use honest project descriptions and explain the work performed.

**Scope creep:** Keep version one focused on the requirements listed above.

## 12. Acceptance Criteria

The portfolio is ready for launch when:

- All required sections are implemented.
- Project case studies contain accurate information.
- The contact form successfully delivers messages.
- Contact links work correctly.
- The responsive design works from 320px upward.
- Motion has accessible reduced-motion alternatives.
- SEO and social metadata are configured.
- Analytics events work where enabled.
- No placeholder claims or unapproved content remain.
- The production build passes.
- The site is deployed to the custom domain with HTTPS.

## 13. Product Principle

**The website should make people want to explore, give them a reason to trust Bamidele, and make it easy to start a project.**