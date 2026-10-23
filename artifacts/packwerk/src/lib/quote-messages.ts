// Client-facing quote messages sent from the admin quote panel (email + WhatsApp).
import { advancePercent } from "./payment-terms";

export const SALES_EMAIL = "sales@packworkz.com";
export const SALES_PHONE = "+91 82089 90366";

type QuoteMessageInput = {
  quote: any;
  quotedAmount: number | null;
  /** Price before GST and GST; when present, quotedAmount is the total incl. GST. */
  tax?: { subtotal: number; gstRate: number; gst: number } | null;
  delivery: string;
  paymentTerms: string;
  paymentLink?: string;
  dashboardUrl: string;
};

const VARIANT_LABELS: Record<string, string> = {
  material: "Material",
  finish: "Finish",
  closure: "Closure",
  window: "Window",
  hang: "Hang hole",
  print_sides: "Printing",
  base_colour: "Pouch colour",
  print: "Print",
  colours: "Colours",
  colors: "Colours",
};
const VARIANT_ORDER = ["material", "base_colour", "finish", "print_sides", "print", "colours", "colors", "closure", "window", "hang"];
const variantRank = (key: string) => (VARIANT_ORDER.indexOf(key) + 1 || VARIANT_ORDER.length + 1);
const SKIP_VARIANTS = new Set(["promotion_code"]);
const SIZE_KEYS = ["width", "height", "depth"];
const MM_KEY = /(width|height|depth|length|repeat|gusset|diameter)$/i;

const inr = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const inrUnit = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = (key: string) => VARIANT_LABELS[key] || key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const firstName = (name?: string) => String(name || "").trim().split(/\s+/)[0] || "there";

function productLines(item: any) {
  const lines: Array<[string, string]> = [];
  const specs: Record<string, any> = item.custom_specs || {};
  // Values arrive as "80 mm" (new quotes) or "80" (older quotes, always mm).
  const [w, h, d] = SIZE_KEYS.map((key) => parseFloat(String(specs[key] ?? "")) || 0);
  if (specs.size) lines.push(["Size", String(specs.size)]);
  else if (w && h) lines.push(["Size", `${w} × ${h} mm (W × H)${d ? `, ${d} mm gusset` : ""}`]);
  const variants = Object.entries(item.variant_selections || {})
    .filter(([key, value]) => value && !SKIP_VARIANTS.has(key) && !/^(none|n\/a|-)$/i.test(String(value)))
    .sort(([a], [b]) => variantRank(a) - variantRank(b));
  for (const [key, value] of variants) lines.push([label(key), String(value)]);
  for (const [key, value] of Object.entries(specs)) {
    if (!value || SIZE_KEYS.includes(key) || key === "artwork" || key === "standard_size" || key === "size") continue;
    lines.push([label(key), `${value}${MM_KEY.test(key) && /^\d+(\.\d+)?$/.test(String(value)) ? " mm" : ""}`]);
  }
  if (specs.standard_size && !specs.size) lines.push(["Size", String(specs.standard_size)]);
  return lines;
}

function artworkNote(item: any) {
  const text = String(item.custom_specs?.artwork || item.artwork_status || "").toLowerCase();
  if (!text) return null;
  if (text.includes("after") || text.includes("later") || text.includes("send")) return "To be shared by you after order confirmation";
  if (text.includes("upload")) return "Received";
  if (text.includes("design")) return "Packworkz design service";
  return null;
}

function commercials(input: QuoteMessageInput) {
  const item = (Array.isArray(input.quote.items) ? input.quote.items[0] : null) || {};
  const quantity = Number(item.quantity) || 0;
  const unit = item.quantity_unit || "units";
  const percent = advancePercent(input.paymentTerms);
  const total = input.quotedAmount && input.quotedAmount > 0 ? input.quotedAmount : null;
  return {
    item,
    quantity,
    unit,
    percent,
    total,
    perUnit: total && quantity && unit === "units" ? (input.tax?.subtotal || total) / quantity : null,
    tax: total && input.tax ? input.tax : null,
    advance: total ? (total * percent) / 100 : null,
    balance: total ? (total * (100 - percent)) / 100 : null,
    link: /^https:\/\//.test(String(input.paymentLink || "")) ? String(input.paymentLink) : null,
  };
}

export function buildQuoteEmail(input: QuoteMessageInput) {
  const q = input.quote;
  const c = commercials(input);
  const product = c.item.product_name || "Custom packaging";
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const specs = productLines(c.item);
  const artwork = artworkNote(c.item);
  const rule = "────────────────────────────";

  const body = [
    `Dear ${firstName(q.contact_name)},`,
    ``,
    `Thank you for your enquiry. Please find our quotation for ${q.company_name || "your brand"} below.`,
    ``,
    `QUOTATION ${q.quote_id}`,
    `Date: ${today}`,
    rule,
    ``,
    `PRODUCT`,
    `${product} — ${c.quantity ? c.quantity.toLocaleString("en-IN") : "—"} ${c.unit}`,
    ...specs.map(([k, v]) => `${k}: ${v}`),
    ...(artwork ? [`Artwork: ${artwork}`] : []),
    ``,
    `PRICING`,
    ...(c.total && c.tax
      ? [
          `Price before GST: ${inr(c.tax.subtotal)}${c.perUnit ? ` (${inrUnit(c.perUnit)} per unit)` : ""}`,
          `GST (${c.tax.gstRate}%): ${inr(c.tax.gst)}`,
          `Total incl. GST: ${inr(c.total)}`,
        ]
      : c.total
        ? [`Quoted price: ${inr(c.total)}${c.perUnit ? ` (${inrUnit(c.perUnit)} per unit)` : ""}`, `GST: extra, as applicable`]
        : [`Quoted price: to be confirmed`, `GST: extra, as applicable`]),
    `Delivery charges: extra, billed at actuals`,
    ...(input.delivery ? [`Estimated delivery: ${input.delivery}`] : []),
    ``,
    `PAYMENT TERMS`,
    c.percent >= 100
      ? `100% advance${c.total ? `: ${inr(c.total)}` : ""}, to confirm the order`
      : `Advance (${c.percent}%)${c.advance ? `: ${inr(c.advance)}` : ""}, to confirm the order and begin production`,
    ...(c.percent < 100
      ? [`Balance (${100 - c.percent}%)${c.balance ? `: ${inr(c.balance)}` : ""}, before dispatch, after quality check`]
      : []),
    c.tax ? `Amounts above include GST; delivery is billed at actuals.` : `Amounts above exclude GST and delivery.`,
    rule,
    ``,
    `NEXT STEPS`,
    `1. Review and approve the quote in your dashboard:`,
    `   ${input.dashboardUrl}`,
    c.link ? `2. Pay the advance securely: ${c.link}` : `2. Pay the advance from your dashboard.`,
    `3. We begin production as soon as the advance is verified.`,
    ``,
    `If you'd like to adjust the quantity or specification, just reply to this email and we'll revise the quote.`,
    ``,
    `Warm regards,`,
    `Team Packworkz`,
    `${SALES_EMAIL} · ${SALES_PHONE} (WhatsApp)`,
    `packworkz.com`,
  ].join("\n");

  return { subject: `Packworkz quotation ${q.quote_id} · ${product}`, body };
}

export function buildQuoteWhatsApp(input: QuoteMessageInput) {
  const q = input.quote;
  const c = commercials(input);
  const product = c.item.product_name || "Custom packaging";
  const specs = productLines(c.item).map(([, v]) => v);

  return [
    `Hi ${firstName(q.contact_name)},`,
    ``,
    `Thank you for your enquiry. Here's your Packworkz quotation for ${q.company_name || "your brand"}:`,
    ``,
    `*Quote ${q.quote_id}*`,
    `*${product}* · ${c.quantity ? c.quantity.toLocaleString("en-IN") : "—"} ${c.unit}`,
    ...(specs.length ? [specs.join(" · ")] : []),
    ``,
    ...(c.total && c.tax
      ? [
          `*Price:* ${inr(c.tax.subtotal)}${c.perUnit ? ` (${inrUnit(c.perUnit)}/unit)` : ""} + GST ${c.tax.gstRate}% ${inr(c.tax.gst)}`,
          `*Total incl. GST:* ${inr(c.total)}`,
          `Delivery charges extra, at actuals`,
        ]
      : [
          c.total ? `*Price:* ${inr(c.total)}${c.perUnit ? ` (${inrUnit(c.perUnit)}/unit)` : ""}` : `*Price:* to be confirmed`,
          `GST extra · delivery charges extra, at actuals`,
        ]),
    ...(input.delivery ? [`*Estimated delivery:* ${input.delivery}`] : []),
    ``,
    `*Payment*`,
    c.percent >= 100
      ? `100% advance${c.total ? `: ${inr(c.total)}` : ""} to confirm the order`
      : `${c.percent}% advance${c.advance ? `: ${inr(c.advance)}` : ""} to confirm the order`,
    ...(c.percent < 100 ? [`${100 - c.percent}% balance${c.balance ? `: ${inr(c.balance)}` : ""} before dispatch, after QC`] : []),
    ``,
    ...(c.link ? [`Pay the advance: ${c.link}`] : []),
    `View and approve your quote: ${input.dashboardUrl}`,
    ``,
    `Production starts once the advance is received. Happy to adjust quantity or specs, just reply here.`,
    ``,
    `Team Packworkz`,
    SALES_EMAIL,
  ].join("\n");
}

/**
 * wa.me needs the full international number with no "+" or leading zero.
 * Indian numbers are often saved as "09310434605" or "9310434605".
 */
export function whatsappNumber(phone?: string | null): string {
  let digits = String(phone || "").replace(/\D/g, "").replace(/^00/, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

export function whatsappLink(phone?: string | null, text?: string): string {
  return `https://wa.me/${whatsappNumber(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
