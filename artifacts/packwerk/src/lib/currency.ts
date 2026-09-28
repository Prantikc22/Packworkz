// Display currency. Every price is stored and charged in INR; visitors outside
// India see a USD conversion. The choice is made once before the first render
// (the client uses createRoot, not hydration), so formatters can read it
// synchronously. Prerendered HTML stays in INR.

export type DisplayCurrency = "INR" | "USD";

/** Planning rate for display only. Checkout and Razorpay always charge INR. */
export const INR_PER_USD = 88;

const STORAGE_KEY = "packworkz_currency";
const INDIA_TIMEZONES = new Set(["Asia/Kolkata", "Asia/Calcutta"]);

function detectCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return "INR";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "INR" || saved === "USD") return saved;
  } catch {
    // Storage blocked: fall through to detection.
  }
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone) return INDIA_TIMEZONES.has(zone) ? "INR" : "USD";
  } catch {
    // Older browsers without timeZone support.
  }
  return "INR";
}

let current: DisplayCurrency = detectCurrency();

export function getDisplayCurrency() {
  return current;
}

export const isUsd = () => current === "USD";

/** Persist a manual choice and reload so every price re-renders consistently. */
export function setDisplayCurrency(next: DisplayCurrency) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Still switch for this page view.
  }
  current = next;
  window.location.reload();
}

export function toDisplayAmount(inr: number) {
  return current === "USD" ? inr / INR_PER_USD : inr;
}

/**
 * Format an INR amount in the visitor's currency. `fractionDigits` applies to
 * INR; USD picks enough decimals to keep small per-unit rates meaningful.
 */
export function money(inr: number, fractionDigits = 0): string {
  if (current === "INR") {
    return `₹${inr.toLocaleString("en-IN", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
  }
  const usd = inr / INR_PER_USD;
  const digits = usd >= 100 ? 0 : usd >= 1 ? 2 : 3;
  const formatted = usd.toLocaleString("en-US", { minimumFractionDigits: Math.min(digits, 2), maximumFractionDigits: digits });
  return `$${formatted}`;
}

/** Compact large amounts: ₹1.2L / ₹85k in India, $1.4k / $20k elsewhere. */
export function moneyCompact(inr: number): string {
  if (current === "INR") {
    if (inr >= 100000) return `₹${(inr / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}L`;
    return `₹${Math.round(inr / 1000).toLocaleString("en-IN")}k`;
  }
  const usd = inr / INR_PER_USD;
  if (usd >= 1000) return `$${(usd / 1000).toLocaleString("en-US", { maximumFractionDigits: usd >= 10000 ? 0 : 1 })}k`;
  return `$${Math.round(usd).toLocaleString("en-US")}`;
}

/** Always INR — for amounts that are actually charged. */
export function inr(amount: number, fractionDigits = 0) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
}

/** "Billed in INR" hint shown next to converted totals for overseas visitors. */
export function billedInInrNote(amount: number) {
  return current === "USD" ? `Billed in INR · ${inr(amount)}` : "";
}
