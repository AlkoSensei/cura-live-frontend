import type { ExtractedFields } from "@/types/call";

export function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export const USD_TO_INR = 94.90;

export function formatCostINR(usd: number): string {
  return `₹${(usd * USD_TO_INR).toFixed(2)}`;
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 4
  }).format(value);
}

export function formatDateTime(date?: string | null, time?: string | null) {
  if (!date && !time) {
    return "Not captured";
  }

  return [date, time].filter(Boolean).join(" at ");
}

export function labelFromIntent(intent?: string | null) {
  if (!intent) {
    return "Clinic call";
  }

  return intent
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getField(fields: ExtractedFields | null | undefined, key: keyof ExtractedFields) {
  return fields?.[key] || "Not captured";
}
