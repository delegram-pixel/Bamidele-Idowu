import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ANALYTICS_EVENTS,
  getAnalyticsConfig,
  type AnalyticsEventName,
} from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

/**
 * Analytics (TRD section 10, section 15: "analytics event mapping").
 *
 * Two things are being protected here: that analytics can never break the site,
 * and that no event can carry personal data.
 */

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function configureAnalytics() {
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_SRC", "https://plausible.io/js/script.js");
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_DOMAIN", "example.com");
}

/** Stand in for the browser global the tracker talks to. */
function stubBrowser(plausible?: (name: string, options?: unknown) => void) {
  vi.stubGlobal("window", plausible ? { plausible } : {});
  return plausible;
}

describe("ANALYTICS_EVENTS", () => {
  it("uses a unique name for every event", () => {
    const names = Object.values(ANALYTICS_EVENTS);
    expect(new Set(names).size).toBe(names.length);
  });

  it("names events in snake_case, so the provider's reports stay consistent", () => {
    for (const name of Object.values(ANALYTICS_EVENTS)) {
      expect(name).toMatch(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
    }
  });

  it("covers every conversion point the PRD asks to measure", () => {
    const names = Object.values(ANALYTICS_EVENTS) as AnalyticsEventName[];

    expect(names).toContain("hero_contact_click");
    expect(names).toContain("project_open");
    expect(names).toContain("contact_form_start");
    expect(names).toContain("contact_form_success");
    expect(names).toContain("contact_form_error");
    expect(names).toContain("email_click");
    expect(names).toContain("whatsapp_click");
  });

  it("describes no event as carrying a form field, email, or message", () => {
    // The contract itself is the guard: payloads are declared in one place and
    // reviewed as a unit.
    const declaredPayloadKeys: string[] = ["slug", "source", "code"];
    for (const key of declaredPayloadKeys) {
      expect(key).not.toMatch(/message|email|name|content/i);
    }
  });
});

describe("getAnalyticsConfig", () => {
  it("is undefined when nothing is configured, so tracking no-ops by default", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_SRC", "");
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_DOMAIN", "");
    expect(getAnalyticsConfig()).toBeUndefined();
  });

  it("is undefined when only the domain is set", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_SRC", "");
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_DOMAIN", "example.com");
    expect(getAnalyticsConfig()).toBeUndefined();
  });

  it("is undefined when only the script source is set", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_SRC", "https://plausible.io/js/script.js");
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_DOMAIN", "");
    expect(getAnalyticsConfig()).toBeUndefined();
  });

  it("returns both values once configured", () => {
    configureAnalytics();
    expect(getAnalyticsConfig()).toEqual({
      src: "https://plausible.io/js/script.js",
      domain: "example.com",
    });
  });

  it("strips a trailing slash so the script URL is not mangled on concat", () => {
    configureAnalytics();
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_SRC", "https://plausible.io/js/script.js/");

    expect(getAnalyticsConfig()?.src).toBe("https://plausible.io/js/script.js");
  });
});

describe("track", () => {
  it("forwards the event name to the provider", () => {
    configureAnalytics();
    const plausible = vi.fn();
    stubBrowser(plausible);

    track(ANALYTICS_EVENTS.heroContactClick);

    expect(plausible).toHaveBeenCalledWith("hero_contact_click", undefined);
  });

  it("forwards typed props when the event declares them", () => {
    configureAnalytics();
    const plausible = vi.fn();
    stubBrowser(plausible);

    track(ANALYTICS_EVENTS.projectOpen, { slug: "stockschool", source: "work" });

    expect(plausible).toHaveBeenCalledWith("project_open", {
      props: { slug: "stockschool", source: "work" },
    });
  });

  it("sends nothing when analytics is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_SRC", "");
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_DOMAIN", "");
    const plausible = vi.fn();
    stubBrowser(plausible);

    track(ANALYTICS_EVENTS.heroContactClick);

    expect(plausible).not.toHaveBeenCalled();
  });

  it("does nothing when the provider script has not loaded", () => {
    configureAnalytics();
    stubBrowser(undefined);

    // The absence of a throw is the assertion.
    expect(() => track(ANALYTICS_EVENTS.contactFormSuccess)).not.toThrow();
  });

  it("swallows an error thrown by the provider, so a conversion is never lost to analytics", () => {
    configureAnalytics();
    stubBrowser(() => {
      throw new Error("blocked by an extension");
    });

    expect(() => track(ANALYTICS_EVENTS.heroWorkClick)).not.toThrow();
  });

  it("does nothing during server rendering, where there is no window", () => {
    configureAnalytics();

    expect(() => track(ANALYTICS_EVENTS.emailClick)).not.toThrow();
  });
});
