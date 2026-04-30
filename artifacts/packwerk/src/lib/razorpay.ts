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
    handler: opts.onSuccess,
    modal: { ondismiss: opts.onDismiss },
  });

  rzp.open();
}
