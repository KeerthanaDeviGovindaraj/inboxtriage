/**
 * lib/utils.ts
 * Utility functions used across the app.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely — handles conditional classes and
 * resolves conflicts (e.g. "p-4 p-2" → "p-2").
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a cost in USD for display.
 * e.g. 0.00143 → "$0.0014"
 */
export function formatCost(usd: number): string {
  if (usd === 0) return "$0.0000";
  return "$" + usd.toFixed(4);
}

/**
 * Format processing time for display.
 * e.g. 1420 → "1.4s"
 */
export function formatDuration(ms: number): string {
  return (ms / 1000).toFixed(1) + "s";
}

/**
 * Extract subject line from raw email text.
 */
export function extractSubject(emailText: string): string {
  const match = emailText.match(/Subject:\s*(.+)/i);
  return match ? match[1].trim() : "Client email";
}

/**
 * Generate a simple unique ID for result items.
 * Not crypto-secure — just needs to be unique within a session.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
