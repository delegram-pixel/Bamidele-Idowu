import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/contact/ContactForm";

/**
 * Contact form behaviour (app-flow section 9, PRD section 7.7).
 *
 * The requirement these tests exist for: **"Do not clear the user's entered
 * information when an error occurs."** Losing a long message because the
 * provider was briefly down is the single most damaging failure this form has,
 * so it is asserted directly.
 */

const VALID_VALUES = {
  name: "Ada Obi",
  email: "ada@example.com",
  projectType: "mvp-web-app",
  budgetRange: "3k-7k",
  message: "I would like to build a booking platform for a small clinic in Lagos.",
};

function fillForm(values: Partial<typeof VALID_VALUES> = {}) {
  const merged = { ...VALID_VALUES, ...values };

  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: merged.name } });
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: merged.email },
  });
  fireEvent.change(screen.getByLabelText(/project type/i), {
    target: { value: merged.projectType },
  });
  fireEvent.change(screen.getByLabelText(/budget range/i), {
    target: { value: merged.budgetRange },
  });
  fireEvent.change(screen.getByLabelText(/about the project/i), {
    target: { value: merged.message },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /send enquiry/i }));
}

beforeEach(() => {
  // Analytics is unconfigured in tests, so `track` no-ops. Stub fetch anyway so
  // no test can reach the network by accident.
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("rendering", () => {
  it("labels every control, so nothing is announced as an unlabelled field", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/budget range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/about the project/i)).toBeInTheDocument();
  });

  it("keeps the honeypot out of the accessibility tree and the tab order", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector<HTMLInputElement>('input[name="company"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot?.tabIndex).toBe(-1);
    expect(honeypot?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("has a live region present before anything goes wrong", () => {
    const { container } = render(<ContactForm />);
    expect(container.querySelector("[aria-live='polite']")).not.toBeNull();
  });
});

describe("validation", () => {
  it("does not call the API when the form is empty", () => {
    render(<ContactForm />);
    submit();

    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows a message for each invalid field and marks it invalid", async () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "A" } });
    submit();

    const name = screen.getByLabelText(/your name/i);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription(/at least 2 characters/i);
    expect(screen.getByText(/check the highlighted fields/i)).toBeInTheDocument();
  });

  it("clears a field's error as soon as it is corrected", () => {
    render(<ContactForm />);
    submit();

    expect(screen.getByLabelText(/your name/i)).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Ada Obi" } });

    expect(screen.getByLabelText(/your name/i)).not.toHaveAttribute("aria-invalid");
  });

  it("points the message field's description at both the hint and the error", () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/project type/i), {
      target: { value: "mvp-web-app" },
    });
    fireEvent.change(screen.getByLabelText(/budget range/i), { target: { value: "3k-7k" } });
    fireEvent.change(screen.getByLabelText(/about the project/i), { target: { value: "short" } });
    submit();

    expect(screen.getByLabelText(/about the project/i)).toHaveAccessibleDescription(
      /at least 30 characters/i,
    );
  });
});

describe("a server-side failure", () => {
  it("keeps every value the visitor typed", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          code: "delivery_failed",
          message: "Your message could not be sent just now.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<ContactForm />);
    fillForm();
    submit();

    await waitFor(() => {
      expect(screen.getByText(/could not be sent just now/i)).toBeInTheDocument();
    });

    // The whole point: nothing the visitor wrote has been discarded.
    expect(screen.getByLabelText(/your name/i)).toHaveValue(VALID_VALUES.name);
    expect(screen.getByLabelText(/email address/i)).toHaveValue(VALID_VALUES.email);
    expect(screen.getByLabelText(/project type/i)).toHaveValue(VALID_VALUES.projectType);
    expect(screen.getByLabelText(/budget range/i)).toHaveValue(VALID_VALUES.budgetRange);
    expect(screen.getByLabelText(/about the project/i)).toHaveValue(VALID_VALUES.message);
  });

  it("keeps the values when the request fails at the network level", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));

    render(<ContactForm />);
    fillForm();
    submit();

    await waitFor(() => {
      expect(screen.getByText(/something went wrong sending/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/about the project/i)).toHaveValue(VALID_VALUES.message);
  });

  it("renders server-supplied field errors against the right controls", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          code: "invalid_input",
          message: "Please check the highlighted fields and try again.",
          fieldErrors: { email: "That address looks incomplete." },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<ContactForm />);
    fillForm();
    submit();

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    expect(screen.getByLabelText(/email address/i)).toHaveAccessibleDescription(
      /looks incomplete/i,
    );
  });

  it("reports the outcome through the live region rather than by moving focus", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));

    const { container } = render(<ContactForm />);
    fillForm();
    submit();

    await waitFor(() => {
      const live = container.querySelector("[aria-live='polite']");
      expect(live?.textContent).toMatch(/something went wrong/i);
    });
  });
});

describe("a successful submission", () => {
  it("confirms the outcome in the visitor's own words and offers a reset", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          message: "Thanks — your message has been sent.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<ContactForm />);
    fillForm();
    submit();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /message sent/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/your message has been sent/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /send another message/i }));

    // Only a confirmed success is allowed to clear the fields.
    expect(screen.getByLabelText(/your name/i)).toHaveValue("");
  });

  it("sends the honeypot and timing alongside the enquiry", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true, message: "Sent." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<ContactForm />);
    fillForm();
    submit();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;

    expect(body).toHaveProperty("company", "");
    expect(body).toHaveProperty("elapsedMs");
    expect(body.message).toBe(VALID_VALUES.message);
  });

  it("posts to the documented endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true, message: "Sent." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<ContactForm />);
    fillForm();
    submit();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/contact", expect.anything());
    });
  });
});
