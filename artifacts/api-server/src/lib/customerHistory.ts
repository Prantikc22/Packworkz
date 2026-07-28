import { sb } from "./supabase";

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function contactMatches(contact: string, email?: string | null, phone?: string | null): boolean {
  const normalized = contact.trim().toLowerCase();
  if (normalized.includes("@")) return normalized === String(email || "").trim().toLowerCase();
  const submittedPhone = normalizePhone(normalized);
  return submittedPhone.length >= 10 && submittedPhone === normalizePhone(String(phone || ""));
}

export type CustomerReference = {
  order: Record<string, any> | null;
  quote: Record<string, any> | null;
};

export async function findCustomerReference(reference: string): Promise<CustomerReference> {
  let order: Record<string, any> | null = null;
  let quote: Record<string, any> | null = null;

  const { data: orderByReference, error: orderLookupError } = await sb
    .from("orders")
    .select("id,order_id,quote_request_id,user_id,items,total_price,status,estimated_delivery,tracking_number,tracking_url,created_at")
    .eq("order_id", reference)
    .maybeSingle();
  if (orderLookupError) throw orderLookupError;

  order = orderByReference;

  if (order?.quote_request_id) {
    const { data, error } = await sb
      .from("quote_requests")
      .select("id,quote_id,user_id,email,phone,items,status,created_at")
      .eq("id", order.quote_request_id)
      .maybeSingle();
    if (error) throw error;
    quote = data;
  } else {
    const { data, error } = await sb
      .from("quote_requests")
      .select("id,quote_id,user_id,email,phone,items,status,created_at")
      .eq("quote_id", reference)
      .maybeSingle();
    if (error) throw error;
    quote = data;

    if (quote) {
      const { data: linkedOrder, error: linkedOrderError } = await sb
        .from("orders")
        .select("id,order_id,quote_request_id,user_id,items,total_price,status,estimated_delivery,tracking_number,tracking_url,created_at")
        .eq("quote_request_id", quote.id)
        .maybeSingle();
      if (linkedOrderError) throw linkedOrderError;
      order = linkedOrder;
    }
  }

  return { order, quote };
}

export async function claimCustomerReference(userId: string, reference: string, contact: string): Promise<CustomerReference | null> {
  const found = await findCustomerReference(reference);
  if (!found.quote || !contactMatches(contact, found.quote.email, found.quote.phone)) return null;

  if (found.quote.user_id && found.quote.user_id !== userId) return null;
  if (found.order?.user_id && found.order.user_id !== userId) return null;

  if (!found.quote.user_id) {
    const { error } = await sb
      .from("quote_requests")
      .update({ user_id: userId })
      .eq("id", found.quote.id)
      .is("user_id", null);
    if (error) throw error;
  }

  if (found.order && !found.order.user_id) {
    const { error } = await sb
      .from("orders")
      .update({ user_id: userId })
      .eq("id", found.order.id)
      .is("user_id", null);
    if (error) throw error;
  }

  return found;
}
