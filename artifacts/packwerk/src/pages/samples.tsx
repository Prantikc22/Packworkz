import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  PackageOpen,
  ShieldCheck,
  SwatchBook,
  Truck,
} from "lucide-react";
import { openRazorpay } from "@/lib/razorpay";

const KIT_PRICE = 299;
const SHIPPING_PRICE = 100;
const ORDER_TOTAL = KIT_PRICE + SHIPPING_PRICE;
const ORDER_TOTAL_PAISE = ORDER_TOTAL * 100;
const BASE = import.meta.env.BASE_URL || "/";
const API = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;

const KIT_CONTENTS = [
  { Icon: PackageOpen, title: "25–50+ physical samples", text: "A wide range of structures, materials and finishes." },
  { Icon: SwatchBook, title: "Material & finish swatches", text: "Feel the difference in paper, boards, films and surface finishes." },
  { Icon: FileText, title: "Practical selection guide", text: "Tips and use-cases to help you choose the right packaging." },
  { Icon: Truck, title: "Delivered across India", text: "Flat ₹100 shipping. Straight to your doorstep." },
];

const FORMAT_CARDS = [
  { title: "Flexible packs", text: "Stand-up pouches, flat pouches, sachets and more.", image: "/categories/flexiblepacks.jpg" },
  { title: "Boxes & cartons", text: "Folding cartons, mailer boxes, rigid boxes and more.", image: "/images/flow-packaging-still-life-v2.webp" },
  { title: "Labels & materials", text: "Labels, tapes, papers, boards and specialty materials.", image: "/images/sustainability-material-layers-v1.webp" },
];

const FAQS = [
  ["Are these printed with my branding?", "The kit contains representative production samples and material swatches. Once you shortlist a format, we can scope a custom branded prototype separately."],
  ["How many samples will I receive?", "Every kit contains at least 25 pieces. Most contain 35–50+ samples depending on current format and material availability."],
  ["How much is shipping?", "Shipping is a flat ₹100 across India. The kit is ₹299, so your checkout total is ₹399."],
  ["Can I request a specific category?", "Yes. Add your preference in the order note and we will use it while curating the kit, subject to sample availability."],
];

type PaymentState = "idle" | "opening" | "pending" | "saving" | "paid" | "error";

export default function Samples() {
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [message, setMessage] = useState("");
  const [sampleId, setSampleId] = useState("");
  const [showMobileCta, setShowMobileCta] = useState(true);

  useEffect(() => {
    const order = document.getElementById("sample-kit-order");
    if (!order) return;
    const observer = new IntersectionObserver(([entry]) => setShowMobileCta(!entry.isIntersecting), { threshold: 0 });
    observer.observe(order);
    return () => observer.disconnect();
  }, []);

  const buyKit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const customer = {
      contact_name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      pincode: String(data.get("pincode") || "").trim(),
      shipping_address: String(data.get("address") || "").trim(),
      order_note: String(data.get("note") || "").trim(),
    };

    setPaymentState("opening");
    setMessage("");

    try {
      await openRazorpay({
        amount: ORDER_TOTAL_PAISE,
        description: "Packworkz Packaging Sample Kit",
        prefillName: customer.contact_name,
        prefillEmail: customer.email,
        prefillContact: customer.phone,
        notes: { service: "sample_kit", pincode: customer.pincode },
        onDismiss: () => setPaymentState("idle"),
        onPending: () => {
          setPaymentState("pending");
          setMessage("Razorpay is still confirming this payment. Please do not pay again.");
        },
        onError: (error) => {
          setPaymentState("error");
          setMessage(error);
        },
        onSuccess: async (payment) => {
          setPaymentState("saving");
          try {
            const response = await fetch(`${API}/api/sample-requests`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...customer,
                product_id: null,
                sample_tier: "kit",
                amount_paid: ORDER_TOTAL,
                razorpay_payment_id: payment.razorpay_payment_id,
                razorpay_order_id: payment.razorpay_order_id,
              }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Your payment was verified, but the sample order could not be saved.");
            setSampleId(result.sample_id || "");
            setPaymentState("paid");
            setMessage("");
          } catch (error) {
            setPaymentState("pending");
            setMessage(`Your payment was captured, but we could not finish recording your kit order. Do not pay again. Contact support with payment ID ${payment.razorpay_payment_id}. ${error instanceof Error ? error.message : ""}`);
          }
        },
      });
    } catch (error) {
      setPaymentState("error");
      setMessage(error instanceof Error ? error.message : "Secure checkout could not open.");
    }
  };

  return (
    <main className="pw-sample-page">
      <section className="pw-sample-hero">
        <div className="pw-sample-hero-copy">
          <p className="pw-sample-eyebrow">PACKAGING SAMPLE KIT</p>
          <h1>Feel 25–50+ packaging samples before choosing one.</h1>
          <p className="pw-sample-lead">Compare structures, materials, finishes and print quality at your desk. A curated Packworkz sample kit, delivered to your doorstep so you can make the right choice with confidence.</p>
          <div className="pw-sample-price"><strong>₹299</strong><span>+ ₹100 shipping<br /><small>₹399 total across India</small></span></div>
          <div className="pw-sample-actions">
            <a href="#sample-kit-order">Get the sample kit <ArrowRight size={18} /></a>
            <Link href="/products">Browse packaging</Link>
          </div>
          <div className="pw-sample-mini-proof" aria-label="Sample kit assurances">
            <span><ShieldCheck size={20} /><b>Secure checkout</b><small>Powered by Razorpay</small></span>
            <span><Truck size={20} /><b>Pan-India delivery</b><small>Flat ₹100 shipping</small></span>
            <span><Box size={20} /><b>Curated by experts</b><small>Real packaging, not swatches alone</small></span>
          </div>
        </div>
        <div className="pw-sample-hero-visual">
          <img src="/images/sample-kit-hero-v1.webp" alt="Open kraft sample box with a pouch, carton, label roll and material swatches from the Packworkz sample kit" />
          <span className="pw-sample-visual-note">Touch.<br />Compare.<br />Choose better.</span>
        </div>
      </section>

      <section className="pw-sample-included pw-reveal">
        <div className="pw-sample-section-split">
          <div className="pw-sample-section-head">
            <p>WHY A SAMPLE KIT</p>
            <h2>A curated packaging library, not random pieces.</h2>
          </div>
          <p>We’ve put together a thoughtful selection of packaging formats, materials and finishes so you can explore, compare and find what works for your brand.</p>
        </div>
        <div className="pw-sample-included-grid">
          {KIT_CONTENTS.map(({ Icon, title, text }, index) => (
            <article className={`pw-reveal pw-d${index + 1}`} key={title}><Icon size={30} strokeWidth={1.55} /><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="pw-sample-formats">
        <div className="pw-sample-formats-head pw-reveal">
          <div className="pw-sample-section-head"><p>EXPLORE WHAT’S INSIDE</p><h2>Shortlist faster when the material is in your hands.</h2></div>
          <Link href="/products">View all packaging <ArrowRight size={16} /></Link>
        </div>
        <div className="pw-sample-format-grid">
          {FORMAT_CARDS.map((card, index) => (
            <article className={`pw-reveal pw-d${index + 1}`} key={card.title}>
              <img src={card.image} alt={`${card.title} represented in the Packworkz sample kit`} loading="lazy" />
              <div><h3>{card.title}</h3><p>{card.text}</p><ArrowRight size={18} /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="pw-sample-steps">
        <div className="pw-sample-section-head pw-reveal"><p>HOW IT WORKS</p><h2>Three steps. No complicated purchase flow.</h2></div>
        <div className="pw-sample-step-grid">
          {[
            ["01", PackageOpen, "Choose your kit", "See what is included, then head to the checkout form."],
            ["02", FileText, "Enter shipping details", "Share your delivery address and contact information."],
            ["03", CreditCard, "Pay securely with Razorpay", "Complete your payment and we’ll get your kit dispatched."],
          ].map(([number, Icon, title, text], index) => {
            const StepIcon = Icon as typeof PackageOpen;
            return <article className={`pw-reveal pw-d${index + 1}`} key={String(number)}><b>{String(number)}</b><StepIcon size={27} strokeWidth={1.55} /><div><h3>{String(title)}</h3><p>{String(text)}</p></div>{index < 2 && <ArrowRight className="pw-sample-step-arrow" size={18} />}</article>;
          })}
        </div>
      </section>

      <section id="sample-kit-order" className="pw-sample-order">
        <div className="pw-sample-order-copy pw-reveal">
          <p>GET YOUR SAMPLE KIT</p>
          <h2>Start with samples.<br />Order with confidence.</h2>
          <span>Real materials. Real quality. A small investment that helps you make a big decision.</span>
          <div className="pw-sample-order-price"><strong>₹299</strong><small>+ ₹100 shipping<br />₹399 total across India</small></div>
          <div className="pw-sample-order-trust">
            <span><Box size={22} /><b>Dispatched in 2–3 days</b><small>Across India</small></span>
            <span><FileText size={22} /><b>GST invoice available</b><small>For businesses</small></span>
            <span><ShieldCheck size={22} /><b>Secure payment</b><small>Via Razorpay</small></span>
          </div>
        </div>

        {paymentState === "paid" ? (
          <div className="pw-sample-confirmation" role="status">
            <CheckCircle2 size={48} />
            <p>PAYMENT VERIFIED</p>
            <h2>Your sample kit is confirmed.</h2>
            <span>We’ve emailed your confirmation and will dispatch the kit within 2–3 business days.</span>
            {sampleId && <strong>Sample reference: {sampleId}</strong>}
            <Link href="/products">Explore packaging <ArrowRight size={17} /></Link>
          </div>
        ) : (
          <form className="pw-sample-checkout pw-reveal pw-d1" onSubmit={buyKit}>
            <div className="pw-sample-form">
              <h3>Your details</h3>
              <label htmlFor="sample-name">Full name *<input id="sample-name" name="name" autoComplete="name" required placeholder="John Doe" /></label>
              <label htmlFor="sample-phone">Phone number *<input id="sample-phone" name="phone" autoComplete="tel" required inputMode="tel" pattern="[0-9+() -]{8,18}" placeholder="+91 98765 43210" /></label>
              <label htmlFor="sample-email">Email address *<input id="sample-email" name="email" autoComplete="email" required type="email" placeholder="you@company.com" /></label>
              <label htmlFor="sample-pincode">Pincode *<input id="sample-pincode" name="pincode" autoComplete="postal-code" required inputMode="numeric" pattern="[0-9]{6}" placeholder="560001" /></label>
              <label className="pw-sample-form-wide" htmlFor="sample-address">Shipping address *<textarea id="sample-address" name="address" autoComplete="street-address" required rows={2} placeholder="House no., building, area, landmark, city, state" /></label>
              <label className="pw-sample-form-wide" htmlFor="sample-note">Order note (optional)<textarea id="sample-note" name="note" rows={3} placeholder="Any specific preference?" /></label>
            </div>
            <aside className="pw-sample-summary" aria-label="Order summary">
              <h3>Order summary</h3>
              <div className="pw-sample-summary-product"><img src="/images/sample-kit-hero-v1.webp" alt="Packworkz sample kit" /><span><b>Packworkz Sample Kit</b><small>25–50+ packaging samples</small></span><strong>₹299</strong></div>
              <div className="pw-sample-summary-line"><span>Shipping</span><strong>₹100</strong></div>
              <div className="pw-sample-summary-total"><span>Total</span><strong>₹399</strong></div>
              <button type="submit" disabled={paymentState === "opening" || paymentState === "saving" || paymentState === "pending"}>
                {paymentState === "opening" || paymentState === "saving" ? <Loader2 className="pw-spin" size={18} /> : <ShieldCheck size={18} />}
                {paymentState === "opening" ? "Opening Razorpay" : paymentState === "saving" ? "Confirming order" : paymentState === "pending" ? "Payment processing" : "Pay ₹399 securely"}
                {paymentState === "idle" || paymentState === "error" ? <ArrowRight size={18} /> : null}
              </button>
              <small><ShieldCheck size={14} /> Secure payment via Razorpay</small>
              {message && <p className={paymentState === "error" ? "is-error" : ""} role="alert">{message}</p>}
            </aside>
          </form>
        )}
      </section>

      <section className="pw-sample-faq">
        <div className="pw-sample-section-head pw-reveal"><p>GOOD TO KNOW</p><h2>Sample kit questions.</h2></div>
        <div>{FAQS.map(([question, answer]) => <details className="pw-reveal" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </section>

      {showMobileCta && paymentState !== "paid" && <a className="pw-sample-mobile-cta" href="#sample-kit-order">Sample Kit · ₹399 total <ArrowRight size={18} /></a>}
    </main>
  );
}
