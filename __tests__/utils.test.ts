/**
 * __tests__/utils.test.ts
 * Unit tests for utility functions.
 */

import { describe, it, expect } from "vitest";
import {
  formatCost,
  formatDuration,
  extractSubject,
  generateId,
} from "@/lib/utils";

describe("formatCost", () => {
  it("returns $0.0000 when cost is zero", () => {
    expect(formatCost(0)).toBe("$0.0000");
  });

  it("formats small costs to 4 decimal places", () => {
    expect(formatCost(0.00143)).toBe("$0.0014");
  });

  it("always includes dollar sign", () => {
    expect(formatCost(1.5)).toMatch(/^\$/);
  });
});

describe("formatDuration", () => {
  it("converts milliseconds to seconds with 1 decimal", () => {
    expect(formatDuration(1420)).toBe("1.4s");
  });

  it("handles sub-second durations", () => {
    // 350 / 1000 = 0.35, which toFixed(1) renders as "0.3"
    expect(formatDuration(350)).toBe("0.3s");
    expect(formatDuration(450)).toBe("0.5s");
  });

  it("appends 's' suffix", () => {
    expect(formatDuration(2000)).toBe("2.0s");
  });
});

describe("extractSubject", () => {
  it("extracts subject from a standard email header", () => {
    const email = "From: Alice\nSubject: Q3 financials needed\n\nHi there";
    expect(extractSubject(email)).toBe("Q3 financials needed");
  });

  it("is case-insensitive", () => {
    const email = "SUBJECT: Important update";
    expect(extractSubject(email)).toBe("Important update");
  });

  it("returns fallback when no subject is present", () => {
    expect(extractSubject("Just a body, no headers")).toBe("Client email");
  });

  it("trims whitespace from subject", () => {
    const email = "Subject:   Lots of spaces   ";
    expect(extractSubject(email)).toBe("Lots of spaces");
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    expect(typeof generateId()).toBe("string");
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
