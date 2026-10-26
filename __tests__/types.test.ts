/**
 * __tests__/types.test.ts
 * Tests for type utility functions and constants.
 */

import { describe, it, expect } from "vitest";
import {
  estimateCost,
  formatCategory,
  TRIAGE_CATEGORIES,
  URGENCY_LEVELS,
  MODEL_META,
  SUPPORTED_MODELS,
} from "@/lib/types";

describe("estimateCost", () => {
  it("returns 0 for zero-length input", () => {
    expect(estimateCost("gpt-4o-mini", 0, 0)).toBe(0);
  });

  it("the mini model is cheaper than the full model for the same input", () => {
    const miniCost = estimateCost("gpt-4o-mini", 1000, 400);
    const fullCost = estimateCost("gpt-4o", 1000, 400);
    expect(miniCost).toBeLessThan(fullCost);
  });

  it("cost increases with input length", () => {
    const short = estimateCost("gpt-4o-mini", 500);
    const long = estimateCost("gpt-4o-mini", 5000);
    expect(long).toBeGreaterThan(short);
  });

  it("returns a positive number for typical email length", () => {
    // ~1000 char email
    const cost = estimateCost("gpt-4o-mini", 1000);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(0.01); // sanity upper bound
  });
});

describe("formatCategory", () => {
  it("replaces underscores with spaces", () => {
    expect(formatCategory("document_request")).toBe("document request");
  });

  it("handles single-word categories", () => {
    expect(formatCategory("complaint")).toBe("complaint");
  });

  it("formats all known categories without throwing", () => {
    expect(() => {
      TRIAGE_CATEGORIES.forEach((c) => formatCategory(c));
    }).not.toThrow();
  });
});

describe("constants", () => {
  it("TRIAGE_CATEGORIES is non-empty", () => {
    expect(TRIAGE_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("URGENCY_LEVELS contains high, medium, low", () => {
    expect(URGENCY_LEVELS).toContain("high");
    expect(URGENCY_LEVELS).toContain("medium");
    expect(URGENCY_LEVELS).toContain("low");
  });

  it("MODEL_META has entries for all supported models", () => {
    SUPPORTED_MODELS.forEach((model) => {
      expect(MODEL_META[model]).toBeDefined();
      expect(MODEL_META[model].label).toBeTruthy();
      expect(MODEL_META[model].costPer1kInput).toBeGreaterThan(0);
    });
  });
});
