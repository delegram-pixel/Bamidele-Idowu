import { expect, test } from "@playwright/test";

/**
 * Dedicated contact page.
 *
 * The homepage keeps its own compact contact section, so these tests cover only
 * what is unique to the standalone route: the invitation itself, the way back
 * to the portfolio, and the bridge to the form below the fold.
 */
test.describe("let's talk page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("presents the invitation as the page heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /want to start a new project/i,
      }),
    ).toBeVisible();

    await expect(page.getByText(/or just say hello/i)).toBeVisible();
  });

  test("offers a working email route and no dead social links", async ({ page }) => {
    const emailLink = page.locator('a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute("href", /^mailto:/);

    const socialLinks = page.locator('a[target="_blank"]');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const href = await socialLinks.nth(index).getAttribute("href");
      expect(href).toMatch(/^https:\/\//);
      expect(href).not.toContain("TODO");
    }
  });

  test("closes back to the portfolio", async ({ page }) => {
    await page.getByRole("link", { name: /close and return/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("leads from the splash to the full form", async ({ page }) => {
    await page.getByRole("link", { name: /or write it down/i }).click();
    await expect(page.locator("#write")).toBeInViewport();
    await expect(page.getByLabel(/your name/i)).toBeVisible();
  });
});
