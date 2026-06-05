/**
 * __tests__/ResultCard.test.tsx
 * Component tests for ResultCard — covers loading, error, and success states.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultCard } from "@/components/ResultCard";
import type { TriageResultItem, TriageResult } from "@/lib/types";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockResult: TriageResult = {
  category: "irs_notice",
  urgency: "high",
  confidence: 94,
  entities: {
    client_name: "Priya Mehta",
    tax_year: "2021",
    documents_needed: [],
    dollar_amount: "$14,200",
    deadline: "November 30",
    action_required: "Contact Priya immediately and review the IRS notice before responding.",
  },
  flags: [
    "IRS notice with legal deadline — CPA must review before replying",
    "Billing dispute — verify contract rate before acknowledging",
  ],
  draft_reply:
    "Hi Priya,\n\nThank you for reaching out — I can hear the stress in your message and want to reassure you that we've got this.\n\nRegarding the IRS notice, yes, this is absolutely something we handle. Please scan and send that letter over as soon as you can and we'll review it right away given the November 30 deadline.\n\nOn the invoice question, I'll pull up your engagement agreement today and confirm the rate. If there's a discrepancy, we'll sort it out before you send payment.\n\nMore to follow once we've reviewed the notice.\n\nBest,\nThe Team",
};

function makeItem(
  overrides: Partial<TriageResultItem> = {}
): TriageResultItem {
  return {
    id: "test-1",
    emailText: "From: Priya Mehta\nSubject: invoice question + urgent thing\n\nHello...",
    status: "success",
    result: mockResult,
    model: "claude-haiku-4-5",
    createdAt: Date.now(),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ResultCard — loading state", () => {
  it("renders loading indicator", () => {
    render(<ResultCard item={makeItem({ status: "loading", result: undefined })} />);
    expect(screen.getByText(/analyzing email/i)).toBeInTheDocument();
  });
});

describe("ResultCard — error state", () => {
  it("renders the error message", () => {
    render(
      <ResultCard
        item={makeItem({
          status: "error",
          result: undefined,
          error: "API key invalid",
        })}
      />
    );
    expect(screen.getByText(/API key invalid/i)).toBeInTheDocument();
    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });
});

describe("ResultCard — success state", () => {
  it("renders the email subject", () => {
    render(<ResultCard item={makeItem()} />);
    expect(
      screen.getByText("invoice question + urgent thing")
    ).toBeInTheDocument();
  });

  it("renders urgency badge", () => {
    render(<ResultCard item={makeItem()} />);
    expect(screen.getByText(/high urgency/i)).toBeInTheDocument();
  });

  it("renders flagged badge when flags exist", () => {
    render(<ResultCard item={makeItem()} />);
    expect(screen.getByText(/flagged/i)).toBeInTheDocument();
  });

  it("renders confidence percentage", () => {
    render(<ResultCard item={makeItem()} />);
    expect(screen.getByText("94%")).toBeInTheDocument();
  });

  it("renders extracted entities", () => {
    render(<ResultCard item={makeItem()} />);
    expect(screen.getByText("Priya Mehta")).toBeInTheDocument();
    expect(screen.getByText("$14,200")).toBeInTheDocument();
    expect(screen.getByText("November 30")).toBeInTheDocument();
  });

  it("renders flags list", () => {
    render(<ResultCard item={makeItem()} />);
    expect(
      screen.getByText(/IRS notice with legal deadline/i)
    ).toBeInTheDocument();
  });

  it("renders draft reply", () => {
    render(<ResultCard item={makeItem()} />);
    expect(screen.getByText(/Thank you for reaching out/i)).toBeInTheDocument();
  });

  it("has a copy button for the draft reply", () => {
    render(<ResultCard item={makeItem()} />);
    expect(
      screen.getByRole("button", { name: /copy/i })
    ).toBeInTheDocument();
  });

  it("shows urgent border for high-urgency results", () => {
    render(<ResultCard item={makeItem()} />);
    const article = screen.getByRole("article");
    expect(article.className).toMatch(/border-urgent/);
  });

  it("does not show urgent border for low-urgency results", () => {
    const lowItem = makeItem({
      result: { ...mockResult, urgency: "low" },
    });
    render(<ResultCard item={lowItem} />);
    const article = screen.getByRole("article");
    expect(article.className).not.toMatch(/border-urgent/);
  });
});

describe("ResultCard — copy button", () => {
  it("shows 'copied!' after clicking and reverts", async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const user = userEvent.setup();
    render(<ResultCard item={makeItem()} />);

    const copyBtn = screen.getByRole("button", { name: /copy/i });
    await user.click(copyBtn);

    expect(screen.getByText("copied!")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockResult.draft_reply
    );
  });
});
