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
    expect(estimateCost("claude-haiku-4-5", 0, 0)).toBe(0);
  });

  it("haiku is cheaper than sonnet for the same input", () => {
    const haikuCost = estimateCost("claude-haiku-4-5", 1000, 400);
    const sonnetCost = estimateCost("claude-sonnet-4-5", 1000, 400);
    expect(haikuCost).toBeLessThan(sonnetCost);
  });

  it("cost increases with input length", () => {
    const short = estimateCost("claude-haiku-4-5", 500);
    const long = estimateCost("claude-haiku-4-5", 5000);
    expect(long).toBeGreaterThan(short);
  });

  it("returns a positive number for typical email length", () => {
    // ~1000 char email
    const cost = estimateCost("claude-haiku-4-5", 1000);
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
