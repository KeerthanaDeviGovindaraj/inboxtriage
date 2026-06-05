/**
 * components/EmailInput.tsx
 * Textarea + action buttons for the email input panel.
 */

"use client";

import { Button } from "@/components/ui/Button";
import { MODEL_META } from "@/lib/types";
import { useTriageStore } from "@/hooks/useTriageStore";

interface EmailInputProps {
  value: string;
  onChange: (val: string) => void;
  onTriage: () => void;
  onProcessAll: () => void;
  onClear: () => void;
  isRunning: boolean;
}

export function EmailInput({
  value,
  onChange,
  onTriage,
  onProcessAll,
  onClear,
  isRunning,
}: EmailInputProps) {
  const selectedModel = useTriageStore((s) => s.selectedModel);
  const isProcessingAll = useTriageStore((s) => s.isProcessingAll);
  const disabled = isRunning || isProcessingAll;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <span className="font-mono text-[11px] text-[#aaa]">input.txt</span>
        <span className="font-mono text-[11px] text-[#aaa]">
          {value.length.toLocaleString()} chars
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Paste a client email here...\n\nOr select a sample from the sidebar."}
        spellCheck={false}
        aria-label="Email content"
        className="w-full h-[220px] resize-y px-3 py-2.5 font-mono text-[12px] leading-relaxed
          bg-surface text-[#1c1c1c] border border-border rounded-[5px] outline-none
          placeholder:text-[#aaa] focus:border-[#1c1c1c] transition-colors"
      />

      {/* Actions */}
      <div className="flex gap-2 items-center flex-wrap">
        <Button
          variant="primary"
          onClick={onTriage}
          disabled={disabled || !value.trim()}
        >
          {isRunning && !isProcessingAll ? "... running" : "→ run triage"}
        </Button>

        <Button
          variant="secondary"
          onClick={onProcessAll}
          disabled={disabled}
        >
          {isProcessingAll ? "processing..." : "process all samples"}
        </Button>

        <Button variant="ghost" onClick={onClear} disabled={disabled}>
          clear
        </Button>

        {/* Model indicator */}
        <span className="font-mono text-[11px] text-[#aaa] ml-auto">
          {MODEL_META[selectedModel].label.toLowerCase()}
        </span>
      </div>
    </div>
  );
}
