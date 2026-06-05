import OpenAI from "openai";
import { TRIAGE_SYSTEM_PROMPT } from "./prompts";
import type { SupportedModel, TriageResult } from "./types";
import { TRIAGE_CATEGORIES, URGENCY_LEVELS } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OPENAI_MODEL_MAP: Record<SupportedModel, string> = {
  "claude-haiku-4-5":  "gpt-4o-mini",
  "claude-sonnet-4-5": "gpt-4o",
};

function validateTriageResult(raw: unknown): TriageResult {
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
  const entities = obj.entities as Record<string, unknown>;
  if (!entities || typeof entities.action_required !== "string") {
    throw new Error("entities.action_required is required");
  }
  return raw as TriageResult;
}

export async function triageEmail(
  emailText: string,
  model: SupportedModel
): Promise<TriageResult> {
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL_MAP[model],
    max_tokens: 1024,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: TRIAGE_SYSTEM_PROMPT },
      { role: "user",   content: `Triage this client email:\n\n${emailText}` },
    ],
  });

  const rawText = completion.choices[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Model returned non-JSON output. Please try again.");
  }

  return validateTriageResult(parsed);
}