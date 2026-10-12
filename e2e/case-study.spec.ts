import { expect, test } from "@playwright/test";

/**
 * Case-study routes (TRD section 15, app-flow section 12).
 *
 * The most important test in this file is the one asserting that a project
 * withheld pending client permission is not reachable at all. A leak there is a
 * contract breach, not a cosmetic bug.
 */

test.describe("a published case study", () => {
  test("renders the project as the page's heading", async ({ page }) => {
    await page.goto("/work/admission-copilot");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Admission Copilot");
  });

  test("sets a page title that names the project", async ({ page }) => {
    await page.goto("/work/admission-copilot");
    await expect(page).toHaveTitle(/admission copilot/i);
  });

  test("states the pre-launch stage rather than implying the product is live", async ({
    page,
  }) => {
    await page.goto("/work/admission-copilot");

    // PRD section 8: a pre-launch product must be labelled as such.
    await expect(page.getByText(/pre-launch/i).first()).toBeVisible();
  });

  test("offers a route back to the rest of the work", async ({ page }) => {
    await page.goto("/work/admission-copilot");

    // Located by destination rather than by label: the wording of this link is
    // a copy decision, while the destination is behaviour.
    const backLink = page.locator('a[href*="#work"]').first();
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page).toHaveURL(/#work$/);
  });

  test("renders without a cover image, using the fallback art instead of a broken image", async ({
    page,
  }) => {
    const failures: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400) failures.push(response.url());
    });

    await page.goto("/work/admission-copilot");

    expect(failures.filter((url) => /\.(png|jpe?g|webp|avif)$/i.test(url))).toEqual([]);
  });
});

test.describe("the StockSchool case study", () => {
  test("says plainly that no real trades are executed", async ({ page }) => {
    await page.goto("/work/stockschool");

    // PRD section 8 requires this to be unambiguous.
    await expect(page.getByText(/does not execute real trades/i).first()).toBeVisible();
  });
});

test.describe("routes that must not exist", () => {
  test("returns 404 for a project awaiting client permission", async ({ page }) => {
    const response = await page.goto("/work/next-horizon-hub");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Next Horizon Hub");
  });

  test("returns 404 for a slug that was never a project", async ({ page }) => {
    const response = await page.goto("/work/nonexistent-project");
    expect(response?.status()).toBe(404);
  });

  test("keeps the 404 page out of search results but followable", async ({ page }) => {
    await page.goto("/work/nonexistent-project");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("offers a way back from the 404 page", async ({ page }) => {
    await page.goto("/work/nonexistent-project");

    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
    await homeLink.click();

    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("reaching a case study from the homepage", () => {
  test("opens the case study and returns without losing the visitor", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();

    // Located by destination: the wording of the link is a copy decision.
    await page.locator('a[href="/work/admission-copilot"]').first().click();

    await expect(page).toHaveURL(/\/work\/admission-copilot$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Admission Copilot");

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });
});
