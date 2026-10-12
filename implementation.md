# Freelance Portfolio Website — Backend Schema and Data Model

## 1. Purpose

Define the data structures and minimal backend requirements for the portfolio.

This is primarily a content-driven website. It does not need a database for version one unless enquiry persistence, a private content editor, or another requirement is introduced later.

## 2. Architecture Decision

**Version one should not introduce PostgreSQL or Prisma by default.**

The main content—projects, services, process steps, pricing copy, and availability—can live in typed TypeScript data files.

The contact form can send enquiries through a server-side email service.

This keeps deployment simpler and avoids maintaining a database without a clear need.

## 3. Static Content Models

### Project

```typescript
export type ProjectStatus =
  | "live"
  | "pre-launch"
  | "prototype"
  | "in-progress"
  | "archived";

export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  role: string;
  stack: string[];
  status: ProjectStatus;
  coverImage: string;
  gallery?: string[];
  problem?: string;
  approach?: string;
  outcome?: string;
  nextSteps?: string;
  liveUrl?: string;
  repositoryUrl?: string;
  featured: boolean;
  published: boolean;
}
```

Project data must accurately reflect Bamidele's actual role and the current status of each project.

Do not invent outcomes or metrics to fill optional fields.

### Service

```typescript
export interface Service {
  slug: string;
  title: string;
  summary: string;
  idealFor: string;
  deliverables: string[];
  outcome: string;
  pricingLabel?: string;
  featured: boolean;
}
```

### Process step

```typescript
export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}
```

### Site configuration

```typescript
export interface SiteConfig {
  name: string;
  headline: string;
  description: string;
  locationLabel: string;
  timeZone: string;
  availabilityLabel: string;
  contactEmail: string;
  whatsappUrl?: string;
  bookingUrl?: string;
  socialLinks: {
    label: string;
    url: string;
  }[];
}
```

Use `Africa/Lagos` for the local clock. Keep availability and contact details configurable.

### Pricing configuration

```typescript
export interface PricingItem {
  serviceSlug: string;
  label: string;
  amount?: number;
  currency?: string;
  description: string;
  visible: boolean;
}
```

Only show numeric prices after they have been confirmed.

## 4. Contact Form Data

### Contact request

```typescript
export interface ContactRequest {
  name: string;
  email: string;
  projectType: string;
  budgetRange: string;
  message: string;
}
```

Validate requests on the server using Zod.

Suggested constraints:

- Name: required, reasonable length limit.
- Email: required, valid format.
- Project type: one of the supported options.
- Budget range: one of the supported options, including an undecided option.
- Message: required, with a reasonable minimum and maximum length.

The client must not be trusted to perform the only validation.

## 5. Contact Processing

Recommended flow:

1. Receive the form request.
2. Validate its structure and values.
3. Apply spam protection and rate limiting.
4. Send the enquiry through the email provider.
5. Return a success response only after the provider confirms acceptance.
6. Return a safe error response if delivery fails.

The server must not return private provider errors or credentials.

Do not log complete messages or unnecessary personal data.

## 6. Optional Enquiry Database

Only introduce persistent enquiry storage if there is a genuine requirement to keep an enquiry history.

An optional model could contain:

```prisma
model ContactEnquiry {
  id          String   @id @default(cuid())
  name        String
  email       String
  projectType String
  budgetRange String
  message     String
  status      String   @default("new")
  createdAt   DateTime @default(now())
}
```

If this is implemented:

- Use a database such as PostgreSQL.
- Add appropriate validation and length limits.
- Restrict database access.
- Define a retention policy.
- Avoid exposing enquiries through public endpoints.
- Apply appropriate access controls to any private viewing interface.
- Keep email delivery independent enough to handle failures clearly.

This database is optional and does not imply building a private admin dashboard in version one.

## 7. Analytics Data

Use a privacy-friendly analytics service rather than storing visitor behavior in a custom database.

Track events such as:

- Hero CTA clicks.
- Work-section clicks.
- Project openings.
- Contact-form starts.
- Successful form submissions.
- Email and WhatsApp clicks.

Do not send form contents or personal contact details to analytics.

## 8. Asset Management

Store project imagery in the project's public assets directory or an appropriate image hosting service.

Organise assets by project.

Use meaningful filenames and provide descriptive alt text.

Do not commit large, unnecessary raw video files to the repository.

## 9. Content Validation

Validate project and service data at development or build time.

Check for:

- Duplicate project slugs.
- Missing required project fields.
- Invalid external URLs.
- Missing cover images.
- Unsupported project statuses.
- Unpublished projects accidentally appearing publicly.

Only published projects should appear on public routes.

## 10. Security

- Keep email API keys server-side.
- Validate contact requests.
- Apply spam protection.
- Avoid storing unnecessary personal data.
- Do not expose internal enquiry records.
- Validate external URLs before rendering links.
- Avoid rendering untrusted HTML.
- Use HTTPS.

## 11. Future Expansion

If the portfolio later requires a CMS, enquiry management, or private administration, evaluate adding a database and authentication at that point.

Do not add a CMS, user accounts, or database-backed project management to version one merely for architectural complexity.

## 12. Acceptance Criteria

- Project content is typed and data-driven.
- Case-study pages are generated from valid project data.
- Unpublished projects remain hidden.
- Contact requests are validated server-side.
- Email credentials remain private.
- Contact enquiries are delivered successfully.
- No database is required for the basic portfolio.
- Any optional persistence has clear security and retention rules.