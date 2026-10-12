import { expect, test } from "@playwright/test";

/**
 * Homepage navigation and hero behaviour (TRD section 15).
 *
 * These run against the development server, so they must pass with placeholder
 * content in place. Nothing here asserts on copy that is still awaiting
 * confirmation — only on structure and behaviour.
 */

test.describe("the homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders a single h1 that states what the site is for", async ({ page }) => {
    const headings = page.getByRole("heading", { level: 1 });

    await expect(headings).toHaveCount(1);
    await expect(headings).toContainText(/i build web/i);
  });

  test("puts the availability status above the fold", async ({ page }) => {
    // The PRD requires a visitor to see whether work is being taken on without
    // scrolling. The indicator is text, not a colour-only dot.
    await expect(page.getByText(/available|limited|not available/i).first()).toBeInViewport();
  });

  test("shows the local time as a real time once hydration completes", async ({ page }) => {
    // The server sends a placeholder and the client fills it in, so this waits
    // for the filled value rather than asserting on the placeholder.
    await expect(page.getByText(/^\d{2}:\d{2}:\d{2}$/).first()).toBeVisible();
  });

  test("exposes every navigation target the anchor links point at", async ({ page }) => {
    for (const id of ["services", "work", "about", "process", "contact"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("publishes structured data limited to verifiable facts", async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? "[]") as Array<Record<string, unknown>>;

    expect(Array.isArray(data)).toBe(true);

    const person = data.find((entry) => entry["@type"] === "Person");
    expect(person).toBeDefined();

    // No aggregateRating, no invented credentials, no awards.
    const serialised = JSON.stringify(data);
    expect(serialised).not.toMatch(/aggregateRating|award|reviewCount/i);
  });
});

test.describe("desktop navigation", () => {
  test("jumps to the section a nav item names", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "The desktop nav is hidden below md.");

    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "Work",
    }).click();

    await expect(page.locator("#work")).toBeInViewport();
  });

  test("marks the section currently in view without relying on colour alone", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "The desktop nav is hidden below md.");

    await page.goto("/");
    // Deterministic placement: the section's top is brought to the top of the
    // viewport, which is where the observer's active band sits.
    await page.locator("#about").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });

    // `aria-current` is the machine-readable signal; the underline is decorative.
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "true", { timeout: 5000 });
  });
});

test.describe("hero calls to action", () => {
  test("takes the visitor to the contact section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Start a Project" }).first().click();

    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("takes the visitor to the work section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /see my work/i }).click();

    await expect(page.locator("#work")).toBeInViewport();
  });

  test("uses real anchors, so the links work before JavaScript hydrates", async ({ page }) => {
    await page.goto("/");

    const href = await page.getByRole("link", { name: /see my work/i }).getAttribute("href");
    expect(href).toBe("#work");
  });
});

test.describe("keyboard access", () => {
  test("offers a skip link as the first focusable element", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeInViewport();
  });

  test("keeps the primary content reachable by scrolling, without a scroll trap", async ({
    page,
  }) => {
    await page.goto("/");

    // Scrolling to the bottom must work normally: nothing may intercept it.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.locator("footer")).toBeInViewport({ timeout: 5000 });
  });
});
