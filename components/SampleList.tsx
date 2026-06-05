/**
 * components/SampleList.tsx
 * Sidebar list of sample emails to load into the textarea.
 */

"use client";

import { cn } from "@/lib/utils";
import type { SampleEmail } from "@/lib/types";

interface SampleListProps {
  samples: SampleEmail[];
  activeId: string | null;
  onSelect: (sample: SampleEmail) => void;
}

export function SampleList({ samples, activeId, onSelect }: SampleListProps) {
  return (
    <div>
      <p className="font-mono text-[11px] text-[#aaa] tracking-wide mb-2 px-0.5">
        sample_emails/
      </p>
      <nav className="flex flex-col gap-[5px]" aria-label="Sample emails">
        {samples.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelect(sample)}
            aria-pressed={activeId === sample.id}
            className={cn(
              "w-full text-left bg-surface border rounded-[5px] px-3 py-2 transition-all",
              "hover:border-border-strong",
              activeId === sample.id
                ? "border-[#1c1c1c] bg-surface-dim"
                : "border-border"
            )}
          >
            <p className="text-[13px] font-medium text-[#1c1c1c] mb-0.5">
              {sample.sender}
            </p>
            <p className="text-[11px] text-[#888] truncate">{sample.subject}</p>
          </button>
        ))}
      </nav>
    </div>
  );
}
