// Email via Resend
const FROM = "PackOps <onboarding@resend.dev>";
const WHATSAPP = "+91 99999 99999";

async function sendEmail(body: { from: string; to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Resend error:", err);
  } else {
    const data = await res.json() as { id: string };
    console.info("[email] Sent:", data.id, "→", body.to);
  }
}

function emailFooter() {
  return `<div style="padding:28px 40px;border-top:1px solid #E2EAF4;margin-top:40px">
    <p style="font-size:12px;color:#94A3B8;margin:0">PackOps — India's B2B Packaging Platform · <a href="https://packops.in" style="color:#94A3B8">packops.in</a></p>
  </div>`;
}

function emailHeader(tagline: string) {
  return `<div style="background:#0D1B2A;padding:32px 40px;display:flex;align-items:center;gap:12px">
    <span style="color:#E8A838;font-size:22px;font-weight:900;letter-spacing:-0.5px">PackOps</span>
    <span style="color:#475569;font-size:13px;margin-left:8px">${tagline}</span>
  </div>`;
}

// ─── Quote Confirmation ───────────────────────────────────────────────────────

export async function sendQuoteConfirmation(opts: {
  to: string;
  name: string;
  company: string;
  quoteId: string;
  productName: string;
  qty: number;
  artworkOption: string;
  sampleOption: string;
  designPaid: boolean;
  samplePaid: boolean;
}) {
  const artworkLine = opts.artworkOption === "design"
    ? opts.designPaid ? "Design service booked ✓ — our team will reach out within 24 hrs"
      : "Design service selected — payment required to begin"
    : opts.artworkOption === "upload" ? "Artwork upload selected — please send your files"
    : "No artwork — plain/unprinted";

  const sampleLine = opts.sampleOption === "express"
    ? opts.samplePaid ? "Express sample kit booked ✓ — delivery in 5 days"
      : "Express sample selected — payment required to confirm slot"
    : opts.sampleOption === "standard" ? "Standard sample selected — ₹2,999, adjusted against production"
    : "No sample — proceeding directly to production";

  const actionRequired = (opts.artworkOption === "design" && !opts.designPaid) ||
    (opts.sampleOption !== "none" && !opts.samplePaid);

  const html = `
    <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("Quote Confirmed")}
      <div style="padding:40px 40px 0">
        <p style="font-size:13px;color:#1B6CA8;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Quote Confirmed</p>
        <h1 style="font-size:28px;font-weight:900;margin:0 0 24px">Your packaging is sorted, ${opts.name.split(" ")[0]}.</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:32px">
          We've received your quote request and our packaging engineers are already reviewing your spec.
          You'll receive a detailed, market-best quote within <strong>24–48 hours</strong>.
        </p>
        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:32px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:16px">Quote Summary</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Quote ID</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.quoteId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Company</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.company}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Product</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.productName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Quantity</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.qty.toLocaleString()} units</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Artwork</td><td style="padding:6px 0;font-weight:700;text-align:right;font-size:12px">${artworkLine}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Sample</td><td style="padding:6px 0;font-weight:700;text-align:right;font-size:12px">${sampleLine}</td></tr>
          </table>
        </div>
        ${actionRequired ? `
        <div style="background:#FFFBF0;border:1px solid #E8A838;padding:20px;margin-bottom:32px">
          <p style="font-size:13px;font-weight:700;color:#92600A;margin-bottom:8px">⚡ Action required</p>
          <p style="font-size:13px;color:#475569;line-height:1.6;margin:0">
            ${opts.artworkOption === "design" && !opts.designPaid ? "• Design service payment (₹1,999) is pending — your slot is held for 48 hrs.<br>" : ""}
            ${opts.sampleOption === "express" && !opts.samplePaid ? "• Express sample payment (₹4,999) is pending — your priority slot is held for 48 hrs." : ""}
          </p>
        </div>` : ""}
        <p style="font-size:14px;color:#475569;line-height:1.7">
          Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919999999999" style="color:#1B6CA8;font-weight:700">${WHATSAPP}</a>.
        </p>
      </div>
      ${emailFooter()}
    </div>`;

  await sendEmail({
    from: FROM,
    to: opts.to,
    subject: `Your PackOps quote is confirmed — ${opts.quoteId}`,
    html,
  });
}

// ─── Design Request Confirmation ─────────────────────────────────────────────

export async function sendDesignConfirmation(opts: {
  to: string;
  name: string;
  designId: string;
  productType: string;
  isRush: boolean;
  amountPaid: number;
}) {
  const html = `
    <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("Design Request")}
      <div style="padding:40px 40px 0">
        <p style="font-size:13px;color:#1B6CA8;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Design Request Confirmed</p>
        <h1 style="font-size:26px;font-weight:900;margin:0 0 20px">Your design brief is booked, ${opts.name.split(" ")[0]}.</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:28px">
          Payment of <strong>₹${opts.amountPaid.toLocaleString("en-IN")}</strong> received. Our design team will review your brief and reach out within
          <strong>${opts.isRush ? "12 hours" : "24–48 hours"}</strong> to begin work.
        </p>
        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:28px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:14px">Design Order Summary</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Design ID</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.designId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Product Type</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.productType}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Service</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.isRush ? "Rush Design (12-hr turnaround)" : "Standard Design (2–3 day turnaround)"}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Amount Paid</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#16A34A">₹${opts.amountPaid.toLocaleString("en-IN")} ✓</td></tr>
          </table>
        </div>
        <div style="background:#F0F7FF;border:1px solid #BAD7F2;padding:18px;margin-bottom:28px">
          <p style="font-size:13px;font-weight:700;color:#1B6CA8;margin-bottom:6px">What happens next?</p>
          <p style="font-size:13px;color:#475569;line-height:1.6;margin:0">
            1. Our designer reviews your brief and brand assets.<br>
            2. You receive an initial concept for feedback.<br>
            3. Up to 2 revision rounds included.<br>
            4. Final print-ready files delivered via email.
          </p>
        </div>
        <p style="font-size:14px;color:#475569;line-height:1.7">
          Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919999999999" style="color:#1B6CA8;font-weight:700">${WHATSAPP}</a>.
        </p>
      </div>
      ${emailFooter()}
    </div>`;

  await sendEmail({
    from: FROM,
    to: opts.to,
    subject: `Design request confirmed — ${opts.designId} | PackOps`,
    html,
  });
}

// ─── Sample Request Confirmation ─────────────────────────────────────────────

export async function sendSampleConfirmation(opts: {
  to: string;
  name: string;
  sampleId: string;
  sampleTier: string;
  amountPaid: number;
}) {
  const isExpress = opts.sampleTier === "express";
  const deliveryDays = isExpress ? "5 business days" : "10–12 business days";
  const tierLabel = isExpress ? "Express Sample Kit" : "Standard Sample Kit";

  const html = `
    <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("Sample Request")}
      <div style="padding:40px 40px 0">
        <p style="font-size:13px;color:#1B6CA8;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Sample Order Confirmed</p>
        <h1 style="font-size:26px;font-weight:900;margin:0 0 20px">Sample is on its way, ${opts.name.split(" ")[0]}!</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:28px">
          Your sample kit will be dispatched within <strong>1–2 business days</strong> and delivered in
          <strong>${deliveryDays}</strong>. The amount paid is fully adjustable against your production order.
        </p>
        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:28px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:14px">Sample Order Summary</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Sample ID</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.sampleId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Kit Type</td><td style="padding:6px 0;font-weight:700;text-align:right">${tierLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Estimated Delivery</td><td style="padding:6px 0;font-weight:700;text-align:right">${deliveryDays}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Amount Paid</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#16A34A">₹${opts.amountPaid.toLocaleString("en-IN")} ✓</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Credit on Order</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#1B6CA8">₹${opts.amountPaid.toLocaleString("en-IN")} adjustable</td></tr>
          </table>
        </div>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;padding:18px;margin-bottom:28px">
          <p style="font-size:13px;font-weight:700;color:#16A34A;margin-bottom:6px">Good to know</p>
          <p style="font-size:13px;color:#475569;line-height:1.6;margin:0">
            The ₹${opts.amountPaid.toLocaleString("en-IN")} you paid will be fully credited against your production order when you place it.
            Share feedback on the sample and we'll optimise before bulk production.
          </p>
        </div>
        <p style="font-size:14px;color:#475569;line-height:1.7">
          Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919999999999" style="color:#1B6CA8;font-weight:700">${WHATSAPP}</a>.
        </p>
      </div>
      ${emailFooter()}
    </div>`;

  await sendEmail({
    from: FROM,
    to: opts.to,
    subject: `Sample kit confirmed — ${opts.sampleId} | PackOps`,
    html,
  });
}
