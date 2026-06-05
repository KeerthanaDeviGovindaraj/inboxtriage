/**
 * app/page.tsx
 *
 * Main page — assembles the full UI.
 * This is a Client Component because it manages interactive state.
 * The actual API call happens server-side via /api/triage.
 */

"use client";

import { useState } from "react";
import { ConfigBar } from "@/components/ConfigBar";
import { SampleList } from "@/components/SampleList";
import { EmailInput } from "@/components/EmailInput";
import { ResultCard } from "@/components/ResultCard";
import { useTriageStore } from "@/hooks/useTriageStore";
import { useTriage } from "@/hooks/useTriage";
import { SAMPLE_EMAILS } from "@/lib/samples";
import { formatCost } from "@/lib/utils";
import type { SampleEmail } from "@/lib/types";

export default function HomePage() {
  const [emailText, setEmailText] = useState(
    `From: ${SAMPLE_EMAILS[0].sender}\nSubject: ${SAMPLE_EMAILS[0].subject}\n\n${SAMPLE_EMAILS[0].body}`
  );
  const [activeSampleId, setActiveSampleId] = useState<string | null>(
    SAMPLE_EMAILS[0].id
  );

  const { triage, triageAll, isProcessingAll } = useTriage();
  const results = useTriageStore((s) => s.results);
  const processedCount = useTriageStore((s) => s.processedCount());
  const highUrgencyCount = useTriageStore((s) => s.highUrgencyCount());
  const totalCost = useTriageStore((s) => s.totalCostUsd);
  const clearResults = useTriageStore((s) => s.clearResults);

  const isRunning = results.some((r) => r.status === "loading");

  function handleSelectSample(sample: SampleEmail) {
    setActiveSampleId(sample.id);
    setEmailText(
      `From: ${sample.sender}\nSubject: ${sample.subject}\n\n${sample.body}`
    );
  }

  function handleClear() {
    setEmailText("");
    setActiveSampleId(null);
    clearResults();
  }

  function handleTriage() {
    triage(emailText);
  }

  function handleProcessAll() {
    const allEmails = SAMPLE_EMAILS.map(
      (s) => `From: ${s.sender}\nSubject: ${s.subject}\n\n${s.body}`
    );
    triageAll(allEmails);
  }

  return (
    <div className="max-w-[900px] mx-auto px-5 pt-8 pb-20">

      {/* ── Header ── */}
      <header className="flex items-start justify-between gap-6 mb-6 pb-5 border-b border-border flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="font-mono text-[22px] font-medium tracking-[-0.5px]">
            inbox_triage
            <span className="text-[#aaa] animate-blink">_</span>
          </h1>
          <p className="text-[13px] text-[#666]">
            AI-powered email triage for accounting &amp; bookkeeping firms
          </p>
          <p className="font-mono text-[11px] text-[#aaa]">
            // forward-deployed AI engineer project — xylo ai studios
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Stat value={processedCount} label="processed" />
          <div className="w-px h-7 bg-border" />
          <Stat value={highUrgencyCount} label="high urgency" urgent />
          <div className="w-px h-7 bg-border" />
          <Stat value={formatCost(totalCost)} label="est. cost" />
        </div>
      </header>

      {/* ── Config ── */}
      <ConfigBar />

      {/* ── Main grid ── */}
      <main className="grid grid-cols-[240px_1fr] gap-3 mb-4 max-[640px]:grid-cols-1">
        <SampleList
          samples={SAMPLE_EMAILS}
          activeId={activeSampleId}
          onSelect={handleSelectSample}
        />
        <EmailInput
          value={emailText}
          onChange={setEmailText}
          onTriage={handleTriage}
          onProcessAll={handleProcessAll}
          onClear={handleClear}
          isRunning={isRunning}
        />
      </main>

      {/* ── Results ── */}
      <section aria-label="Triage results" aria-live="polite">
        {results.length > 0 ? (
          <div className="flex flex-col gap-3">
            {results.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-[12px] text-[#aaa] py-6">
            // results will appear here
          </p>
        )}
      </section>

    </div>
  );
}

// ── Stat widget ───────────────────────────────────────────────────────────────

function Stat({
  value,
  label,
  urgent = false,
}: {
  value: string | number;
  label: string;
  urgent?: boolean;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className={`font-mono text-[20px] font-medium leading-none ${urgent ? "text-urgent" : "text-[#1c1c1c]"}`}
      >
        {value}
      </span>
      <span className="font-mono text-[11px] text-[#aaa]">{label}</span>
    </div>
  );
}
