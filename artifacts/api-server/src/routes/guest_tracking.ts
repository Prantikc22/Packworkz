import { Router, type IRouter, type Request } from "express";
import { contactMatches, findCustomerReference } from "../lib/customerHistory";

const router: IRouter = Router();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 12;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(req: Request): boolean {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

router.post("/orders/guest-track", async (req, res): Promise<void> => {
  if (isRateLimited(req)) {
    res.status(429).json({ error: "Too many attempts. Please wait a few minutes and try again." });
    return;
  }

  const reference = String(req.body?.reference || "").trim().toUpperCase();
  const contact = String(req.body?.contact || "").trim();
  const genericError = "We could not verify that order. Check the reference and checkout email or mobile.";

  if (!reference || reference.length > 64 || !contact || contact.length > 160) {
    res.status(400).json({ error: genericError });
    return;
  }

  let order;
  let quote;
  try {
    ({ order, quote } = await findCustomerReference(reference));
  } catch (error) {
    console.error("[orders/guest-track] Tracking lookup failed:", error);
    res.status(503).json({
      error: "Order tracking is temporarily unavailable. Your order is safe; please try again shortly.",
    });
    return;
  }

  if (!quote || !contactMatches(contact, quote.email, quote.phone)) {
    res.status(404).json({ error: genericError });
    return;
  }

  const items = Array.isArray(order?.items) && order.items.length > 0
    ? order.items
    : Array.isArray(quote.items) ? quote.items : [];
  const firstItem = items[0] || {};

  res.json({
    reference: order?.order_id || quote.quote_id,
    quote_reference: quote.quote_id,
    status: order?.status || quote.status || "submitted",
    product_name: firstItem.product_name || "Packaging order",
    quantity: firstItem.quantity || null,
    quantity_unit: firstItem.quantity_unit || "pieces",
    total_price: order?.total_price ? Number(order.total_price) : null,
    estimated_delivery: order?.estimated_delivery || null,
    tracking_number: order?.tracking_number || null,
    tracking_url: order?.tracking_url || null,
    updated_at: order?.created_at || quote.created_at,
  });
});

export default router;
