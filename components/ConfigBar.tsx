/**
 * components/ConfigBar.tsx
 * Model selector — displayed below the header.
 * API key is handled server-side via .env.local, not exposed here.
 */

"use client";

import { SUPPORTED_MODELS, MODEL_META } from "@/lib/types";
import { useTriage } from "@/hooks/useTriage";

export function ConfigBar() {
  const { selectedModel, setModel } = useTriage();

  return (
    <div className="flex items-end gap-4 mb-5 flex-wrap">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="modelSelect"
          className="font-mono text-[11px] text-[#aaa] tracking-wide"
        >
          MODEL
        </label>
        <select
          id="modelSelect"
          value={selectedModel}
          onChange={(e) => setModel(e.target.value as typeof selectedModel)}
          className="h-[34px] px-3 font-mono text-[12px] bg-surface text-[#1c1c1c] border border-border rounded-[5px] outline-none cursor-pointer hover:border-border-strong transition-colors"
        >
          {SUPPORTED_MODELS.map((model) => (
            <option key={model} value={model}>
              {MODEL_META[model].label} — {MODEL_META[model].description}
            </option>
          ))}
        </select>
      </div>

      <p className="font-mono text-[11px] text-[#aaa] pb-[6px]">
        {"// api key is set in "}
        <code className="text-[#555]">.env.local</code>
        {" on the server"}
      </p>
    </div>
  );
}
