import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, LockKeyhole, PackageCheck } from "lucide-react";
import { useSubmitQuote } from "@workspace/api-client-react";
import { LAUNCH_PROMOTION_CODE, RAZORPAY_PAYMENT_LIMIT_RUPEES } from "@workspace/commerce";
import { CATALOG_SKUS } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { getCartCheckoutDecision, getCartConfigurationDetails, getCartEstimate, useCart } from "@/lib/cart";
import { openOrderPayment, prepareOrderPayment } from "@/lib/razorpay";
import { useToast } from "@/hooks/use-toast";

type CheckoutForm = {
  contactName: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
};

const emptyForm: CheckoutForm = { contactName: "", company: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", gstin: "" };

function loadCheckoutForm(): CheckoutForm {
  if (typeof window === "undefined") return emptyForm;
  try {
    const saved = JSON.parse(sessionStorage.getItem("packworkz_checkout_prefill") || "{}") as Partial<CheckoutForm>;
    return { ...emptyForm, ...saved, address: "", city: "", state: "", pincode: "" };
  } catch {
    return emptyForm;
  }
}

export default function CartCheckout() {
  const { items, clearCart } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const submitQuote = useSubmitQuote();
  const [form, setForm] = useState<CheckoutForm>(loadCheckoutForm);
  const [launchingPayment, setLaunchingPayment] = useState(false);
  const submissionLock = useRef(false);
  const rows = useMemo(() => items.flatMap((item) => {
    const sku = CATALOG_SKUS.find((entry) => entry.code === item.skuCode);
    return sku ? [{ item, sku, estimate: getCartEstimate(item, sku) }] : [];
  }), [items]);
  const unresolvedItems = useMemo(() => items.filter((item) => !CATALOG_SKUS.some((sku) => sku.code === item.skuCode)), [items]);
  const checkoutDecision = useMemo(() => getCartCheckoutDecision(rows), [rows]);
  const total = rows.reduce((sum, row) => sum + row.estimate.high, 0);
  const quoteRequired = checkoutDecision.requiresQuote;
  const quoteReason = checkoutDecision.hasManagedItem
    ? "This cart contains at least one managed-quote item. We will review the complete cart together; no item will be charged separately."
    : checkoutDecision.reason === "payment_limit"
      ? `The combined cart is above ${formatINR(RAZORPAY_PAYMENT_LIMIT_RUPEES)}, so the complete cart moves to a reviewed quote. Nothing is charged now.`
      : "This cart needs a specification review before payment. Nothing is charged when you submit it.";

  const update = (key: keyof CheckoutForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submissionLock.current) return;
    if (!rows.length) return navigate("/cart");
    if (unresolvedItems.length) {
      toast({ variant: "destructive", title: "Review unavailable cart items", description: "One or more saved products are no longer available. Return to the cart and remove them before continuing." });
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      toast({ variant: "destructive", title: "Check your pincode", description: "Enter a valid 6-digit Indian delivery pincode." });
      return;
    }
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(form.gstin.trim().toUpperCase())) {
      toast({ variant: "destructive", title: "Check your GSTIN", description: "Enter a valid 15-character GSTIN or leave it blank." });
      return;
    }

    submissionLock.current = true;
    setLaunchingPayment(true);
    submitQuote.mutate({
      data: {
        contact_name: form.contactName,
        company_name: form.company,
        email: form.email,
        phone: form.phone,
        delivery_country: "India",
        delivery_pincode: form.pincode.trim(),
        preferred_timeline: "standard",
        notes: [
          form.gstin ? `GSTIN: ${form.gstin.trim().toUpperCase()}` : "",
          `Delivery address: ${form.address.trim()}`,
          `Delivery city: ${form.city.trim()}`,
          `Delivery state: ${form.state.trim()}`,
          `Delivery pincode: ${form.pincode.trim()}`,
          "Multi-item online cart",
        ].filter(Boolean).join("\n"),
        total_estimated_min: total,
        total_estimated_max: total,
        items: rows.map(({ item, sku }) => ({
          product_id: sku.id,
          sku_code: sku.code,
          product_name: sku.name,
          category: sku.category,
          quantity: item.quantity,
          quantity_unit: item.quantityUnit,
          artwork_status: item.artworkOption || "upload",
          artwork_file_url: item.artworkFileUrl || undefined,
          variant_selections: { ...item.variantSelections, promotion_code: LAUNCH_PROMOTION_CODE },
          custom_specs: { ...item.customSpecs, standard_size: item.sizeCode },
          sample_requested: Boolean(item.sampleOption && item.sampleOption !== "none"),
          sample_tier: item.sampleOption === "express" ? "premium" : item.sampleOption || "none",
          design_paid: false,
          sample_paid: false,
        })),
        artwork_option: "upload",
        sample_option: "none",
        design_paid: false,
        sample_paid: false,
        buying_mode: quoteRequired ? "assisted" : "self",
      } as any,
    }, {
      onSuccess: async (result) => {
        const response = result as typeof result & { checkout_token?: string };
        const confirmationPath = `/configure/confirmed/${response.quote_id}?mode=${quoteRequired ? "assisted" : "self"}`;
        if (response.checkout_token) sessionStorage.setItem(`packworkz_checkout_${response.quote_id}`, response.checkout_token);
        if (quoteRequired) {
          clearCart();
          navigate(confirmationPath);
          return;
        }
        try {
          const prepared = await prepareOrderPayment(response.quote_id, response.checkout_token);
          if (prepared.status === "already_paid") {
            clearCart();
            navigate(confirmationPath);
            return;
          }
          if (prepared.status !== "ready") {
            clearCart();
            navigate(confirmationPath);
            return;
          }
          await openOrderPayment({
            prepared,
            name: form.contactName,
            email: form.email,
            contact: form.phone,
            description: `${rows.length} packaging ${rows.length === 1 ? "product" : "products"} · ${response.quote_id}`,
            onSuccess: ({ order_id }) => {
              sessionStorage.setItem(`packworkz_paid_${response.quote_id}`, JSON.stringify({ orderId: order_id, recoveryMode: Boolean(prepared.recovery_mode) }));
              clearCart();
              setLaunchingPayment(false);
              navigate(confirmationPath);
            },
            onPending: ({ order_id, recovery_mode }) => {
              sessionStorage.setItem(`packworkz_pending_${response.quote_id}`, JSON.stringify({ orderId: order_id, recoveryMode: recovery_mode, amount: prepared.amount_rupees }));
              clearCart();
              setLaunchingPayment(false);
              navigate(`${confirmationPath}&payment=processing`);
            },
            onDismiss: () => {
              setLaunchingPayment(false);
              navigate(`${confirmationPath}&payment=cancelled`);
            },
            onError: (message) => {
              setLaunchingPayment(false);
              toast({ variant: "destructive", title: "Payment was not completed", description: `${message} Your order is saved and can be paid safely from the next screen.` });
              navigate(`${confirmationPath}&payment=failed`);
            },
          });
        } catch {
          setLaunchingPayment(false);
          toast({ variant: "destructive", title: "Secure checkout could not open", description: "Your order is saved. Retry payment safely from the next screen." });
          navigate(`${confirmationPath}&payment=unavailable`);
        }
      },
      onError: () => {
        submissionLock.current = false;
        setLaunchingPayment(false);
        toast({ variant: "destructive", title: "Checkout could not be created", description: "Nothing was charged. Please check your details and try again." });
      },
    });
  };

  if (!rows.length) {
    return <main className="min-h-[72vh] bg-slate-50 px-5 pb-20 pt-40 text-center"><PackageCheck className="mx-auto h-12 w-12 text-blue" /><h1 className="mt-5 text-4xl font-black text-navy">Your cart is empty.</h1><Link href="/products" className="mt-7 inline-block bg-amber px-7 py-4 font-black text-navy">Shop packaging</Link></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-36 md:px-6">
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <Link href="/cart" className="inline-flex items-center gap-2 font-bold text-blue"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-blue">Secure checkout</p>
          <h1 className="mt-2 text-4xl font-black text-navy md:text-6xl">Where should we deliver?</h1>
          <p className="mt-3 text-lg text-muted">No account required. We use these details for your invoice, delivery, and guest order tracking.</p>
          <div className="mt-9 grid gap-5 border border-slate-200 bg-white p-5 md:grid-cols-2 md:p-8">
            {([
              ["contactName", "Contact name", "Prantik Sharma", "text"], ["company", "Brand or company", "Your brand", "text"],
              ["email", "Email", "you@company.com", "email"], ["phone", "Mobile / WhatsApp", "98XXXXXXXX", "tel"],
              ["address", "Delivery address", "Building and street", "text"], ["city", "City", "Kolkata", "text"],
              ["state", "State", "West Bengal", "text"], ["pincode", "Pincode", "700001", "text"],
            ] as const).map(([key, label, placeholder, type]) => (
              <label key={key} className="text-sm font-bold text-navy">{label}<input required value={form[key]} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} type={type} className="mt-2 h-12 w-full border border-slate-300 bg-white px-4 text-base font-medium outline-none focus:border-blue" /></label>
            ))}
            <label className="text-sm font-bold text-navy md:col-span-2">GSTIN <span className="font-normal text-muted">(optional)</span><input value={form.gstin} onChange={(event) => update("gstin", event.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" className="mt-2 h-12 w-full border border-slate-300 bg-white px-4 text-base font-medium uppercase outline-none focus:border-blue" /></label>
          </div>
        </section>

        <aside className="h-fit border border-navy bg-navy p-6 text-white lg:sticky lg:top-32">
          <h2 className="text-2xl font-black">Order summary</h2>
          <div className="mt-5 divide-y divide-white/15 border-y border-white/15">
            {rows.map(({ item, estimate }) => {
              const configuration = getCartConfigurationDetails(item);
              return <div key={item.id} className="flex gap-3 py-4"><img src={item.image} alt="" className="h-16 w-16 object-cover" /><div className="min-w-0 flex-1"><p className="font-bold">{item.productName}</p><p className="text-sm text-white/55">{item.quantity.toLocaleString("en-IN")} {item.quantityUnit} · {item.sizeLabel}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{configuration.map(({ value }) => value).join(" · ")}</p></div><strong>{formatINR(estimate.high)}</strong></div>;
            })}
          </div>
          <div className="flex items-end justify-between py-6"><span className="font-bold">Payable estimate</span><strong className="text-3xl">{formatINR(total)}</strong></div>
          <button disabled={launchingPayment || submitQuote.isPending || unresolvedItems.length > 0} className="flex h-14 w-full items-center justify-center gap-3 bg-amber px-5 text-lg font-black text-navy hover:bg-[#d99a29] disabled:cursor-wait disabled:opacity-60">
            <LockKeyhole className="h-5 w-5" /> {unresolvedItems.length ? "Review cart first" : launchingPayment || submitQuote.isPending ? (quoteRequired ? "Sending quote request..." : "Opening secure payment...") : quoteRequired ? "Request one quote" : "Pay securely"}
          </button>
          <p className="mt-4 text-sm leading-6 text-white/55">{unresolvedItems.length ? "A saved product is no longer available. Return to the cart and remove it so nothing is omitted from your request." : quoteRequired ? quoteReason : "Razorpay opens directly after your delivery details are saved. The server rechecks every line and the combined total before creating a payment."}</p>
        </aside>
      </form>
    </main>
  );
}
