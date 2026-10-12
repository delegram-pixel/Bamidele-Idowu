# Freelance Portfolio Website — App Flow

## 1. Primary User Journey

The main journey is:

**Discover → Understand → Trust → Evaluate → Contact**

The website should guide visitors from understanding Bamidele's services to seeing relevant proof and starting a conversation.

## 2. Sitemap

```text
Portfolio
├── Home
│   ├── Hero
│   ├── Services
│   ├── Selected Work
│   ├── About and Teaching
│   ├── Process
│   ├── Pricing
│   ├── Contact
│   └── Footer
├── Work
│   ├── Admission Copilot
│   ├── Iventverse
│   ├── StockSchool
│   └── Next Horizon Hub (if approved)
└── Contact
    ├── Contact Form
    ├── Email
    ├── WhatsApp
    └── Optional Booking Link
```

The main experience is a single-page portfolio. Individual case studies have separate routes.

## 3. Hero Flow

The visitor lands on the homepage.

Display:

- A clear statement of what Bamidele builds.
- A concise supporting sentence.
- Start a Project CTA.
- See My Work CTA.
- Local time.
- Availability indicator.

Actions:

- Start a Project → scrolls to Contact.
- See My Work → scrolls to Selected Work.
- Navigation links → scroll to their corresponding sections.

Animation should reveal the headline without delaying access to the main content.

## 4. Services Flow

The visitor scrolls to Services.

Each service communicates:

- Who it is for.
- What Bamidele delivers.
- The expected outcome.
- A relevant next action.

Selecting a service CTA should take the visitor to Contact and, where possible, preselect the relevant project type.

## 5. Selected Work Flow

```text
Selected Work
    |
    v
Choose Project
    |
    v
View Project Spread
    |
    ├── Project Summary
    ├── Role
    ├── Technology Stack
    ├── Status
    └── View Case Study
             |
             v
        Case Study Page
             |
             ├── Problem
             ├── Approach
             ├── Implementation
             ├── Result / Status
             └── Next Steps
                     |
                     v
                Start a Project
```

Project spreads should feel like editorial showcases, not a generic grid of small cards.

Horizontal movement can be used on desktop where it improves the presentation. Mobile must provide a clear, usable alternative.

## 6. About and Teaching Flow

The visitor reaches the About section after viewing services and work.

Show:

- A concise professional story.
- Development approach.
- JavaScript teaching experience.
- Relevant project imagery.
- A contact CTA.

The section should reinforce trust without turning into a long résumé.

## 7. Process Flow

Present four stages:

1. Discovery — understand the problem and goals.
2. Planning — agree on scope, priorities, and timeline.
3. Build — design, implement, and review the product.
4. Launch — deploy, verify, and agree on any support.

Each step should be short and understandable to non-technical clients.

## 8. Pricing Flow

The visitor sees starting prices or an explanation of the quotation process.

If prices are not yet confirmed, use a transparent message explaining that the quote depends on scope, complexity, and delivery requirements.

Do not publish fabricated prices.

The pricing CTA takes the visitor to Contact.

## 9. Contact Flow

```text
Click Start a Project
        |
        v
Contact Section
        |
        v
Enter Contact Details
        |
        v
Select Project Type
        |
        v
Select Budget Range
        |
        v
Describe Project
        |
        v
Submit
        |
        v
Validate Fields
        |
        ├── Invalid → Show Field Errors
        |
        v
Apply Spam Protection
        |
        ├── Rejected → Show Safe Error
        |
        v
Send Email
        |
        ├── Failed → Show Retry Guidance
        |
        v
Show Confirmation
```

Do not clear the user's entered information when an error occurs.

Also provide direct email and WhatsApp options for visitors who prefer not to use the form.

## 10. Persistent Contact CTA

Keep a clear contact action accessible as visitors scroll.

Requirements:

- Avoid covering important content.
- Work with keyboard navigation.
- Remain usable on small screens.
- Respect reduced-motion preferences.
- Link to the contact section or configured contact destination.

## 11. Footer Flow

Include:

- Social links.
- Location.
- Availability.
- Copyright.
- Email or contact CTA.

All external links should be verified before launch.

## 12. Case Study Routing

Each project should have a unique slug.

Examples:

- `/work/admission-copilot`
- `/work/iventverse`
- `/work/stockschool`

Next Horizon Hub should only receive a public case-study page if permission is granted.

Case-study pages must support direct navigation, refreshes, and shareable metadata.

## 13. Error and Empty States

### Contact failure

Show a useful message and allow the visitor to retry or use direct contact details.

### Missing project

Display a proper not-found page with a link back to the portfolio.

### Missing project image

Use an approved fallback visual without breaking the layout.

### Analytics unavailable

Keep the website fully functional.

### Animation unavailable

Display the content in its normal readable state.

## 14. Motion Flow

- Hero: headline lines enter and settle.
- Scrolling: sections reveal progressively.
- Work: project imagery moves with restrained parallax.
- Project spread: desktop horizontal navigation where appropriate.
- CTA: subtle pointer response on suitable devices.
- Ticker: service categories move slowly between sections.

Motion must never block access to content or interfere with form completion.

## 15. Primary Conversion Path

The most important journey is:

**Hero → Selected Work → Relevant Case Study → Services or Pricing → Contact**

The design should also support direct conversion from the hero and persistent contact CTA.

Measure where visitors click and where they abandon the contact form so the portfolio can be improved after launch.