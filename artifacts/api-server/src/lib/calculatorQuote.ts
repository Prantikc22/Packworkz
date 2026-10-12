// Normalises a price-calculator lead (sent by /calculators/*) into the shape the
// emails use. Values come from the browser, so everything is clipped and the
// order link is rebuilt on our own domain.
import type { CalculatorQuote } from "./email";

const SITE_URL = "https://packworkz.com";
const clip = (value: unknown, max = 120) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const num = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function readCalculatorQuote(metadata: Record<string, unknown>): CalculatorQuote | null {
  const product = clip(metadata.product);
  const quantity = num(metadata.quantity);
  if (!product || !quantity) return null;
  const path = clip(metadata.order_path, 900);
  const safePath = /^\/(configure|procurement-plan)\?[\w%=&.,:+\-~]*$/.test(path) ? path : "/calculators";
  const rawOptions = metadata.options && typeof metadata.options === "object" ? (metadata.options as Record<string, unknown>) : {};
  const options = Object.fromEntries(Object.entries(rawOptions).slice(0, 8).map(([k, v]) => [clip(k, 40), clip(v, 80)]).filter(([k, v]) => k && v));
  return {
    product,
    size: clip(metadata.size) || undefined,
    quantity,
    unitLabel: clip(metadata.unit_label, 20) || "pcs",
    options,
    unitPrice: num(metadata.unit_price),
    total: num(metadata.total),
    exact: metadata.exact === true,
    orderUrl: `${SITE_URL}${safePath}`,
  };
}

export function calculatorWhatsAppLink(phone: string, name: string, quote: CalculatorQuote) {
  let digits = phone.replace(/\D/g, "").replace(/^00/, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 11) return undefined;
  const text = `Hi ${name.split(" ")[0] || "there"}, this is Packworkz. You priced ${quote.quantity.toLocaleString("en-IN")} ${quote.unitLabel} of ${quote.product}${quote.total ? ` (₹${Math.round(quote.total).toLocaleString("en-IN")})` : ""} on our calculator. Happy to help with material, size or a free 3D mockup of your design.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
