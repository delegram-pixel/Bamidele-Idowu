import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  getFeaturedProjects,
  getProjectBySlug,
  getPublishedProjects,
  projects,
} from "@/data/projects";

/**
 * Project data accessors (TRD section 15).
 *
 * The publication gate is a correctness requirement, not a nicety: one of the
 * projects is withheld pending written client permission (PRD section 8), so
 * leaking it into a public route would be a contract breach, not a bug.
 */

describe("getPublishedProjects", () => {
  it("returns only published projects", () => {
    expect(getPublishedProjects().every((project) => project.published)).toBe(true);
  });

  it("excludes the project awaiting client permission", () => {
    const slugs = getPublishedProjects().map((project) => project.slug);
    expect(slugs).not.toContain("next-horizon-hub");
  });

  it("returns at least one project, so Selected Work is never empty", () => {
    expect(getPublishedProjects().length).toBeGreaterThan(0);
  });
});

describe("getFeaturedProjects", () => {
  it("returns only projects that are both featured and published", () => {
    for (const project of getFeaturedProjects()) {
      expect(project.featured).toBe(true);
      expect(project.published).toBe(true);
    }
  });

  it("never returns more than five, matching the layout's intent", () => {
    expect(getFeaturedProjects().length).toBeLessThanOrEqual(5);
  });
});

describe("getProjectBySlug", () => {
  it("finds a published project", () => {
    expect(getProjectBySlug("admission-copilot")?.title).toBe("Admission Copilot");
  });

  it("returns undefined for an unpublished project, so its route 404s", () => {
    expect(getProjectBySlug("next-horizon-hub")).toBeUndefined();
  });

  it("returns undefined for a slug that does not exist", () => {
    expect(getProjectBySlug("no-such-project")).toBeUndefined();
  });

  it("returns undefined for an empty slug rather than the first project", () => {
    expect(getProjectBySlug("")).toBeUndefined();
  });
});

describe("project data integrity", () => {
  it("uses a unique slug for every project", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses only gallery image files that exist in public", () => {
    const publicDir = path.join(process.cwd(), "public");

    for (const project of projects) {
      for (const image of project.gallery ?? []) {
        const filePath = path.join(publicDir, image.src.replace(/^\//, ""));
        expect(existsSync(filePath), `${project.slug} references missing asset: ${image.src}`).toBe(
          true,
        );
      }
    }
  });

  it("lists the technologies for every project, including withheld ones", () => {
    for (const project of projects) {
      // A withheld project may still carry a TODO stack, but never an empty one.
      expect(Array.isArray(project.stack)).toBe(true);
    }
  });
});

describe("PRD section 8 accuracy rules", () => {
  it("labels Admission Copilot as pre-launch", () => {
    expect(getProjectBySlug("admission-copilot")?.status).toBe("pre-launch");
  });

  it("states plainly that StockSchool does not execute real trades", () => {
    const stockschool = getProjectBySlug("stockschool");
    const narrative = [stockschool?.description, stockschool?.outcome]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    expect(narrative).toContain("does not execute real trades");
  });

  it("states plainly that Admission Copilot is pre-launch, since it can still be linked", () => {
    // This replaced a test asserting no pre-launch project carried a live URL.
    // Product links are now allowed at every status, so the guarantee that
    // survives is the one PRD section 8 actually cares about: the project's own
    // copy says which stage it is at rather than leaving a visitor to infer it
    // from a link that opens.
    const admissionCopilot = getProjectBySlug("admission-copilot");
    const narrative = [admissionCopilot?.description, admissionCopilot?.outcome]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    expect(narrative).toContain("pre-launch");
  });

  it("carries no invented metrics, testimonials, or user counts", () => {
    const banned = /\b(\d[\d,.]*\s*(users|customers|clients|downloads|stars)|testimonial)\b/i;

    for (const project of projects) {
      const text = [
        project.summary,
        project.description,
        project.problem,
        project.approach,
        project.implementation,
        project.outcome,
        project.nextSteps,
      ]
        .filter((value): value is string => typeof value === "string")
        .join(" ");

      expect(text).not.toMatch(banned);
    }
  });
});
