/**
 * lib/openai.ts
 *
 * Server-only module. Talks to the OpenAI Chat Completions API and validates
 * the structured JSON it returns. Nothing else in the app calls OpenAI directly
 * — swapping providers means changing only this file.
 *
 * The API key is read from process.env here and never leaves the server.
 */

import OpenAI from "openai";
import { TRIAGE_SYSTEM_PROMPT } from "./prompts";
import type { SupportedModel, TriageResult } from "./types";
import { TRIAGE_CATEGORIES, URGENCY_LEVELS } from "./types";

// Instantiate lazily so that importing this module (e.g. to unit-test the
// validator) does not require an API key at import time. The client is only
// constructed on the first real triage call.
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/**
 * How many times to retry when the model returns malformed / non-JSON output.
 * The model occasionally ignores the "JSON only" instruction or invents a
 * category outside the enum; a single retry at a slightly higher temperature
 * clears up the vast majority of these cases.
 */
const MAX_ATTEMPTS = 2;

/**
 * Validate the parsed model output against the TriageResult contract.
 * Throws a descriptive error on the first violation so the caller can retry
 * or surface a clear message rather than letting malformed data propagate.
 *
 * Exported for unit testing — it contains the reliability-critical logic.
 */
export function validateTriageResult(raw: unknown): TriageResult {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Response is not an object");
  }
  const obj = raw as Record<string, unknown>;

  if (!TRIAGE_CATEGORIES.includes(obj.category as never)) {
    throw new Error(`Invalid category: "${obj.category}"`);
  }
  if (!URGENCY_LEVELS.includes(obj.urgency as never)) {
    throw new Error(`Invalid urgency: "${obj.urgency}"`);
  }
  if (typeof obj.confidence !== "number") {
    throw new Error("confidence must be a number");
  }
  if (typeof obj.draft_reply !== "string" || obj.draft_reply.length < 20) {
    throw new Error("draft_reply is missing or too short");
  }
  if (!Array.isArray(obj.flags)) {
    throw new Error("flags must be an array");
  }

  const entities = obj.entities as Record<string, unknown> | undefined;
  if (!entities || typeof entities.action_required !== "string") {
    throw new Error("entities.action_required is required");
  }

  // Normalise optional entity fields so downstream code never hits undefined.
  const normalised: TriageResult = {
    category: obj.category as TriageResult["category"],
    urgency: obj.urgency as TriageResult["urgency"],
    confidence: Math.max(0, Math.min(100, Math.round(obj.confidence))),
    entities: {
      client_name: toStringOrNull(entities.client_name),
      tax_year: toStringOrNull(entities.tax_year),
      documents_needed: Array.isArray(entities.documents_needed)
        ? entities.documents_needed.map(String)
        : [],
      dollar_amount: toStringOrNull(entities.dollar_amount),
      deadline: toStringOrNull(entities.deadline),
      action_required: entities.action_required as string,
    },
    flags: (obj.flags as unknown[]).map(String),
    draft_reply: obj.draft_reply as string,
  };

  return normalised;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

/**
 * Triage a single client email. Calls OpenAI, parses and validates the result,
 * and retries once if the model returns something that doesn't match the schema.
 */
export async function triageEmail(
  emailText: string,
  model: SupportedModel
): Promise<TriageResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const completion = await getClient().chat.completions.create({
        model,
        max_tokens: 1024,
        // Nudge temperature up slightly on retry to escape a bad local output.
        temperature: attempt === 1 ? 0.1 : 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: TRIAGE_SYSTEM_PROMPT },
          { role: "user", content: `Triage this client email:\n\n${emailText}` },
        ],
      });

      const rawText = completion.choices[0]?.message?.content ?? "";

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        throw new Error("Model returned non-JSON output");
      }

      return validateTriageResult(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Only retry on parse/validation problems — not on auth, network, or
      // quota errors from the SDK, which won't be fixed by trying again.
      const retriable =
        lastError.message.startsWith("Model returned non-JSON") ||
        lastError.message.startsWith("Invalid ") ||
        lastError.message.includes("must be") ||
        lastError.message.includes("is required") ||
        lastError.message.includes("too short") ||
        lastError.message.includes("not an object");

      if (!retriable || attempt === MAX_ATTEMPTS) {
        throw lastError;
      }
    }
  }

  // Unreachable in practice — the loop either returns or throws above.
  throw lastError ?? new Error("Triage failed");
}
