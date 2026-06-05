/**
 * components/ui/Button.tsx
 * Reusable button with variant and size support.
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // base
          "inline-flex items-center justify-content-center font-sans font-medium whitespace-nowrap transition-all",
          "disabled:opacity-35 disabled:cursor-not-allowed",
          // size
          size === "md" && "h-[34px] px-4 text-[13px] rounded-[5px]",
          size === "sm" && "h-[26px] px-3 text-[11px] rounded-[4px] font-mono",
          // variant
          variant === "primary" &&
            "bg-[#1c1c1c] text-white border border-[#1c1c1c] hover:opacity-80 active:opacity-70",
          variant === "secondary" &&
            "bg-surface text-[#555] border border-border hover:border-border-strong",
          variant === "ghost" &&
            "bg-transparent text-[#aaa] border border-border hover:text-[#555] hover:border-border-strong",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
