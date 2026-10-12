import { describe, expect, it } from "vitest";

import {
  getBlockingIssues,
  validateContent,
  type ContentSources,
} from "@/lib/validation/content";
import type { PricingItem, Project, Service } from "@/types";

/**
 * Content rules (TRD section 15: "project data validation").
 *
 * These are the mechanical enforcement of PRD section 8 — the accuracy rules.
 * Each test asserts one rule against a fixture, so a rule that stops working
 * fails here rather than in production.
 */

const NOW = new Date("2026-06-15T09:00:00Z");

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "example-project",
    title: "Example Project",
    summary:
      "A summary that is comfortably longer than the forty character minimum.",
    description: "A longer description of the project used in the case study header.",
    role: "Sole developer",
    stack: ["Next.js"],
    status: "live",
    featured: false,
    published: true,
    ...overrides,
  };
}

function makeService(overrides: Partial<Service> = {}): Service {
  return {
    slug: "example-service",
    title: "Example Service",
    summary: "A summary of the service.",
    idealFor: "Small teams",
    deliverables: ["A deliverable"],
    outcome: "What the client ends up with.",
    contactProjectType: "mvp-web-app",
    featured: false,
    ...overrides,
  };
}

function makePricingItem(overrides: Partial<PricingItem> = {}): PricingItem {
  return {
    serviceSlug: "example-service",
    label: "Example tier",
    description: "A description of the tier.",
    visible: false,
    ...overrides,
  };
}

/** A fixture that passes every rule, so each test fails for one reason only. */
function makeSources(overrides: Partial<ContentSources> = {}): ContentSources {
  return {
    siteConfig: {
      name: "Example Person",
      headline: "A headline",
      description: "A description",
      locationLabel: "Port Harcourt, Nigeria",
      timeZone: "Africa/Lagos",
      availability: {
        status: "available",
        label: "Available",
        detail: "Taking on new work.",
        lastReviewed: "2026-06-05",
      },
      contactEmail: "hello@example.com",
      socialLinks: [],
    },
    projects: [makeProject()],
    services: [makeService()],
    processSteps: [
      { number: "01", title: "One", description: "First" },
      { number: "02", title: "Two", description: "Second" },
      { number: "03", title: "Three", description: "Third" },
      { number: "04", title: "Four", description: "Fourth" },
    ],
    pricingItems: [makePricingItem()],
    ...overrides,
  };
}

const errorsFor = (sources: ContentSources, now: Date = NOW) =>
  getBlockingIssues(validateContent(now, sources));

const pathsFor = (sources: ContentSources, now: Date = NOW) =>
  errorsFor(sources, now).map((issue) => issue.path);

describe("baseline fixture", () => {
  it("passes every rule", () => {
    expect(validateContent(NOW, makeSources())).toEqual([]);
  });
});

describe("placeholder detection", () => {
  it("blocks a build while any TODO marker remains", () => {
    const sources = makeSources({
      projects: [makeProject({ role: "TODO: confirm exact role" })],
    });

    expect(pathsFor(sources)).toContain("root.projects[0].role");
  });

  it("blocks a build on an unresolved value in the site config", () => {
    const sources = makeSources();
    sources.siteConfig.contactEmail = "TODO: confirm email";

    expect(pathsFor(sources)).toContain("root.siteConfig.contactEmail");
  });
});

describe("project rules", () => {
  it("rejects a slug that is not lowercase kebab-case", () => {
    const sources = makeSources({ projects: [makeProject({ slug: "Not_Kebab Case" })] });
    expect(pathsFor(sources)).toContain("projects[0].slug");
  });

  it("rejects a duplicate slug, which would make one case study unreachable", () => {
    const sources = makeSources({
      projects: [makeProject(), makeProject({ title: "Second" })],
    });

    expect(pathsFor(sources)).toContain("projects[1].slug");
  });

  it("rejects an unknown status", () => {
    const sources = makeSources({
      // Cast through unknown: the point is to simulate bad data getting in.
      projects: [makeProject({ status: "shipped" as unknown as Project["status"] })],
    });

    expect(pathsFor(sources)).toContain("projects[0].status");
  });

  it("rejects a project with no technology listed", () => {
    const sources = makeSources({ projects: [makeProject({ stack: [] })] });
    expect(pathsFor(sources)).toContain("projects[0].stack");
  });

  it("warns, rather than fails, when a featured project is not published", () => {
    const sources = makeSources({
      projects: [makeProject({ featured: true, published: false })],
    });

    const issues = validateContent(NOW, sources);
    const featuredIssue = issues.find((issue) => issue.path === "projects[0].featured");

    expect(featuredIssue?.severity).toBe("warning");
    expect(getBlockingIssues(issues).map((issue) => issue.path)).not.toContain(
      "projects[0].featured",
    );
  });

  it("requires alt text once a cover image is set", () => {
    const sources = makeSources({
      projects: [makeProject({ coverImage: "/images/shot.png" })],
    });

    expect(pathsFor(sources)).toContain("projects[0].coverImageAlt");
  });

  it("rejects alt text with no image to describe", () => {
    const sources = makeSources({
      projects: [makeProject({ coverImageAlt: "A screenshot" })],
    });

    expect(pathsFor(sources)).toContain("projects[0].coverImageAlt");
  });

  it("accepts a missing cover image, since fallback art is rendered instead", () => {
    expect(pathsFor(makeSources())).not.toContain("projects[0].coverImageAlt");
  });

  it.each(["javascript:alert(1)", "not-a-url", "ftp://example.com/file"])(
    "rejects the unsafe link %s",
    (url) => {
      const sources = makeSources({ projects: [makeProject({ liveUrl: url })] });
      expect(pathsFor(sources)).toContain("projects[0].liveUrl");
    },
  );

  it("rejects a live URL on a pre-launch project", () => {
    const sources = makeSources({
      projects: [makeProject({ status: "pre-launch", liveUrl: "https://example.com" })],
    });

    expect(pathsFor(sources)).toContain("projects[0].liveUrl");
  });

  it("requires a substantive summary on a published project", () => {
    const sources = makeSources({ projects: [makeProject({ summary: "Too short." })] });
    expect(pathsFor(sources)).toContain("projects[0].summary");
  });

  it("does not require a long summary on an unpublished project", () => {
    const sources = makeSources({
      projects: [makeProject({ summary: "Draft.", published: false })],
    });

    expect(pathsFor(sources)).not.toContain("projects[0].summary");
  });

  it("rejects a project set with nothing published", () => {
    const sources = makeSources({ projects: [makeProject({ published: false })] });
    expect(pathsFor(sources)).toContain("projects");
  });

  it("rejects more than five featured projects", () => {
    const sources = makeSources({
      projects: Array.from({ length: 6 }, (_, index) =>
        makeProject({ slug: `project-${index}`, featured: true }),
      ),
    });

    expect(pathsFor(sources)).toContain("projects");
  });
});

describe("service rules", () => {
  it("rejects a duplicate service slug", () => {
    const sources = makeSources({ services: [makeService(), makeService()] });
    expect(pathsFor(sources)).toContain("services[1].slug");
  });

  it("rejects a service with no deliverables", () => {
    const sources = makeSources({ services: [makeService({ deliverables: [] })] });
    expect(pathsFor(sources)).toContain("services[0].deliverables");
  });

  it("rejects a contact project type that the form does not offer", () => {
    const sources = makeSources({
      services: [
        makeService({
          contactProjectType: "consulting" as unknown as Service["contactProjectType"],
        }),
      ],
    });

    expect(pathsFor(sources)).toContain("services[0].contactProjectType");
  });
});

describe("site configuration rules", () => {
  it("rejects an invalid contact email", () => {
    const sources = makeSources();
    sources.siteConfig.contactEmail = "not-an-email";

    expect(pathsFor(sources)).toContain("siteConfig.contactEmail");
  });

  it("rejects an unsafe WhatsApp URL", () => {
    const sources = makeSources();
    sources.siteConfig.whatsappUrl = "javascript:alert(1)";

    expect(pathsFor(sources)).toContain("siteConfig.whatsappUrl");
  });

  it("rejects an unsafe social link", () => {
    const sources = makeSources();
    sources.siteConfig.socialLinks = [{ label: "Elsewhere", url: "javascript:alert(1)" }];

    expect(pathsFor(sources)).toContain("siteConfig.socialLinks[0].url");
  });

  it("rejects a time zone that is not a valid IANA zone", () => {
    const sources = makeSources();
    sources.siteConfig.timeZone = "Africa/Lagos_typo";

    expect(pathsFor(sources)).toContain("siteConfig.timeZone");
  });

  it("rejects an unparseable availability date", () => {
    const sources = makeSources();
    sources.siteConfig.availability.lastReviewed = "sometime last week";

    expect(pathsFor(sources)).toContain("siteConfig.availability.lastReviewed");
  });

  it("rejects a stale availability claim", () => {
    // The claim is 90 days old against a 60-day limit.
    const sources = makeSources();
    sources.siteConfig.availability.lastReviewed = "2026-03-17";

    expect(pathsFor(sources)).toContain("siteConfig.availability");
  });

  it("accepts an availability claim inside the freshness window", () => {
    const sources = makeSources();
    sources.siteConfig.availability.lastReviewed = "2026-05-20";

    expect(pathsFor(sources)).not.toContain("siteConfig.availability");
  });
});

describe("pricing rules", () => {
  it("rejects a visible price with no amount", () => {
    const sources = makeSources({
      pricingItems: [makePricingItem({ visible: true, currency: "USD" })],
    });

    expect(pathsFor(sources)).toContain("pricing[0].amount");
  });

  it("rejects a visible price with no currency", () => {
    const sources = makeSources({
      pricingItems: [makePricingItem({ visible: true, amount: 2500 })],
    });

    expect(pathsFor(sources)).toContain("pricing[0].currency");
  });

  it("rejects an amount that is zero or negative", () => {
    const sources = makeSources({
      pricingItems: [makePricingItem({ visible: true, amount: 0, currency: "USD" })],
    });

    expect(pathsFor(sources)).toContain("pricing[0].amount");
  });

  it("accepts a fully specified visible price", () => {
    const sources = makeSources({
      pricingItems: [
        makePricingItem({ visible: true, amount: 2500, currency: "USD" }),
      ],
    });

    expect(pathsFor(sources)).toEqual([]);
  });

  it("allows a hidden price with no amount, which is the default posture", () => {
    expect(pathsFor(makeSources())).toEqual([]);
  });

  it("rejects a price attached to a service that does not exist", () => {
    const sources = makeSources({
      pricingItems: [makePricingItem({ serviceSlug: "ghost-service" })],
    });

    expect(pathsFor(sources)).toContain("pricing[0].serviceSlug");
  });
});

describe("process rules", () => {
  it("warns, rather than fails, when the step count is not four", () => {
    const sources = makeSources({ processSteps: [] });
    const issues = validateContent(NOW, sources);
    const stepIssue = issues.find((issue) => issue.path === "processSteps");

    expect(stepIssue?.severity).toBe("warning");
    expect(getBlockingIssues(issues)).toEqual([]);
  });
});

describe("getBlockingIssues", () => {
  it("keeps errors and discards warnings", () => {
    const filtered = getBlockingIssues([
      { path: "a", message: "bad", severity: "error" },
      { path: "b", message: "hmm", severity: "warning" },
    ]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.path).toBe("a");
  });
});

describe("the repository's real content", () => {
  /**
   * These assert the state of the actual data files. They are intentionally
   * written as "the gate is doing its job" rather than "the content is fine",
   * because the content is deliberately incomplete until Bamidele confirms it.
   */

  it("currently blocks a production build, because placeholders remain", () => {
    // When real content lands, this test should be updated to assert the
    // opposite — a passing build. It failing is the signal to do that.
    const issues = getBlockingIssues(validateContent(NOW));
    expect(issues.length).toBeGreaterThan(0);
  });

  it("reports every blocker with a path, so the output is actionable", () => {
    for (const issue of getBlockingIssues(validateContent(NOW))) {
      expect(issue.path).toBeTruthy();
      expect(issue.message).toBeTruthy();
    }
  });

  it("keeps the client-permission project out of every public route", () => {
    const issues = pathsFor({
      ...makeSources(),
      projects: [makeProject({ slug: "next-horizon-hub", published: false })],
    });

    // A private project must not be reported as a problem, only omitted.
    expect(issues).not.toContain("projects[0].published");
  });
});
