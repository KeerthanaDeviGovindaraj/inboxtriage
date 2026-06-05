/**
 * app/api/triage/route.ts
 *
 * POST /api/triage
 *
 * Server-side route — the Anthropic API key never reaches the client.
 * Validates input, calls Claude, returns structured result.
 *
 * Request body:  { emailText: string, model: SupportedModel }
 * Response 200:  { result: TriageResult, model, processingMs }
 * Response 400:  { error: string }
 * Response 500:  { error: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { triageEmail } from "@/lib/anthropic";
import { SUPPORTED_MODELS } from "@/lib/types";
import type {
  TriageRequest,
  TriageResponse,
  ApiErrorResponse,
  SupportedModel,
} from "@/lib/types";

// ── Input validation ─────────────────────────────────────────────────────────

function validateRequest(body: unknown): TriageRequest {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object");
  }

  const { emailText, model } = body as Record<string, unknown>;

  if (typeof emailText !== "string" || emailText.trim().length === 0) {
    throw new ValidationError("emailText is required and must be a non-empty string");
  }

  if (emailText.length > 20_000) {
    throw new ValidationError("emailText exceeds maximum length of 20,000 characters");
  }

  if (!SUPPORTED_MODELS.includes(model as SupportedModel)) {
    throw new ValidationError(
      `model must be one of: ${SUPPORTED_MODELS.join(", ")}`
    );
  }

  return { emailText: emailText.trim(), model: model as SupportedModel };
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest
): Promise<NextResponse<TriageResponse | ApiErrorResponse>> {
  // Check API key is configured on the server
  if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set");
  return NextResponse.json(
    { error: "Server configuration error — API key not set" },
    { status: 500 }
  );
}

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  let validated: TriageRequest;
  try {
    validated = validateRequest(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const start = Date.now();

  try {
    const result = await triageEmail(validated.emailText, validated.model);

    const response: TriageResponse = {
      result,
      model: validated.model,
      processingMs: Date.now() - start,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected error during triage";

    console.error("Triage error:", err);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Reject non-POST methods
export async function GET(): Promise<NextResponse<ApiErrorResponse>> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
