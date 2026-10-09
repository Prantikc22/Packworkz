import { useEffect, useState } from "react";
import { listingToManufacturer, normaliseLocation, parseRequirementLocally, SEED_MANUFACTURERS, type CategoryId, type Manufacturer, type ParsedRequirement } from "@/lib/manufacturers";
import { openRazorpay, waitForServicePayment } from "@/lib/razorpay";

export const LAUNCH_DESK_PAISE = 1_499_900;
export const VERIFIED_PAISE = 499_900;

/** AI parse first; anything missing or failing falls back to the local parser. */
export async function parseRequirement(query: string): Promise<ParsedRequirement> {
  const local = parseRequirementLocally(query);
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 10_000);
    const response = await fetch("/api/manufacturing/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    }).finally(() => window.clearTimeout(timer));
    const body = await response.json().catch(() => ({}));
    const ai = body?.parsed;
    if (!response.ok || !ai) return local;
    // Only keep standards the brief actually mentions; models like to add FSSAI by default.
    const said = query.toLowerCase().replace(/[-\s]/g, "");
    const certs = Array.isArray(ai.certifications) ? ai.certifications.filter((cert: string) => said.includes(String(cert).toLowerCase().replace(/[-\s]/g, ""))) : [];
    return {
      category: (ai.category as CategoryId) || local.category,
      product: ai.product || local.product,
      monthlyUnits: Number.isFinite(Number(ai.monthly_units)) && ai.monthly_units ? Number(ai.monthly_units) : local.monthlyUnits,
      certifications: certs.length ? certs : local.certifications,
      services: Array.isArray(ai.services) && ai.services.length ? ai.services : local.services,
      location: normaliseLocation(ai.location) || local.location,
      packaging: ai.packaging || local.packaging,
      summary: ai.summary || local.summary,
      ai: true,
    };
  } catch {
    return local;
  }
}

/** Seeded profiles plus every self-listed factory an admin has approved. */
export function useManufacturerPool(): Manufacturer[] {
  const [extra, setExtra] = useState<Manufacturer[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/manufacturing/listings")
      .then((response) => (response.ok ? response.json() : { listings: [] }))
      .then((body) => { if (alive) setExtra((body.listings || []).map(listingToManufacturer)); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, []);
  // A claimed profile replaces the seeded one with the same slug.
  const claimed = new Set(extra.map((m) => m.slug));
  return [...extra, ...SEED_MANUFACTURERS.filter((m) => !claimed.has(m.slug))];
}

/** Opens Razorpay for a fixed-price manufacturing service and records it against the lead. */
export function payForService(opts: {
  service: "launch_desk" | "factory_verified";
  inquiryId: string;
  name: string;
  email: string;
  phone: string;
  onDone: (state: "paid" | "pending") => void;
  onError: (message: string) => void;
}) {
  const amount = opts.service === "launch_desk" ? LAUNCH_DESK_PAISE : VERIFIED_PAISE;
  return openRazorpay({
    amount,
    description: opts.service === "launch_desk" ? "Packworkz Launch Desk" : "Packworkz Verified factory",
    prefillName: opts.name,
    prefillEmail: opts.email,
    prefillContact: opts.phone,
    notes: { service: opts.service, reference: opts.inquiryId, contact_name: opts.name, email: opts.email, phone: opts.phone },
    onSuccess: async (payment) => {
      await fetch("/api/manufacturing/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry_id: opts.inquiryId, razorpay_payment_id: payment.razorpay_payment_id }),
      }).catch(() => undefined);
      opts.onDone("paid");
    },
    onPending: async (payment) => {
      opts.onDone("pending");
      const result = await waitForServicePayment(payment);
      if (result) opts.onDone("paid");
    },
    onError: opts.onError,
  });
}
