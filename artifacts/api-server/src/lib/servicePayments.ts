// Fixed-price service payments (sample kit, design, Launch Desk, Verified badge).
//
// A paid service must never depend on the visitor's browser finishing a second
// request. Every path — client verify, the client's pending poll, the Razorpay
// webhook and the admin sync — calls finalizeServicePayment(), which rebuilds
// the record from the Razorpay order notes and is safe to call repeatedly.
import type Razorpay from "razorpay";
import { sb } from "./supabase";
import { generateId } from "./generateId";
import { notifySlack } from "./slack";
import { sendSampleConfirmation } from "./email";

export const SERVICE_AMOUNTS: Record<string, number> = {
  design: 199_900,
  sample_kit: 39_900,
  launch_desk: 1_499_900,
  factory_verified: 499_900,
};

const LABELS: Record<string, string> = {
  design: "Design service",
  sample_kit: "Sample kit",
  launch_desk: "Launch Desk",
  factory_verified: "Verified factory badge",
};

/** Order note keys the browser may attach; Razorpay allows 15 keys of 256 chars. */
const NOTE_KEYS = ["service", "reference", "contact_name", "email", "phone", "pincode", "address", "note", "company"];

export function cleanServiceNotes(input: unknown): Record<string, string> {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const notes: Record<string, string> = {};
  for (const key of NOTE_KEYS) {
    const value = String(source[key] ?? "").replace(/\s+/g, " ").trim().slice(0, 250);
    if (value) notes[key] = value;
  }
  return notes;
}

export type ServicePaymentResult =
  | { status: "recorded" | "duplicate"; service: string; ledgerId?: string; sampleId?: string }
  | { status: "pending" | "ignored"; service?: string; reason?: string };

type Details = Partial<Record<"contact_name" | "email" | "phone" | "pincode" | "address" | "note" | "company", string>>;

export async function finalizeServicePayment(
  razorpay: Razorpay,
  orderId: string,
  paymentId: string,
  options: { details?: Details; sendEmail?: boolean; via?: string } = {},
): Promise<ServicePaymentResult> {
  const [payment, order] = await Promise.all([razorpay.payments.fetch(paymentId), razorpay.orders.fetch(orderId)]);
  if (String(payment.order_id || "") !== orderId) return { status: "ignored", reason: "order_mismatch" };
  // Payment notes mirror the order's; older checkouts only kept some keys on one of them.
  const notes = { ...((payment.notes || {}) as Record<string, string>), ...((order.notes || {}) as Record<string, string>) };
  const service = String(notes.service || "");
  const amount = SERVICE_AMOUNTS[service];
  if (!amount) return { status: "ignored", reason: "not_a_service_payment" };
  if (Number(order.amount) !== amount || Number(payment.amount) !== amount) return { status: "ignored", service, reason: "amount_mismatch" };
  if (payment.status !== "captured") return { status: "pending", service };

  const details = options.details || {};
  const pick = (key: keyof Details, fallback = "") => String(notes[key] || details[key] || fallback).trim();
  const contactName = pick("contact_name") || "Customer (from Razorpay)";
  const email = pick("email", String(payment.email || "")).toLowerCase();
  const phone = pick("phone", String(payment.contact || ""));
  const address = pick("address");
  const pincode = pick("pincode");
  const note = pick("note");
  const reference = String(notes.reference || "");
  const rupees = amount / 100;

  // Ledger row in the leads table: the idempotency key and the admin trail.
  const existing = await sb
    .from("quote_requests")
    .select("quote_id")
    .filter("items", "cs", JSON.stringify([{ metadata: { kind: "service_payment", payment_id: paymentId } }]))
    .maybeSingle();
  if (existing.data) {
    const sample = service === "sample_kit"
      ? await sb.from("sample_requests").select("sample_id").eq("razorpay_payment_id", paymentId).maybeSingle()
      : null;
    return { status: "duplicate", service, ledgerId: existing.data.quote_id, sampleId: sample?.data?.sample_id };
  }

  let sampleId: string | undefined;
  if (service === "sample_kit") {
    const found = await sb.from("sample_requests").select("sample_id").eq("razorpay_payment_id", paymentId).maybeSingle();
    sampleId = found.data?.sample_id;
    if (!sampleId) {
      sampleId = await generateId("SAM", "sample_requests", "sample_id");
      const { error } = await sb.from("sample_requests").insert({
        sample_id: sampleId,
        contact_name: contactName,
        email: email || "unknown@packworkz.invalid",
        phone: phone || "Not provided",
        product_id: null,
        sample_tier: "kit",
        amount_paid: rupees,
        razorpay_payment_id: paymentId,
        status: "paid",
        // sample_requests has no notes column; shipping details live on the
        // payment ledger row below and are joined in by /admin/samples.
      });
      if (error) throw new Error(`sample_requests insert failed: ${error.message}`);
    }
  }

  // Launch Desk and Verified pay against an existing lead.
  if (reference && (service === "launch_desk" || service === "factory_verified")) {
    const { data: lead } = await sb.from("quote_requests").select("id, items, admin_notes").eq("quote_id", reference).maybeSingle();
    if (lead) {
      const items = Array.isArray(lead.items) ? lead.items : [];
      const first = items[0] || {};
      first.metadata = { ...(first.metadata || {}), paid_service: service, payment_id: paymentId, paid_at: new Date().toISOString() };
      items[0] = first;
      await sb.from("quote_requests").update({ items, admin_notes: `${lead.admin_notes || ""}\nPAID ${service} ₹${rupees} · ${paymentId}`.trim() }).eq("id", lead.id);
    }
  }

  const ledgerId = await generateId("INQ", "quote_requests", "quote_id");
  const subject = `[Payment] ${LABELS[service]} · ₹${rupees.toLocaleString("en-IN")}${sampleId ? ` · ${sampleId}` : ""}`;
  const message = [
    `${LABELS[service]} paid ₹${rupees.toLocaleString("en-IN")} (Razorpay ${paymentId}, order ${orderId}).`,
    sampleId ? `Sample request: ${sampleId}` : "",
    reference ? `For request: ${reference}` : "",
    address ? `Ship to: ${address}${pincode ? `, ${pincode}` : ""}` : pincode ? `Pincode: ${pincode} (full address not captured)` : "",
    note ? `Note: ${note}` : "",
  ].filter(Boolean).join("\n");
  await sb.from("quote_requests").insert({
    quote_id: ledgerId,
    contact_name: contactName,
    company_name: pick("company") || "Not provided",
    email: email || `unknown+${ledgerId.toLowerCase()}@packworkz.invalid`,
    phone: phone || "Not provided",
    items: [{ source: "service_payment", subject, message, metadata: { kind: "service_payment", service, payment_id: paymentId, order_id: orderId, amount: rupees, reference: reference || null, sample_id: sampleId || null, address, pincode, note, via: options.via || "server" } }],
    delivery_country: "India",
    preferred_timeline: "inquiry",
    notes: message,
    status: "lead",
    delivery_pincode: pincode || null,
    admin_notes: `Source: Service payment (${options.via || "server"})${address ? "" : "\nShipping address NOT captured — contact the customer"}`,
  });

  await Promise.allSettled([
    notifySlack({
      source: "Razorpay",
      title: `${LABELS[service]} paid · ₹${rupees.toLocaleString("en-IN")}`,
      referenceId: sampleId || reference || ledgerId,
      summary: message,
      fields: [
        { label: "Customer", value: contactName },
        { label: "Email", value: email || undefined },
        { label: "Phone", value: phone || undefined },
        { label: "Payment", value: paymentId },
      ],
    }),
    options.sendEmail && sampleId && email
      ? sendSampleConfirmation({ to: email, name: contactName, sampleId, sampleTier: "kit", amountPaid: rupees })
      : Promise.resolve(),
  ]);

  return { status: "recorded", service, ledgerId, sampleId };
}
