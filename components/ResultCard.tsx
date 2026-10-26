/**
 * components/ResultCard.tsx
 * Displays a single triage result — loading, error, or success states.
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn, extractSubject, formatDuration } from "@/lib/utils";
import { formatCategory } from "@/lib/types";
import type { TriageResultItem } from "@/lib/types";

interface ResultCardProps {
  item: TriageResultItem;
}

export function ResultCard({ item }: ResultCardProps) {
  if (item.status === "loading") return <LoadingCard />;
  if (item.status === "error") return <ErrorCard message={item.error ?? "Unknown error"} />;
  if (!item.result) return null;

  return <SuccessCard item={item} />;
}

// ── Loading ──────────────────────────────────────────────────────────────────

function LoadingCard() {
  return (
    <div className="bg-surface border border-border rounded-[6px] p-4 animate-fade-up">
      <p className="font-mono text-[12px] text-[#aaa] mb-3">
        {"// analyzing email..."}
      </p>
      <div className="h-[2px] bg-surface-page rounded-full overflow-hidden">
        <div className="h-full w-[30%] bg-[#1c1c1c] rounded-full animate-sweep" />
      </div>
    </div>
  );
}

// ── Error ────────────────────────────────────────────────────────────────────

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-surface border border-border rounded-[6px] p-4 animate-fade-up">
      <div className="font-mono text-[13px] bg-urgent-bg border border-urgent-border rounded-[4px] px-4 py-3 text-urgent flex gap-2">
        <span className="font-medium">error:</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

// ── Success ───────────────────────────────────────────────────────────────────

function SuccessCard({ item }: ResultCardProps) {
  const { result, emailText, processingMs } = item;
  if (!result) return null;

  const subject = extractSubject(emailText);
  const entities = result.entities;
  const isHigh = result.urgency === "high";

  const entityPairs: [string, string][] = [
    ["client", entities.client_name ?? ""],
    ["tax year", entities.tax_year ?? ""],
    ["amount", entities.dollar_amount ?? ""],
    ["deadline", entities.deadline ?? ""],
    [
      "docs needed",
      entities.documents_needed.length > 0
        ? entities.documents_needed.join(", ")
        : "",
    ],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <article
      className={cn(
        "bg-surface border rounded-[6px] overflow-hidden animate-fade-up",
        isHigh ? "border-urgent" : "border-border"
      )}
      aria-label={`Triage result: ${subject}`}
    >
      {/* ── Card header ── */}
      <div className="flex justify-between items-start gap-4 px-4 py-3.5 border-b border-border">
        <div>
          <h2 className="text-[14px] font-medium text-[#1c1c1c] mb-2">
            {subject}
          </h2>
          <div className="flex gap-[5px] flex-wrap">
            <Badge variant="default">{formatCategory(result.category)}</Badge>
            <Badge variant={result.urgency}>{result.urgency} urgency</Badge>
            {result.flags.length > 0 && (
              <Badge variant="flag">⚑ flagged</Badge>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-mono text-[20px] font-medium leading-none text-[#1c1c1c]">
            {result.confidence}%
          </p>
          <p className="font-mono text-[10px] text-[#aaa] mt-0.5">confidence</p>
          {processingMs && (
            <p className="font-mono text-[10px] text-[#aaa]">
              {formatDuration(processingMs)}
            </p>
          )}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Next action */}
        {entities.action_required && (
          <section>
            <SectionHead>next action</SectionHead>
            <p className="text-[13px] text-[#555] leading-[1.55] bg-surface-dim border-l-[2.5px] border-[#1c1c1c] pl-3 py-2 rounded-r-[3px]">
              {entities.action_required}
            </p>
          </section>
        )}

        {/* Extracted entities */}
        {entityPairs.length > 0 && (
          <section>
            <SectionHead>extracted</SectionHead>
            <div className="flex flex-wrap gap-1.5">
              {entityPairs.map(([key, val]) => (
                <div
                  key={key}
                  className="bg-surface-page border border-border rounded-[5px] px-2.5 py-1.5 min-w-[100px]"
                >
                  <p className="font-mono text-[10px] text-[#aaa] mb-0.5">
                    {key}
                  </p>
                  <p className="text-[13px] font-medium text-[#1c1c1c]">
                    {val}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Flags */}
        {result.flags.length > 0 && (
          <section>
            <SectionHead>review before sending</SectionHead>
            <ul className="flex flex-col gap-1.5">
              {result.flags.map((flag, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[13px] text-[#555] leading-[1.5]"
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full bg-urgent flex-shrink-0 mt-[7px]"
                    aria-hidden="true"
                  />
                  {flag}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Draft reply */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <SectionHead className="mb-0">draft reply</SectionHead>
            <CopyButton text={result.draft_reply} />
          </div>
          <pre className="font-mono text-[12px] leading-[1.75] text-[#1c1c1c] bg-surface-dim border border-border rounded-[5px] px-4 py-3 whitespace-pre-wrap break-words">
            {result.draft_reply}
          </pre>
        </section>

      </div>
    </article>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] text-[#aaa] uppercase tracking-[0.06em] mb-2",
        className
      )}
    >
      {children}
    </p>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "font-mono text-[11px] px-[9px] py-[3px] border rounded-[3px] transition-colors",
        copied
          ? "text-low border-low-border bg-low-bg"
          : "text-[#555] border-border bg-surface hover:bg-surface-dim hover:border-border-strong"
      )}
    >
      {copied ? "copied!" : "copy"}
    </button>
  );
}
