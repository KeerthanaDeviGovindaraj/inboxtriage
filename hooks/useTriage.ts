/**
 * hooks/useTriage.ts
 *
 * Custom hook that encapsulates all triage business logic.
 * Components call this hook — they never call fetch directly.
 * This separation makes the logic easy to test and reuse.
 */

"use client";

import { useCallback } from "react";
import { useTriageStore } from "./useTriageStore";
import type { SupportedModel, TriageResponse, ApiErrorResponse } from "@/lib/types";

export function useTriage() {
  const store = useTriageStore();

  /**
   * Triage a single email.
   * Adds a loading item to the store, calls the API,
   * then updates the item to success or error.
   */
  const triage = useCallback(
    async (emailText: string): Promise<void> => {
      if (!emailText.trim()) return;

      const id = store.addLoading(emailText);
      const start = Date.now();

      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailText,
            model: store.selectedModel,
          } satisfies { emailText: string; model: SupportedModel }),
        });

        const data: TriageResponse | ApiErrorResponse = await res.json();

        if (!res.ok || "error" in data) {
          const msg = "error" in data ? data.error : `HTTP ${res.status}`;
          store.setError(id, msg);
          return;
        }

        if (data.demo) store.setDemoMode(true);
        store.setSuccess(id, data.result, data.processingMs ?? Date.now() - start);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Network error — are you online?";
        store.setError(id, msg);
      }
    },
    [store]
  );

  /**
   * Process all sample emails sequentially.
   * Small delay between calls avoids hitting rate limits on free tier.
   */
  const triageAll = useCallback(
    async (emails: string[]): Promise<void> => {
      store.clearResults();
      store.setProcessingAll(true);

      for (const emailText of emails) {
        await triage(emailText);
        await new Promise((r) => setTimeout(r, 400));
      }

      store.setProcessingAll(false);
    },
    [triage, store]
  );

  return {
    triage,
    triageAll,
    selectedModel: store.selectedModel,
    setModel: store.setModel,
    isProcessingAll: store.isProcessingAll,
  };
}
