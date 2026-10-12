// Mirrors api-server/src/lib/paymentTerms.ts — keep the two in step.
export const DEFAULT_ADVANCE_PERCENT = 70;
export const DEFAULT_PAYMENT_TERMS = "70% advance, 30% before dispatch after QC";

/**
 * Advance share named in free-text payment terms. The number written directly
 * before "advance" wins, so "70% advance, 30% on delivery" reads as 70, not
 * the 30 that follows the keyword.
 */
export function advancePercent(terms?: string | null): number {
  const text = String(terms || "").trim();
  if (!text) return DEFAULT_ADVANCE_PERCENT;
  if (/\b(net[- ]?\d+|credit)\b/i.test(text) && !/advance/i.test(text)) return 0;
  const match = text.match(/(\d+(?:\.\d+)?)\s*%[^,;.%\d]{0,20}(?:advance|upfront|before production)/i)
    || text.match(/(?:advance|upfront)\s*[:(\-–—]?\s*(?:of\s+)?(\d+(?:\.\d+)?)\s*%/i);
  const parsed = match ? Number(match[1]) : DEFAULT_ADVANCE_PERCENT;
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : DEFAULT_ADVANCE_PERCENT;
}
