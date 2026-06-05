/**
 * hooks/useTriageStore.ts
 *
 * Zustand store for global app state.
 * Zustand is chosen over Redux because this app doesn't need middleware,
 * time-travel debugging, or a large team coordination overhead.
 * It's also chosen over Context + useReducer because the store is
 * accessible outside React components (e.g. in tests).
 */

import { create } from "zustand";
import type {
  TriageResultItem,
  SupportedModel,
  TriageResult,
} from "@/lib/types";
import { estimateCost, MODEL_META } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface TriageStore {
  // ── State ────────────────────────────────────────────────────────────────
  results: TriageResultItem[];
  selectedModel: SupportedModel;
  totalCostUsd: number;
  isProcessingAll: boolean;

  // ── Derived getters ──────────────────────────────────────────────────────
  processedCount: () => number;
  highUrgencyCount: () => number;

  // ── Actions ──────────────────────────────────────────────────────────────
  setModel: (model: SupportedModel) => void;
  addLoading: (emailText: string) => string; // returns id
  setSuccess: (id: string, result: TriageResult, processingMs: number) => void;
  setError: (id: string, error: string) => void;
  clearResults: () => void;
  setProcessingAll: (val: boolean) => void;
}

export const useTriageStore = create<TriageStore>((set, get) => ({
  results: [],
  selectedModel: "claude-haiku-4-5",
  totalCostUsd: 0,
  isProcessingAll: false,

  processedCount: () =>
    get().results.filter((r) => r.status === "success").length,

  highUrgencyCount: () =>
    get().results.filter(
      (r) => r.status === "success" && r.result?.urgency === "high"
    ).length,

  setModel: (model) => set({ selectedModel: model }),

  addLoading: (emailText) => {
    const id = generateId();
    const item: TriageResultItem = {
      id,
      emailText,
      status: "loading",
      model: get().selectedModel,
      createdAt: Date.now(),
    };
    set((state) => ({ results: [item, ...state.results] }));
    return id;
  },

  setSuccess: (id, result, processingMs) => {
    set((state) => {
      const item = state.results.find((r) => r.id === id);
      const cost = item
        ? estimateCost(item.model, item.emailText.length)
        : 0;

      return {
        totalCostUsd: state.totalCostUsd + cost,
        results: state.results.map((r) =>
          r.id === id
            ? { ...r, status: "success" as const, result, processingMs }
            : r
        ),
      };
    });
  },

  setError: (id, error) => {
    set((state) => ({
      results: state.results.map((r) =>
        r.id === id ? { ...r, status: "error" as const, error } : r
      ),
    }));
  },

  clearResults: () =>
    set({ results: [], totalCostUsd: 0 }),

  setProcessingAll: (val) => set({ isProcessingAll: val }),
}));

/** Convenience selector: model metadata for the currently selected model */
export function useSelectedModelMeta() {
  const model = useTriageStore((s) => s.selectedModel);
  return MODEL_META[model];
}
