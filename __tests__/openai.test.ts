/**
 * __tests__/openai.test.ts
 * Tests for validateTriageResult — the reliability layer that guards against
 * malformed model output before it reaches the UI.
 */

import { describe, it, expect } from "vitest";
import { validateTriageResult } from "@/lib/openai";

const VALID = {
  category: "irs_notice",
  urgency: "high",
  confidence: 92,
  entities: {
    client_name: "Priya Mehta",
    tax_year: "2021",
    documents_needed: ["IRS notice"],
    dollar_amount: "$14,200",
    deadline: "November 30",
    action_required: "Review the IRS notice before replying.",
  },
  flags: ["IRS involved — CPA must review"],
  draft_reply:
    "Hi Priya, thank you for reaching out. We will review the notice right away. Best, The Team",
};

describe("validateTriageResult — accepts valid output", () => {
  it("returns a normalised result for well-formed input", () => {
    const result = validateTriageResult(VALID);
    expect(result.category).toBe("irs_notice");
    expect(result.urgency).toBe("high");
    expect(result.confidence).toBe(92);
    expect(result.entities.client_name).toBe("Priya Mehta");
    expect(result.flags).toHaveLength(1);
  });

  it("clamps confidence into the 0-100 range", () => {
    expect(validateTriageResult({ ...VALID, confidence: 140 }).confidence).toBe(
      100
    );
    expect(validateTriageResult({ ...VALID, confidence: -5 }).confidence).toBe(
      0
    );
  });

  it("rounds a fractional confidence to an integer", () => {
    expect(
      validateTriageResult({ ...VALID, confidence: 87.6 }).confidence
    ).toBe(88);
  });

  it("coerces empty-string entity fields to null", () => {
    const result = validateTriageResult({
      ...VALID,
      entities: { ...VALID.entities, tax_year: "", dollar_amount: "" },
    });
    expect(result.entities.tax_year).toBeNull();
    expect(result.entities.dollar_amount).toBeNull();
  });

  it("defaults documents_needed to an empty array when missing", () => {
    const { documents_needed, ...entitiesWithout } = VALID.entities;
    void documents_needed;
    const result = validateTriageResult({
      ...VALID,
      entities: entitiesWithout,
    });
    expect(result.entities.documents_needed).toEqual([]);
  });
});

describe("validateTriageResult — rejects malformed output", () => {
  it("throws when input is not an object", () => {
    expect(() => validateTriageResult("nope")).toThrow(/not an object/i);
    expect(() => validateTriageResult(null)).toThrow(/not an object/i);
  });

  it("throws on a category outside the enum", () => {
    expect(() =>
      validateTriageResult({ ...VALID, category: "made_up_category" })
    ).toThrow(/invalid category/i);
  });

  it("throws on an invalid urgency", () => {
    expect(() =>
      validateTriageResult({ ...VALID, urgency: "critical" })
    ).toThrow(/invalid urgency/i);
  });

  it("throws when confidence is not a number", () => {
    expect(() =>
      validateTriageResult({ ...VALID, confidence: "high" })
    ).toThrow(/confidence must be a number/i);
  });

  it("throws when draft_reply is missing or too short", () => {
    expect(() =>
      validateTriageResult({ ...VALID, draft_reply: "too short" })
    ).toThrow(/draft_reply/i);
  });

  it("throws when flags is not an array", () => {
    expect(() =>
      validateTriageResult({ ...VALID, flags: "not an array" })
    ).toThrow(/flags must be an array/i);
  });

  it("throws when entities.action_required is missing", () => {
    const { action_required, ...rest } = VALID.entities;
    void action_required;
    expect(() =>
      validateTriageResult({ ...VALID, entities: rest })
    ).toThrow(/action_required is required/i);
  });
});
