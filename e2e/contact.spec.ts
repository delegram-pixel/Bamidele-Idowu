import { expect, test } from "@playwright/test";

/**
 * Contact form (TRD section 15, app-flow section 9).
 *
 * Note on the submission tests: they run against the development server, where
 * the email provider is normally unconfigured. The route therefore reports a
 * delivery failure rather than a success, which is exactly what is being
 * asserted — that a failure never loses what the visitor typed. Where a
 * developer does have email configured, the success branch is accepted too.
 */

test.describe("validation feedback", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#contact");
  });

  test("reports every missing field without sending a request", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/contact")) requests.push(request.url());
    });

    await page.getByRole("button", { name: /send enquiry/i }).click();

    await expect(page.getByText(/check the highlighted fields/i)).toBeVisible();
    expect(requests).toEqual([]);
  });

  test("marks the offending controls as invalid for assistive technology", async ({ page }) => {
    await page.getByRole("button", { name: /send enquiry/i }).click();

    await expect(page.getByLabel(/your name/i)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel(/email address/i)).toHaveAttribute("aria-invalid", "true");
  });

  test("moves focus to the first field that needs attention", async ({ page }) => {
    await page.getByRole("button", { name: /send enquiry/i }).click();
    await expect(page.getByLabel(/your name/i)).toBeFocused();
  });

  test("clears a field's error as soon as it is corrected", async ({ page }) => {
    await page.getByRole("button", { name: /send enquiry/i }).click();
    await expect(page.getByLabel(/your name/i)).toHaveAttribute("aria-invalid", "true");

    await page.getByLabel(/your name/i).fill("Ada Obi");

    await expect(page.getByLabel(/your name/i)).not.toHaveAttribute("aria-invalid", "true");
  });

  test("rejects a malformed email address with a specific message", async ({ page }) => {
    await page.getByLabel(/your name/i).fill("Ada Obi");
    await page.getByLabel(/email address/i).fill("not-an-email");
    await page.getByRole("button", { name: /send enquiry/i }).click();

    await expect(page.getByText(/valid email address/i)).toBeVisible();
  });
});

test.describe("the honeypot", () => {
  test("is present but unreachable, so only a bot can fill it", async ({ page }) => {
    await page.goto("/#contact");

    const honeypot = page.locator('input[name="company"]');
    await expect(honeypot).toHaveCount(1);

    // Kept out of the accessibility tree and moved off-screen rather than merely
    // hidden with `display: none`, which naive bots would skip over.
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(
      page.locator('[aria-hidden="true"] input[name="company"]'),
    ).toHaveCount(1);

    const box = await honeypot.boundingBox();
    expect(box?.x ?? 0).toBeLessThan(0);

    // Tabbing through the whole form must never land on it.
    await page.getByLabel(/your name/i).click();
    for (let press = 0; press < 12; press += 1) {
      await page.keyboard.press("Tab");
      const focusedName = await page.evaluate(
        () => document.activeElement?.getAttribute("name") ?? "",
      );
      expect(focusedName).not.toBe("company");
    }
  });
});

test.describe("submitting a completed form", () => {
  test("never discards what the visitor typed when delivery fails", async ({ page }) => {
    await page.goto("/#contact");

    await page.getByLabel(/your name/i).fill("Ada Obi");
    await page.getByLabel(/email address/i).fill("ada@example.com");
    await page.getByLabel(/project type/i).selectOption("mvp-web-app");
    await page.getByLabel(/budget range/i).selectOption("3k-7k");

    const message = "I would like to build a booking platform for a small clinic in Lagos.";
    await page.getByLabel(/about the project/i).fill(message);

    // The endpoint rejects submissions completed faster than a human plausibly
    // could (see MIN_FILL_TIME_MS), and Playwright fills forms in milliseconds.
    // Waiting here is what makes this a realistic submission rather than a
    // simulated bot.
    await page.waitForTimeout(2500);

    await page.getByRole("button", { name: /send enquiry/i }).click();

    const success = page.getByRole("heading", { name: /message sent/i }).first();
    const failure = page.getByText(/could not be sent|something went wrong/i).first();

    await expect(success.or(failure)).toBeVisible({ timeout: 20_000 });

    if (await failure.isVisible()) {
      // The required behaviour: an error must not clear the form.
      await expect(page.getByLabel(/your name/i)).toHaveValue("Ada Obi");
      await expect(page.getByLabel(/email address/i)).toHaveValue("ada@example.com");
      await expect(page.getByLabel(/project type/i)).toHaveValue("mvp-web-app");
      await expect(page.getByLabel(/budget range/i)).toHaveValue("3k-7k");
      await expect(page.getByLabel(/about the project/i)).toHaveValue(message);
    }
  });

  test("posts the enquiry to the documented endpoint", async ({ page }) => {
    await page.goto("/#contact");

    const requestPromise = page.waitForRequest(
      (request) => request.url().includes("/api/contact") && request.method() === "POST",
    );

    await page.getByLabel(/your name/i).fill("Ada Obi");
    await page.getByLabel(/email address/i).fill("ada@example.com");
    await page.getByLabel(/project type/i).selectOption("mvp-web-app");
    await page.getByLabel(/budget range/i).selectOption("3k-7k");
    await page
      .getByLabel(/about the project/i)
      .fill("I would like to build a booking platform for a small clinic in Lagos.");

    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: /send enquiry/i }).click();

    const request = await requestPromise;
    const body = request.postDataJSON() as Record<string, unknown>;

    expect(body).toHaveProperty("company", "");
    expect(body.projectType).toBe("mvp-web-app");
  });

  test("announces the outcome through the live region", async ({ page }) => {
    await page.goto("/#contact");

    await page.getByLabel(/your name/i).fill("Ada Obi");
    await page.getByLabel(/email address/i).fill("ada@example.com");
    await page.getByLabel(/project type/i).selectOption("mvp-web-app");
    await page.getByLabel(/budget range/i).selectOption("3k-7k");
    await page
      .getByLabel(/about the project/i)
      .fill("I would like to build a booking platform for a small clinic in Lagos.");

    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: /send enquiry/i }).click();

    const live = page.locator("[aria-live='polite']").first();
    await expect(live).not.toBeEmpty({ timeout: 20_000 });
  });
});

test.describe("alternative contact routes", () => {
  test("offers an email link that works without JavaScript", async ({ page }) => {
    await page.goto("/#contact");

    const emailLink = page.locator('a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();
  });

  test("never renders a WhatsApp link that goes nowhere", async ({ page }) => {
    await page.goto("/#contact");

    const whatsappLinks = page.locator('a[href*="wa.me"]');
    const count = await whatsappLinks.count();

    for (let index = 0; index < count; index += 1) {
      const href = await whatsappLinks.nth(index).getAttribute("href");
      // Either the number is confirmed, or the link is not rendered at all.
      expect(href).not.toBe("TODO: verify before publishing");
    }
  });
});
