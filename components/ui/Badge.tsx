/**
 * components/ui/Badge.tsx
 * Coloured tag/badge for categories and urgency levels.
 */

import { cn } from "@/lib/utils";
import type { UrgencyLevel } from "@/lib/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | UrgencyLevel | "flag";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-surface-page text-[#555] border-border",
  high: "bg-urgent-bg text-urgent border-urgent-border",
  medium: "bg-medium-bg text-medium border-medium-border",
  low: "bg-low-bg text-low border-low-border",
  flag: "bg-urgent-bg text-urgent border-urgent-border",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block font-mono text-[11px] px-[7px] py-[2px] rounded-[3px] border whitespace-nowrap",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
