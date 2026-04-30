// Email via Resend — Packworkz
// Note: To send FROM quotes@packworkz.com, verify packworkz.com in your Resend dashboard.
// Until then, emails send from onboarding@resend.dev with reply-to set to your domain.
const FROM = "Packworkz <onboarding@resend.dev>";
const REPLY_TO = "quote@packworkz.com";
const WHATSAPP = "+91 82089 90366";
const SITE = "packworkz.com";

async function sendEmail(body: { from: string; to: string; reply_to?: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, reply_to: body.reply_to ?? REPLY_TO }),
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
    <p style="font-size:12px;color:#94A3B8;margin:0">Packworkz — India's B2B Packaging Platform · <a href="https://${SITE}" style="color:#94A3B8">${SITE}</a></p>
    <p style="font-size:11px;color:#CBD5E1;margin:6px 0 0">To stop receiving these emails, reply with "Unsubscribe".</p>
  </div>`;
}

function emailHeader(tagline: string) {
  return `<div style="background:#0D1B2A;padding:32px 40px;display:flex;align-items:center;gap:12px">
    <span style="color:#E8A838;font-size:22px;font-weight:900;letter-spacing:-0.5px">Packworkz</span>
    <span style="color:#475569;font-size:13px;margin-left:8px">${tagline}</span>
  </div>`;
}

function paymentBox(opts: {
  designNeeded: boolean;
  designPaid: boolean;
  sampleOption: string;
  samplePaid: boolean;
  paymentLink?: string;
}) {
  const needsDesignPay = opts.designNeeded && !opts.designPaid;
  const needsSamplePay = opts.sampleOption === "express" && !opts.samplePaid;

  if (!needsDesignPay && !needsSamplePay) return "";

  const items: string[] = [];
  if (needsDesignPay) items.push(`• <strong>Design Service — ₹1,999</strong>: Print-ready artwork &amp; dieline (adjusted against production order)`);
  if (needsSamplePay) items.push(`• <strong>Express Sample Kit — ₹4,999</strong>: Physical sample dispatched in 5 business days (fully adjusted against production order)`);

  const payButton = opts.paymentLink
    ? `<div style="margin-top:16px"><a href="${opts.paymentLink}" style="display:inline-block;background:#E8A838;color:#0D1B2A;padding:12px 28px;text-decoration:none;font-weight:800;font-size:14px;border-radius:6px">Pay Now →</a></div>`
    : `<p style="font-size:13px;color:#475569;margin-top:12px">Our team will share a payment link via WhatsApp within 2 hours. Reply to this email if you need it sooner.</p>`;

  return `
  <div style="background:#FFFBF0;border:2px solid #E8A838;padding:20px 24px;margin-bottom:32px;border-radius:4px">
    <p style="font-size:13px;font-weight:800;color:#92600A;margin:0 0 12px">⚡ Payment required to begin</p>
    <p style="font-size:13px;color:#475569;line-height:1.7;margin:0 0 10px">${items.join("<br>")}</p>
    ${payButton}
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
  pincode?: string;
  notes?: string;
  estimatedMin?: number;
  estimatedMax?: number;
  paymentLink?: string;
}) {
  const artworkLine = opts.artworkOption === "design"
    ? opts.designPaid ? "Design service booked ✓ — our team will reach out within 24 hrs"
      : "Design service selected — payment required to begin"
    : opts.artworkOption === "upload" ? "Artwork upload selected — please email your files after payment"
    : "No artwork — plain / unprinted";

  const sampleLine = opts.sampleOption === "express"
    ? opts.samplePaid ? "Express sample kit booked ✓ — delivery in 5 days"
      : "Express sample selected — payment required to confirm slot"
    : opts.sampleOption === "standard" ? "Standard sample — ₹2,999, adjusted against production"
    : "No sample — proceeding directly to bulk production";

  const budgetRow = (opts.estimatedMin && opts.estimatedMax)
    ? `<tr><td style="padding:6px 0;color:#64748B">Estimated Budget</td><td style="padding:6px 0;font-weight:700;text-align:right">₹${opts.estimatedMin.toLocaleString("en-IN")} – ₹${opts.estimatedMax.toLocaleString("en-IN")}</td></tr>`
    : "";

  const html = `
    <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("Quote Confirmed")}
      <div style="padding:40px 40px 0">
        <p style="font-size:13px;color:#1B6CA8;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Quote Confirmed</p>
        <h1 style="font-size:28px;font-weight:900;margin:0 0 8px">Your packaging is sorted, ${opts.name.split(" ")[0]}.</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:32px">
          We've received your quote request for <strong>${opts.company}</strong>. Our packaging engineers are already reviewing your spec.
          You'll receive a detailed, market-best quote within <strong>24–48 hours</strong>.
        </p>

        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:16px">Quote Summary</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Quote ID</td><td style="padding:6px 0;font-weight:700;text-align:right;font-family:monospace;color:#1B6CA8">${opts.quoteId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Company</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.company}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Contact</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.name}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Product</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.productName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Quantity</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.qty.toLocaleString("en-IN")} units</td></tr>
            ${budgetRow}
            <tr><td style="padding:6px 0;color:#64748B">Artwork</td><td style="padding:6px 0;font-weight:700;text-align:right;font-size:12px">${artworkLine}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Sample</td><td style="padding:6px 0;font-weight:700;text-align:right;font-size:12px">${sampleLine}</td></tr>
            ${opts.pincode ? `<tr><td style="padding:6px 0;color:#64748B">Delivery Pincode</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.pincode}</td></tr>` : ""}
            ${opts.notes ? `<tr><td style="padding:6px 0;color:#64748B;vertical-align:top">Notes</td><td style="padding:6px 0;font-weight:500;text-align:right;font-size:13px">${opts.notes}</td></tr>` : ""}
          </table>
        </div>

        ${paymentBox({ designNeeded: opts.artworkOption === "design", designPaid: opts.designPaid, sampleOption: opts.sampleOption, samplePaid: opts.samplePaid, paymentLink: opts.paymentLink })}

        <div style="background:#F0F7FF;border:1px solid #BAD7F2;padding:18px 22px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:13px;font-weight:700;color:#1B6CA8;margin:0 0 8px">What happens next?</p>
          <p style="font-size:13px;color:#475569;line-height:1.7;margin:0">
            1. Our team reviews your spec and sources from our 200+ factory network.<br>
            2. You receive an itemised quote with timeline &amp; payment terms within 48 hours.<br>
            3. Accept the quote — your dashboard activates and you can track every stage live.
          </p>
        </div>

        <p style="font-size:14px;color:#475569;line-height:1.7">
          Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/918208990366" style="color:#1B6CA8;font-weight:700">${WHATSAPP}</a>.
        </p>
      </div>
      ${emailFooter()}
    </div>`;

  await sendEmail({
    from: FROM,
    to: opts.to,
    subject: `Your Packworkz quote is confirmed — ${opts.quoteId}`,
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
  paymentLink?: string;
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
        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:14px">Design Order Summary</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Design ID</td><td style="padding:6px 0;font-weight:700;text-align:right;font-family:monospace;color:#1B6CA8">${opts.designId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Product Type</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.productType}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Service</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.isRush ? "Rush Design (12-hr turnaround)" : "Standard Design (2–3 day turnaround)"}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Amount Paid</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#16A34A">₹${opts.amountPaid.toLocaleString("en-IN")} ✓</td></tr>
          </table>
        </div>
        <div style="background:#F0F7FF;border:1px solid #BAD7F2;padding:18px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:13px;font-weight:700;color:#1B6CA8;margin-bottom:6px">What happens next?</p>
          <p style="font-size:13px;color:#475569;line-height:1.6;margin:0">
            1. Our designer reviews your brief and brand assets.<br>
            2. You receive an initial concept for feedback within the agreed timeline.<br>
            3. Up to 2 revision rounds included.<br>
            4. Final print-ready files delivered via email.
          </p>
        </div>
        <p style="font-size:14px;color:#475569;line-height:1.7">
          Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/918208990366" style="color:#1B6CA8;font-weight:700">${WHATSAPP}</a>.
        </p>
      </div>
      ${emailFooter()}
    </div>`;

  await sendEmail({
    from: FROM,
    to: opts.to,
    subject: `Design request confirmed — ${opts.designId} | Packworkz`,
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
  paymentLink?: string;
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
        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:14px">Sample Order Summary</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Sample ID</td><td style="padding:6px 0;font-weight:700;text-align:right;font-family:monospace;color:#1B6CA8">${opts.sampleId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Kit Type</td><td style="padding:6px 0;font-weight:700;text-align:right">${tierLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Estimated Delivery</td><td style="padding:6px 0;font-weight:700;text-align:right">${deliveryDays}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Amount Paid</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#16A34A">₹${opts.amountPaid.toLocaleString("en-IN")} ✓</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Credit on Order</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#1B6CA8">₹${opts.amountPaid.toLocaleString("en-IN")} adjustable</td></tr>
          </table>
        </div>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;padding:18px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:13px;font-weight:700;color:#16A34A;margin-bottom:6px">Good to know</p>
          <p style="font-size:13px;color:#475569;line-height:1.6;margin:0">
            The ₹${opts.amountPaid.toLocaleString("en-IN")} you paid will be fully credited against your production order.
            Share feedback on the sample and we'll optimise before bulk production.
          </p>
        </div>
        <p style="font-size:14px;color:#475569;line-height:1.7">
          Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/918208990366" style="color:#1B6CA8;font-weight:700">${WHATSAPP}</a>.
        </p>
      </div>
      ${emailFooter()}
    </div>`;

  await sendEmail({
    from: FROM,
    to: opts.to,
    subject: `Sample kit confirmed — ${opts.sampleId} | Packworkz`,
    html,
  });
}

// ─── New Client Welcome (when admin creates account) ─────────────────────────

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  tempPassword: string;
  loginUrl: string;
}) {
  const html = `
    <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("Welcome to Packworkz")}
      <div style="padding:40px 40px 0">
        <p style="font-size:13px;color:#1B6CA8;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Account Created</p>
        <h1 style="font-size:26px;font-weight:900;margin:0 0 16px">Welcome, ${opts.name.split(" ")[0]}!</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:28px">
          Your Packworkz client account is ready. You can now log in to track your orders, quotes, and invoices.
        </p>
        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:16px">Your Login Details</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Email</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.to}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Temporary Password</td><td style="padding:6px 0;font-weight:700;text-align:right;font-family:monospace;color:#E04B4B">${opts.tempPassword}</td></tr>
          </table>
        </div>
        <div style="margin-bottom:28px">
          <a href="${opts.loginUrl}" style="display:inline-block;background:#1B6CA8;color:white;padding:14px 32px;text-decoration:none;font-weight:800;font-size:14px;border-radius:6px">Log In &amp; Set Your Password →</a>
        </div>
        <div style="background:#FFFBF0;border:1px solid #E8A838;padding:16px 20px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:13px;color:#92600A;margin:0"><strong>Important:</strong> You will be asked to change your password on first login. Please do this immediately to secure your account.</p>
        </div>
        <p style="font-size:14px;color:#475569;line-height:1.7">
          Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/918208990366" style="color:#1B6CA8;font-weight:700">${WHATSAPP}</a>.
        </p>
      </div>
      ${emailFooter()}
    </div>`;

  await sendEmail({
    from: FROM,
    to: opts.to,
    subject: `Your Packworkz account is ready — please log in`,
    html,
  });
}
