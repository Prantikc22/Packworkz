// Email via Resend — Packworkz (domain verified: packworkz.com)
const FROM = "Packworkz <sales@packworkz.com>";
const REPLY_TO = "sales@packworkz.com";
const WHATSAPP = "+91 82089 90366";
const SITE = "packworkz.com";

async function sendEmail(body: { from: string; to: string; reply_to?: string; subject: string; html: string }): Promise<{ ok: boolean; status: number; body: unknown }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return { ok: false, status: 0, body: "RESEND_API_KEY not set" };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, reply_to: body.reply_to ?? REPLY_TO }),
  });
  const responseBody = await res.text();
  if (!res.ok) {
    console.error("[email] Resend error →", body.to, "| status:", res.status, "| body:", responseBody);
    return { ok: false, status: res.status, body: responseBody };
  } else {
    const data = JSON.parse(responseBody) as { id: string };
    console.info("[email] Sent:", data.id, "→", body.to);
    return { ok: true, status: res.status, body: data };
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
  paymentLink?: string;
}) {
  const needsDesignPay = opts.designNeeded && !opts.designPaid;
  if (!needsDesignPay) return "";

  const items: string[] = [];
  if (needsDesignPay) items.push(`• <strong>Design Service — ₹1,999</strong>: Print-ready artwork &amp; dieline (adjusted against production order)`);

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
            ${opts.pincode ? `<tr><td style="padding:6px 0;color:#64748B">Delivery Pincode</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.pincode}</td></tr>` : ""}
            ${opts.notes ? `<tr><td style="padding:6px 0;color:#64748B;vertical-align:top">Notes</td><td style="padding:6px 0;font-weight:500;text-align:right;font-size:13px">${opts.notes}</td></tr>` : ""}
          </table>
        </div>

        ${paymentBox({ designNeeded: opts.artworkOption === "design", designPaid: opts.designPaid, paymentLink: opts.paymentLink })}

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

// ─── Admin Internal Quote Notification ───────────────────────────────────────

export async function sendAdminQuoteNotification(opts: {
  quoteId: string;
  contactName: string;
  company: string;
  email: string;
  phone: string;
  productName: string;
  qty: number;
  qtyUnit?: string;
  artworkOption: string;
  sampleOption: string;
  pincode?: string;
  notes?: string;
  estimatedMin?: number;
  estimatedMax?: number;
  artworkFileUrl?: string;
  variantSelections?: Record<string, string>;
  customSpecs?: Record<string, string>;
}) {
  const artworkFileRow = opts.artworkFileUrl
    ? `<tr><td style="padding:6px 0;color:#64748B">Artwork File</td><td style="padding:6px 0;font-weight:700;text-align:right"><a href="${opts.artworkFileUrl}" style="color:#1B6CA8">${opts.artworkFileUrl.split("/").pop() || "View File"}</a></td></tr>`
    : "";

  const variantRows = opts.variantSelections && Object.keys(opts.variantSelections).length
    ? Object.entries(opts.variantSelections).map(([k, v]) =>
        `<tr><td style="padding:4px 0 4px 16px;color:#94A3B8;font-size:13px">↳ ${k.replace(/_/g, " ")}</td><td style="padding:4px 0;font-weight:600;text-align:right;font-size:13px">${v}</td></tr>`
      ).join("")
    : "";

  const specRows = opts.customSpecs && Object.keys(opts.customSpecs).length
    ? `<tr><td style="padding:6px 0;color:#64748B">Dimensions</td><td style="padding:6px 0;font-weight:600;text-align:right;font-size:13px">${
        Object.entries(opts.customSpecs).filter(([,v]) => v).map(([k,v]) => `${k.replace(/_/g," ")}: ${v}`).join(" · ")
      }</td></tr>`
    : "";

  const html = `
    <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("New Quote Alert")}
      <div style="padding:40px 40px 0">
        <p style="font-size:13px;color:#E04B4B;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Action Required</p>
        <h1 style="font-size:24px;font-weight:900;margin:0 0 8px">New quote from ${opts.company}</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:28px">
          A new quote request just came in. Review and respond within 48 hours.
        </p>

        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:16px">Quote Details</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Quote ID</td><td style="padding:6px 0;font-weight:700;text-align:right;font-family:monospace;color:#1B6CA8">${opts.quoteId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Company</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.company}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Contact</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.contactName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Email</td><td style="padding:6px 0;font-weight:700;text-align:right"><a href="mailto:${opts.email}" style="color:#1B6CA8">${opts.email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Phone</td><td style="padding:6px 0;font-weight:700;text-align:right"><a href="https://wa.me/${opts.phone.replace(/\D/g, "")}" style="color:#25D366;font-weight:800">${opts.phone}</a></td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Product</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.productName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Quantity</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.qty.toLocaleString("en-IN")} ${opts.qtyUnit || ""}</td></tr>
            ${variantRows}
            ${specRows}
            <tr><td style="padding:6px 0;color:#64748B">Artwork</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.artworkOption}</td></tr>
            ${artworkFileRow}
            ${opts.pincode ? `<tr><td style="padding:6px 0;color:#64748B">Pincode</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.pincode}</td></tr>` : ""}
            ${opts.estimatedMin ? `<tr><td style="padding:6px 0;color:#64748B">Est. Budget</td><td style="padding:6px 0;font-weight:700;text-align:right">₹${opts.estimatedMin.toLocaleString("en-IN")} – ₹${(opts.estimatedMax ?? opts.estimatedMin).toLocaleString("en-IN")}</td></tr>` : ""}
            ${opts.notes ? `<tr><td style="padding:6px 0;color:#64748B;vertical-align:top">Notes</td><td style="padding:6px 0;font-weight:500;text-align:right;font-size:13px">${opts.notes}</td></tr>` : ""}
          </table>
        </div>

        <div style="margin-bottom:28px">
          <a href="https://packworkz.com/admin/quotes" style="display:inline-block;background:#1B6CA8;color:white;padding:12px 28px;text-decoration:none;font-weight:800;font-size:14px;border-radius:6px">Open Admin Panel →</a>
        </div>
      </div>
      ${emailFooter()}
    </div>`;

  await sendEmail({
    from: FROM,
    to: "prantik.chatterjee@packworkz.com",
    subject: `🔔 New quote: ${opts.quoteId} — ${opts.company} (${opts.productName})`,
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
  const dispatchDays = "2–3 business days";
  const deliveryDays = "5–8 business days";
  const tierLabel = "Packaging Sample Kit";

  const html = `
    <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("Sample Request")}
      <div style="padding:40px 40px 0">
        <p style="font-size:13px;color:#1B6CA8;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Sample Order Confirmed</p>
        <h1 style="font-size:26px;font-weight:900;margin:0 0 20px">Sample is on its way, ${opts.name.split(" ")[0]}!</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:28px">
          Your sample kit will be dispatched within <strong>${dispatchDays}</strong> and delivered in
          <strong>${deliveryDays}</strong>.
        </p>
        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:14px">Sample Order Summary</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748B">Sample ID</td><td style="padding:6px 0;font-weight:700;text-align:right;font-family:monospace;color:#1B6CA8">${opts.sampleId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Kit Type</td><td style="padding:6px 0;font-weight:700;text-align:right">${tierLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Estimated Delivery</td><td style="padding:6px 0;font-weight:700;text-align:right">${deliveryDays}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Sample kit</td><td style="padding:6px 0;font-weight:700;text-align:right">₹299</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Shipping</td><td style="padding:6px 0;font-weight:700;text-align:right">₹100</td></tr>
            <tr><td style="padding:6px 0;color:#64748B">Amount Paid</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#16A34A">₹${opts.amountPaid.toLocaleString("en-IN")} ✓</td></tr>
          </table>
        </div>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;padding:18px;margin-bottom:28px;border-radius:4px">
          <p style="font-size:13px;font-weight:700;color:#16A34A;margin-bottom:6px">Good to know</p>
          <p style="font-size:13px;color:#475569;line-height:1.6;margin:0">
            Compare the materials and formats in your kit, then use your shortlist to choose the right packaging for your brand.
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

// ─── Price calculator: the saved price, and one follow-up the next day ────────

export type CalculatorQuote = {
  product: string;
  size?: string;
  quantity: number;
  unitLabel?: string;
  options?: Record<string, string>;
  unitPrice?: number;
  total?: number;
  exact?: boolean;
  orderUrl: string;
};

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const rupees = (value: number, digits = 0) => `₹${value.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

function calculatorSummary(q: CalculatorQuote) {
  const rows: Array<[string, string]> = [
    ["Product", q.product],
    ...(q.size ? [["Size", q.size] as [string, string]] : []),
    ["Quantity", `${q.quantity.toLocaleString("en-IN")} ${q.unitLabel || "pcs"}`],
    ...Object.entries(q.options || {}).slice(0, 6).map(([k, v]) => [k, v] as [string, string]),
    ...(q.unitPrice ? [["Per piece (before GST)", rupees(q.unitPrice, 2)] as [string, string]] : []),
    ...(q.total ? [[q.exact ? "Total incl. GST & delivery" : "Estimated total", rupees(q.total)] as [string, string]] : []),
  ];
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.map(([k, v]) =>
    `<tr><td style="padding:7px 0;color:#64748B;border-bottom:1px solid #EEF2F6">${esc(k)}</td><td style="padding:7px 0;font-weight:700;text-align:right;border-bottom:1px solid #EEF2F6">${esc(v)}</td></tr>`).join("")}</table>`;
}

function calculatorButton(url: string, label: string) {
  return `<a href="${esc(url)}" style="display:inline-block;background:#E8A838;color:#0D1B2A;padding:13px 26px;text-decoration:none;font-weight:800;font-size:14px;border-radius:4px">${esc(label)} →</a>`;
}

export async function sendCalculatorQuote(opts: { to: string; name: string; quote: CalculatorQuote }) {
  const first = esc(opts.name.split(" ")[0] || "there");
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("Your saved price")}
      <div style="padding:36px 40px 0">
        <h1 style="font-size:24px;font-weight:900;margin:0 0 14px">Here's your price, ${first}.</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px">${opts.quote.exact
          ? "This is the same price you'll pay at checkout, including GST and delivery across India."
          : "This is an estimate. Our team confirms the exact price within 4 business hours once you send the request."}</p>
        <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:20px 22px;margin-bottom:26px;border-radius:4px">${calculatorSummary(opts.quote)}</div>
        <p style="margin:0 0 26px">${calculatorButton(opts.quote.orderUrl, opts.quote.exact ? "Order this now" : "Get my exact price")}</p>
        <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 10px">Before you print, we put your artwork on this exact pack and send you a <strong>free 3D mockup</strong> to approve.</p>
        <p style="font-size:14px;color:#475569;line-height:1.7">Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/918208990366" style="color:#1B6CA8;font-weight:700">${WHATSAPP}</a>.</p>
      </div>
      ${emailFooter()}
    </div>`;
  return sendEmail({ from: FROM, to: opts.to, subject: `Your Packworkz price — ${opts.quote.product}`, html });
}

export async function sendCalculatorFollowUp(opts: { to: string; name: string; quote: CalculatorQuote }) {
  const first = esc(opts.name.split(" ")[0] || "there");
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
      ${emailHeader("Following up")}
      <div style="padding:36px 40px 0">
        <h1 style="font-size:22px;font-weight:900;margin:0 0 14px">Still planning your ${esc(opts.quote.product.toLowerCase())}, ${first}?</h1>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px">Yesterday you priced ${esc(opts.quote.quantity.toLocaleString("en-IN"))} ${esc(opts.quote.unitLabel || "pcs")}${opts.quote.total ? ` at <strong>${rupees(opts.quote.total)}</strong>` : ""}. A few things that usually help at this stage:</p>
        <ul style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 24px;padding-left:18px">
          <li><strong>Not sure about the material or size?</strong> Our sample kit (₹299) has 25–50+ real packs to touch and compare.</li>
          <li><strong>Want to see it with your brand?</strong> Send your logo and we'll share a free 3D mockup on WhatsApp.</li>
          <li><strong>Different quantity or spec?</strong> Reply with what you need — we'll price it the same day.</li>
        </ul>
        <p style="margin:0 0 26px">${calculatorButton(opts.quote.orderUrl, "Pick up where you left off")}</p>
        <p style="font-size:14px;color:#475569;line-height:1.7">Or just reply to this email — it comes straight to our team.</p>
      </div>
      ${emailFooter()}
    </div>`;
  return sendEmail({ from: FROM, to: opts.to, subject: `Your ${opts.quote.product} price is saved`, html });
}

// ─── Admin quotation (designed HTML, table layout for Gmail/Outlook) ──────────

export type QuoteEmailData = {
  firstName: string;
  company: string;
  quoteId: string;
  product: string;
  quantity: number;
  unit: string;
  specs: Array<[string, string]>;
  subtotal: number | null;
  gstRate: number | null;
  gst: number | null;
  total: number | null;
  perUnit: number | null;
  delivery: string;
  advancePercent: number;
  advance: number | null;
  balance: number | null;
  paymentLink: string | null;
  dashboardUrl: string;
};

const NAVY = "#0B1726";
const AMBER = "#F2B134";
const INK = "#0D1B2A";
const MUTED = "#5F6B7A";
const LINE = "#E6E9EE";
const money0 = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;
const money2 = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function renderQuoteEmail(d: QuoteEmailData) {
  const font = "font-family:'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif;";
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const row = (label: string, value: string, opts: { strong?: boolean; big?: boolean; last?: boolean } = {}) =>
    `<tr><td style="${font}padding:${opts.big ? "14px" : "10px"} 0;color:${MUTED};font-size:${opts.big ? "14px" : "13.5px"};${opts.last ? "" : `border-bottom:1px solid ${LINE};`}">${esc(label)}</td>
     <td align="right" style="${font}padding:${opts.big ? "14px" : "10px"} 0;color:${INK};font-size:${opts.big ? "22px" : "14px"};font-weight:${opts.strong || opts.big ? "800" : "600"};${opts.last ? "" : `border-bottom:1px solid ${LINE};`}">${esc(value)}</td></tr>`;
  const specs = d.specs.slice(0, 12).map(([k, v], i, all) => row(k, v, { last: i === all.length - 1 })).join("");
  const price = d.total
    ? d.subtotal !== null && d.gstRate !== null && d.gst !== null
      ? row("Price before GST", `${money0(d.subtotal)}${d.perUnit ? `  ·  ${money2(d.perUnit)}/pc` : ""}`) + row(`GST (${d.gstRate}%)`, money0(d.gst)) + row("Total incl. GST", money0(d.total), { big: true, last: true })
      : row("Quoted price", `${money0(d.total)}${d.perUnit ? `  ·  ${money2(d.perUnit)}/pc` : ""}`, { big: true }) + row("GST", "Extra, as applicable", { last: true })
    : row("Quoted price", "To be confirmed", { last: true });
  const full = d.advancePercent >= 100;
  const payBox = (label: string, amount: number | null, note: string, highlight: boolean) => `
    <td width="50%" valign="top" style="padding:0 ${highlight ? "6px 0 0" : "0 0 6px"};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:${highlight ? "#FFF8E8" : "#F6F7F9"};border:1px solid ${highlight ? "#F4D38A" : LINE};border-radius:8px;">
        <tr><td style="${font}padding:16px 18px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:${highlight ? "#9A6A00" : MUTED};">${esc(label)}</div>
          <div style="font-size:22px;font-weight:800;color:${INK};margin-top:6px;">${amount ? money0(amount) : "—"}</div>
          <div style="font-size:12.5px;color:${MUTED};margin-top:4px;line-height:1.45;">${esc(note)}</div>
        </td></tr>
      </table>
    </td>`;
  const payments = full
    ? `<tr>${payBox("100% advance", d.total, "To confirm the order and start production", true)}</tr>`
    : `<tr>${payBox(`Advance · ${d.advancePercent}%`, d.advance, "To confirm the order and start production", true)}${payBox(`Balance · ${100 - d.advancePercent}%`, d.balance, "Before dispatch, after quality check", false)}</tr>`;
  const button = (href: string, label: string, primary: boolean) =>
    `<a href="${esc(href)}" style="${font}display:inline-block;padding:14px 24px;border-radius:6px;background:${primary ? AMBER : NAVY};color:${primary ? INK : "#FFFFFF"};font-size:14px;font-weight:800;text-decoration:none;margin:0 8px 8px 0;">${esc(label)} &rarr;</a>`;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Packworkz quotation ${esc(d.quoteId)}</title></head>
<body style="margin:0;padding:0;background:#EEF1F4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your quotation for ${esc(d.product)}${d.total ? ` — ${money0(d.total)}` : ""}. Review and approve in your dashboard.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F4;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border-collapse:separate;background:#FFFFFF;border-radius:12px;overflow:hidden;">

  <tr><td style="background:${NAVY};padding:26px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="${font}">
        <span style="display:inline-block;width:11px;height:14px;background:${AMBER};border-radius:2px;vertical-align:middle;"></span><span style="display:inline-block;width:10px;height:12px;background:#E8EDF3;border-radius:2px;vertical-align:middle;margin:6px 0 0 -4px;"></span>
        <span style="color:#FFFFFF;font-size:21px;font-weight:800;letter-spacing:-0.4px;vertical-align:middle;margin-left:8px;">Packworkz</span>
      </td>
      <td align="right" style="${font}color:rgba(255,255,255,0.62);font-size:11.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">Quotation</td>
    </tr></table>
  </td></tr>

  <tr><td style="${font}padding:34px 32px 8px;">
    <div style="font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#1E5ED2;">${esc(d.quoteId)} &nbsp;·&nbsp; ${esc(today)}</div>
    <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;font-weight:800;color:${INK};letter-spacing:-0.5px;">Your quotation is ready, ${esc(d.firstName)}.</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.65;color:${MUTED};">Thank you for your enquiry${d.company ? ` for <strong style="color:${INK};">${esc(d.company)}</strong>` : ""}. Here's the full price and specification — approve it in your dashboard when you're ready.</p>
  </td></tr>

  <tr><td style="padding:22px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border:1px solid ${LINE};border-radius:10px;">
      <tr><td style="${font}padding:18px 20px 6px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:${MUTED};">Product</div>
        <div style="font-size:18px;font-weight:800;color:${INK};margin-top:6px;">${esc(d.product)}</div>
        <div style="font-size:14px;color:${MUTED};margin-top:2px;">${d.quantity ? `${d.quantity.toLocaleString("en-IN")} ${esc(d.unit)}` : ""}</div>
      </td></tr>
      ${specs ? `<tr><td style="padding:4px 20px 10px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${specs}</table></td></tr>` : ""}
    </table>
  </td></tr>

  <tr><td style="padding:16px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border:1px solid ${LINE};border-radius:10px;">
      <tr><td style="${font}padding:18px 20px 4px;"><div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:${MUTED};">Pricing</div></td></tr>
      <tr><td style="padding:0 20px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${price}</table></td></tr>
      <tr><td style="${font}padding:0 20px 16px;font-size:12.5px;color:${MUTED};">Delivery charges extra, billed at actuals${d.delivery ? ` &nbsp;·&nbsp; Estimated delivery: <strong style="color:${INK};">${esc(d.delivery)}</strong>` : ""}</td></tr>
    </table>
  </td></tr>

  <tr><td style="${font}padding:24px 32px 0;">
    <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:${MUTED};margin-bottom:10px;">Payment</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${payments}</table>
  </td></tr>

  <tr><td style="${font}padding:26px 32px 4px;">
    ${d.paymentLink ? button(d.paymentLink, `Pay the advance${d.advance && !full ? ` · ${money0(d.advance)}` : ""}`, true) : ""}
    ${button(d.dashboardUrl, "View & approve quote", !d.paymentLink)}
  </td></tr>

  <tr><td style="padding:16px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F7F9;border-radius:10px;">
      <tr><td style="${font}padding:16px 20px;font-size:13.5px;line-height:1.7;color:${MUTED};">
        <strong style="color:${INK};">What happens next</strong><br>
        1. Approve the quote and pay the advance.<br>
        2. We send a <strong style="color:${INK};">free 3D mockup</strong> of your artwork on the exact pack for sign-off.<br>
        3. Production starts — with quality checks before dispatch.
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="${font}padding:24px 32px 30px;font-size:14px;line-height:1.7;color:${MUTED};">
    Want a different quantity or spec? Just reply to this email and we'll revise the quote the same day.<br><br>
    Warm regards,<br><strong style="color:${INK};">Team Packworkz</strong>
  </td></tr>

  <tr><td style="background:#F6F7F9;border-top:1px solid ${LINE};padding:18px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="${font}font-size:12.5px;color:${MUTED};line-height:1.6;">
        <a href="mailto:sales@packworkz.com" style="color:${INK};font-weight:700;text-decoration:none;">sales@packworkz.com</a> &nbsp;·&nbsp;
        <a href="https://wa.me/918208990366" style="color:${INK};font-weight:700;text-decoration:none;">WhatsApp ${WHATSAPP}</a><br>
        <a href="https://${SITE}" style="color:${MUTED};text-decoration:none;">${SITE}</a> &nbsp;·&nbsp; Kalyani Rotopack Pvt Ltd, Kolkata
      </td>
    </tr></table>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export async function sendQuoteEmail(opts: { to: string; data: QuoteEmailData }) {
  return sendEmail({
    from: FROM,
    to: opts.to,
    subject: `Your Packworkz quotation ${opts.data.quoteId} · ${opts.data.product}`,
    html: renderQuoteEmail(opts.data),
  });
}
