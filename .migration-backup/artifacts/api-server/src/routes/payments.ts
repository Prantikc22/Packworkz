import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

const router = Router();

router.post("/api/payments/create-order", async (req, res) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return res.status(503).json({ error: "Payment gateway not configured" });
  }
  try {
    const { amount, currency = "INR", notes = {} } = req.body;
    if (!amount || typeof amount !== "number" || amount < 100) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const order = await razorpay.orders.create({ amount, currency, notes });
    res.json({
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ error: err.message || "Payment order creation failed" });
  }
});

router.post("/api/payments/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Signature mismatch" });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
