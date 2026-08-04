declare global {
  interface Window { Razorpay: any; }
}

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  amount: number;
  description: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
  notes?: Record<string, string>;
  onSuccess: (payment: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
}

const BASE = import.meta.env.BASE_URL || "/";
const API = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;

export async function openRazorpay(opts: RazorpayOptions) {
  const loaded = await loadScript();
  if (!loaded) throw new Error("Razorpay SDK failed to load");

  const res = await fetch(`${API}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: opts.amount, notes: opts.notes || {} }),
  });
  if (!res.ok) throw new Error("Failed to create payment order");

  const { order_id, key_id } = await res.json();

  const rzp = new window.Razorpay({
    key: key_id,
    order_id,
    amount: opts.amount,
    currency: "INR",
    name: "Packworkz",
    description: opts.description,
    prefill: {
      name: opts.prefillName || "",
      email: opts.prefillEmail || "",
      contact: opts.prefillContact || "",
    },
    notes: opts.notes || {},
    theme: { color: "#1B6CA8" },
    handler: async (payment: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
      const verify = await fetch(`${API}/api/payments/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });
      if (!verify.ok) throw new Error("Payment verification failed");
      opts.onSuccess(payment);
    },
    modal: { ondismiss: opts.onDismiss },
  });

  rzp.open();
}

export type PreparedOrderPayment = {
  status: "ready" | "manual_confirmation" | "gateway_not_configured" | "already_paid";
  quote_id: string;
  order_id?: string;
  razorpay_order_id?: string;
  key_id?: string;
  amount?: number;
  amount_rupees: number;
  discount_rupees?: number;
  promotion_code?: string;
  currency?: string;
  message?: string;
  recovery_mode?: boolean;
};

export async function prepareOrderPayment(quoteId: string, checkoutToken?: string | null): Promise<PreparedOrderPayment> {
  const response = await fetch(`${API}/api/payments/prepare-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quote_id: quoteId, checkout_token: checkoutToken || undefined }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not prepare payment");
  return data;
}

export async function openOrderPayment(opts: {
  prepared: PreparedOrderPayment;
  name?: string;
  email?: string;
  contact?: string;
  description: string;
  onSuccess: (result: { order_id: string; payment_id: string }) => void;
  onDismiss?: () => void;
  onError?: (message: string) => void;
}) {
  const { prepared } = opts;
  if (prepared.status !== "ready" || !prepared.razorpay_order_id || !prepared.key_id || !prepared.amount) {
    throw new Error("This order is not ready for online payment");
  }
  const loaded = await loadScript();
  if (!loaded) throw new Error("Razorpay checkout could not load");

  const checkout = new window.Razorpay({
    key: prepared.key_id,
    order_id: prepared.razorpay_order_id,
    amount: prepared.amount,
    currency: prepared.currency || "INR",
    name: "Packworkz",
    description: opts.description,
    prefill: { name: opts.name || "", email: opts.email || "", contact: opts.contact || "" },
    notes: { quote_id: prepared.quote_id, order_id: prepared.order_id || "" },
    theme: { color: "#E8A838" },
    modal: { ondismiss: opts.onDismiss },
    handler: async (payment: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
      try {
        const response = await fetch(`${API}/api/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payment, quote_id: prepared.quote_id }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error(result.error || "Payment verification failed");
        opts.onSuccess({ order_id: result.order_id, payment_id: payment.razorpay_payment_id });
      } catch (error) {
        opts.onError?.(error instanceof Error ? error.message : "Payment verification failed");
      }
    },
  });

  checkout.on?.("payment.failed", (response: any) => {
    opts.onError?.(response?.error?.description || "Payment was not completed. You can retry safely.");
  });

  checkout.open();
}
