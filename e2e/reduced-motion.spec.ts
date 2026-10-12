import { expect, test, type Page } from "@playwright/test";

/**
 * Reduced-motion experience (TRD section 15, design-brief section 11).
 *
 * The failure this file exists to catch is the classic one: an entrance
 * animation that never runs leaves its content at `opacity: 0`, so a visitor who
 * asked for less motion gets a blank page instead of a calmer one.
 *
 * Note that Playwright's `toBeVisible()` deliberately ignores opacity, so every
 * assertion about content actually being readable here is made against computed
 * opacity rather than visibility.
 */

test.use({ reducedMotion: "reduce" });

/**
 * Opacity of an element multiplied by every ancestor's.
 *
 * An element's own opacity can be 1 while an animated wrapper above it is still
 * at 0, which is exactly the bug this file is looking for — so the whole chain
 * is walked rather than just the element.
 */
async function effectiveOpacity(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((element) => {
    let node: HTMLElement | null = element as HTMLElement;
    let opacity = 1;

    while (node) {
      opacity *= Number(getComputedStyle(node).opacity);
      node = node.parentElement;
    }

    return opacity;
  });
}

test.describe("when the visitor has asked for reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("confirms the preference is actually being applied by the browser", async ({ page }) => {
    // Without this, the rest of the file could pass for the wrong reason.
    const prefersReduced = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    expect(prefersReduced).toBe(true);
  });

  test("shows the headline immediately, at full opacity", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });

    await expect(heading).toBeVisible();
    await expect(heading).toBeInViewport();
    await expect(heading).toContainText(/i build web/i);

    expect(await effectiveOpacity(page, "h1")).toBe(1);
  });

  test("leaves nothing on screen stranded at zero opacity", async ({ page }) => {
    const offenders = await page.evaluate(() => {
      const found: string[] = [];

      const effective = (element: HTMLElement) => {
        let node: HTMLElement | null = element;
        let opacity = 1;
        while (node) {
          opacity *= Number(getComputedStyle(node).opacity);
          node = node.parentElement;
        }
        return opacity;
      };

      for (const element of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
        if (!element.textContent?.trim()) continue;
        if (element.closest('[aria-hidden="true"]')) continue;

        const rect = element.getBoundingClientRect();
        const onScreen =
          rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
        if (!onScreen) continue;

        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (effective(element) === 0) found.push(element.className || element.tagName);
      }

      return found;
    });

    expect(offenders).toEqual([]);
  });

  test("switches CSS animations off or reduces them to a single frame", async ({ page }) => {
    const durations = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("*"))
        .map((element) => getComputedStyle(element))
        .filter((style) => style.animationName !== "none")
        .map((style) => style.animationDuration),
    );

    for (const duration of durations) {
      // Either stopped entirely, or cut to the near-instant 0.01ms technique.
      // Anything measured in whole seconds is a marquee still running.
      expect(duration === "0s" || parseFloat(duration) <= 0.02).toBe(true);
    }
  });

  test("brings each section into view at full opacity as it is reached", async ({ page }) => {
    for (const id of ["services", "work", "about", "process", "contact"]) {
      const section = page.locator(`#${id}`);

      await section.evaluate((element) => {
        element.scrollIntoView({ block: "start" });
      });

      // Settle, then check the content is genuinely readable rather than merely
      // present in the DOM.
      await expect
        .poll(() => effectiveOpacity(page, `#${id} h2, #${id} h3`), { timeout: 5000 })
        .toBe(1);
    }
  });

  test("still responds to navigation", async ({ page }) => {
    await page.getByRole("link", { name: /see my work/i }).click();
    await expect(page.locator("#work")).toBeInViewport();
  });

  test("does not scroll sideways", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );

    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps the custom cursor out of the way", async ({ page }) => {
    // The decorative cursor is disabled under reduced motion and for imprecise
    // pointers. The real cursor is never hidden, so the page stays usable either
    // way.
    const bodyCursor = await page.evaluate(() => getComputedStyle(document.body).cursor);
    expect(bodyCursor).not.toBe("none");
  });
});

test.describe("case studies under reduced motion", () => {
  test("render their content without waiting on an entrance animation", async ({ page }) => {
    await page.goto("/work/stockschool");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("StockSchool");
    await expect(page.getByText(/does not execute real trades/i).first()).toBeVisible();
    expect(await effectiveOpacity(page, "h1")).toBe(1);
  });
});
