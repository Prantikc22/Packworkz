// quote_requests.delivery_date is a Postgres `date`, but admins quote either a
// calendar date ("1 October 2026") or a lead time ("4 weeks"). The column keeps
// the real date when there is one; the text exactly as quoted lives on
// items[0].metadata.delivery_label so lead times never break the save.

/** ISO date for text that names a calendar day with a year, otherwise null. */
export function toCalendarDate(value: unknown): string | null {
  const text = String(value ?? "").trim();
  if (!text || !/\b\d{4}\b/.test(text)) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(`${text} 12:00 UTC`);
  if (Number.isNaN(parsed.getTime())) {
    const loose = new Date(text);
    return Number.isNaN(loose.getTime()) ? null : loose.toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

/** The delivery promise as the admin wrote it, for display. */
export function deliveryLabel(quote: any, adminMeta: Record<string, any> = {}): string | null {
  const items = Array.isArray(quote?.items) ? quote.items : [];
  return items[0]?.metadata?.delivery_label || quote?.delivery_date || adminMeta.delivery_date || null;
}

/** Items array with the delivery label set (or cleared). */
export function withDeliveryLabel(items: unknown, label: string | null): any[] {
  const list = Array.isArray(items) ? [...items] : [];
  const first = { ...(list[0] || {}) };
  const metadata = { ...(first.metadata || {}) };
  if (label) metadata.delivery_label = label;
  else delete metadata.delivery_label;
  first.metadata = metadata;
  list[0] = first;
  return list;
}
