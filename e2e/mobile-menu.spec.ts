import { expect, test } from "@playwright/test";

/**
 * Mobile navigation disclosure (TRD section 15).
 *
 * The panel is a plain disclosure: it hides nothing from assistive technology
 * that it shows visually, closes on Escape, and returns focus to the toggle. It
 * is also the one place where an accidental scroll lock would be genuinely
 * disruptive, so that is asserted too.
 */

test.describe("the mobile menu", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "The mobile panel only exists below md.");
    await page.goto("/");
  });

  test("is closed and marked as such on first load", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /open menu/i });

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mobile-nav")).toBeHidden();
  });

  test("opens on activation and reports its state", async ({ page }) => {
    await page.getByRole("button", { name: /open menu/i }).click();

    const toggle = page.getByRole("button", { name: /close menu/i });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-nav")).toBeVisible();
  });

  test("points aria-controls at the panel it toggles", async ({ page }) => {
    const controls = await page
      .getByRole("button", { name: /open menu/i })
      .getAttribute("aria-controls");

    expect(controls).toBe("mobile-nav");
    await expect(page.locator(`#${controls}`)).toHaveCount(1);
  });

  test("lists every navigation target", async ({ page }) => {
    await page.getByRole("button", { name: /open menu/i }).click();
    const panel = page.locator("#mobile-nav");

    for (const label of ["Work", "Services", "About", "Process", "Contact"]) {
      await expect(panel.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("closes when Escape is pressed", async ({ page }) => {
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.locator("#mobile-nav")).toBeHidden();
    await expect(page.getByRole("button", { name: /open menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("closes after a destination is chosen, so the panel is not left in the way", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.locator("#mobile-nav").getByRole("link", { name: "Services", exact: true }).click();

    await expect(page.locator("#mobile-nav")).toBeHidden();
    await expect(page.locator("#services")).toBeInViewport();
  });

  test("locks background scrolling while open, and releases it on close", async ({ page }) => {
    const bodyOverflow = () => page.evaluate(() => document.body.style.overflow);

    await page.getByRole("button", { name: /open menu/i }).click();
    await expect.poll(bodyOverflow).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect.poll(bodyOverflow).toBe("");
  });
});

test.describe("mobile layout", () => {
  test("never scrolls sideways", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Only meaningful at a narrow viewport.");

    await page.goto("/");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );

    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps the headline inside the viewport at 393px wide", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Only meaningful at a narrow viewport.");

    // Set the width explicitly rather than inheriting the device descriptor.
    // The assertion below is against a fixed 393px, and the `mobile` project is
    // a Pixel 7 (412px) — so relying on the descriptor made this test compare a
    // 412px layout against a 393px bound and fail on its box model alone,
    // whatever the CSS said. Pinning the viewport is what makes the name of the
    // test true.
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");

    const box = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(393);
  });
});
