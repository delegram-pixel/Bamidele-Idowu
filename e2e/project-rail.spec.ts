import { expect, test } from "@playwright/test";

/**
 * Horizontal case-study rail (design-brief section 9, TRD section 6).
 *
 * The design brief asks for a cinematic horizontal experience but warns against
 * scroll hijacking and against horizontal sections that trap mobile users. The
 * implementation is a native scroller, and these tests assert the consequences
 * of that choice rather than the mechanism.
 */

const RAIL = /selected projects/i;

test.describe("on desktop", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "The rail only exists from lg upward.");
    await page.goto("/");
    await page.locator("#work").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
  });

  test("lays the projects out as a horizontally scrollable rail", async ({ page }) => {
    const rail = page.getByRole("list", { name: RAIL });

    const metrics = await rail.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));

    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
  });

  test("moves between projects with the arrow keys, once focused", async ({ page }) => {
    const rail = page.getByRole("list", { name: RAIL });
    await rail.focus();

    const before = await rail.evaluate((element) => element.scrollLeft);
    await page.keyboard.press("ArrowRight");

    await expect
      .poll(async () => rail.evaluate((element) => element.scrollLeft), { timeout: 5000 })
      .toBeGreaterThan(before);
  });

  test("moves between projects with the next control", async ({ page }) => {
    const rail = page.getByRole("list", { name: RAIL });

    const before = await rail.evaluate((element) => element.scrollLeft);
    await page.getByRole("button", { name: "Next project" }).click();

    await expect
      .poll(async () => rail.evaluate((element) => element.scrollLeft), { timeout: 5000 })
      .toBeGreaterThan(before);
  });

  test("returns to the first project with the Home key", async ({ page }) => {
    const rail = page.getByRole("list", { name: RAIL });
    await rail.focus();

    await page.keyboard.press("ArrowRight");
    await expect
      .poll(async () => rail.evaluate((element) => element.scrollLeft), { timeout: 5000 })
      .toBeGreaterThan(0);

    await page.keyboard.press("Home");
    await expect
      .poll(async () => rail.evaluate((element) => element.scrollLeft), { timeout: 5000 })
      .toBe(0);
  });

  test("keeps the previous control focusable while it is unavailable", async ({ page }) => {
    const previous = page.getByRole("button", { name: "Previous project" });

    // `aria-disabled` rather than `disabled`, so the control does not vanish from
    // the tab sequence as the visitor reaches the start of the list.
    await expect(previous).toHaveAttribute("aria-disabled", "true");
    await previous.focus();
    await expect(previous).toBeFocused();
  });

  test("is reachable by keyboard from the page", async ({ page }) => {
    const rail = page.getByRole("list", { name: RAIL });
    await rail.focus();
    await expect(rail).toBeFocused();
  });

  test("lists every published project and nothing withheld", async ({ page }) => {
    const rail = page.getByRole("list", { name: RAIL });

    for (const slug of ["admission-copilot", "iventverse", "stockschool"]) {
      await expect(rail.locator(`a[href="/work/${slug}"]`).first()).toBeAttached();
    }

    // Held back pending written client permission (PRD section 8).
    await expect(page.locator('a[href="/work/next-horizon-hub"]')).toHaveCount(0);
  });
});

test.describe("on mobile", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Only meaningful at a narrow viewport.");
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
  });

  test("stacks the projects vertically instead of hiding them in a rail", async ({ page }) => {
    const rail = page.getByRole("list", { name: RAIL });

    const metrics = await rail.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));

    // A narrow viewport gets the readable layout, not a cramped copy of the
    // desktop one — so there is nothing to scroll sideways.
    expect(metrics.scrollWidth - metrics.clientWidth).toBeLessThanOrEqual(1);
  });

  test("hides the rail controls, which would page nothing", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Next project" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Previous project" })).toBeHidden();
  });

  test("shows each project without horizontal scrolling", async ({ page }) => {
    const rail = page.getByRole("list", { name: RAIL });

    for (const slug of ["admission-copilot", "iventverse", "stockschool"]) {
      await expect(rail.locator(`a[href="/work/${slug}"]`).first()).toBeVisible();
    }
  });

  test("never traps vertical scrolling inside the list", async ({ page }) => {
    // The rail must not intercept touch gestures, so the page keeps scrolling to
    // the footer past it.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.locator("footer")).toBeInViewport({ timeout: 5000 });
  });
});
