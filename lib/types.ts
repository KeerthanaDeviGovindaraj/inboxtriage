/**
 * lib/types.ts
 *
 * Single source of truth for all data shapes in the app.
 * The API route, the hook, the components, and the tests all import from here.
 * Changing a type here causes TypeScript to surface every affected callsite.
 */

// ── Triage categories ────────────────────────────────────────────────────────

export const TRIAGE_CATEGORIES = [
  "document_request",
  "tax_question",
  "billing_dispute",
  "new_client_inquiry",
  "irs_notice",
  "deadline_sensitive",
  "general_question",
  "complaint",
] as const;

export type TriageCategory = (typeof TRIAGE_CATEGORIES)[number];

export const URGENCY_LEVELS = ["high", "medium", "low"] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

// ── Core result shape (matches the JSON Claude returns) ──────────────────────

export interface TriageEntities {
  client_name: string | null;
  tax_year: string | null;
  documents_needed: string[];
  dollar_amount: string | null;
  deadline: string | null;
  action_required: string;
}

export interface TriageResult {
  category: TriageCategory;
  urgency: UrgencyLevel;
  confidence: number; // 0-100
  entities: TriageEntities;
  flags: string[];
  draft_reply: string;
}

// ── API request / response shapes ───────────────────────────────────────────

export interface TriageRequest {
  emailText: string;
  model: SupportedModel;
}

export interface TriageResponse {
  result: TriageResult;
  model: SupportedModel;
  processingMs: number;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}

// ── Model config ─────────────────────────────────────────────────────────────

export const SUPPORTED_MODELS = [
  "claude-haiku-4-5",
  "claude-sonnet-4-5",
] as const;

export type SupportedModel = (typeof SUPPORTED_MODELS)[number];

export interface ModelMeta {
  label: string;
  description: string;
  costPer1kInput: number;  // USD
  costPer1kOutput: number; // USD
}

export const MODEL_META: Record<SupportedModel, ModelMeta> = {
  "claude-haiku-4-5": {
    label: "Haiku 4.5",
    description: "Fast · cheap · great for most emails",
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
  },
  "claude-sonnet-4-5": {
    label: "Sonnet 4.5",
    description: "Smarter · better on complex tax questions",
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
};

// ── Sample email type ─────────────────────────────────────────────────────────

export interface SampleEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
}

// ── App state ─────────────────────────────────────────────────────────────────

export type ResultStatus = "idle" | "loading" | "success" | "error";

export interface TriageResultItem {
  id: string;
  emailText: string;
  status: ResultStatus;
  result?: TriageResult;
  error?: string;
  model: SupportedModel;
  processingMs?: number;
  createdAt: number;
}

// ── Utility type helpers ──────────────────────────────────────────────────────

/** Estimate cost in USD for a given model and char counts */
export function estimateCost(
  model: SupportedModel,
  inputChars: number,
  outputChars = 600
): number {
  const meta = MODEL_META[model];
  const inputTokens = inputChars / 4 / 1000;
  const outputTokens = outputChars / 4 / 1000;
  return inputTokens * meta.costPer1kInput + outputTokens * meta.costPer1kOutput;
}

/** Human-readable category label */
export function formatCategory(category: TriageCategory): string {
  return category.replace(/_/g, " ");
}
