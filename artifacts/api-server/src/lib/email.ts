// Email via Resend — wire up RESEND_API_KEY when ready
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const artworkLine = opts.artworkOption === "design"
    ? opts.designPaid
      ? "Design service booked ✓ — our team will reach out within 24 hrs"
      : "Design service selected — payment required to begin"
    : opts.artworkOption === "upload"
    ? "Artwork upload selected — please send your files"
    : "No artwork — plain/unprinted";

  const sampleLine = opts.sampleOption === "express"
    ? opts.samplePaid
      ? "Express sample kit booked ✓ — delivery in 5 days"
      : "Express sample selected — payment required to confirm slot"
    : opts.sampleOption === "standard"
    ? "Standard sample selected — ₹2,999, adjusted against production"
    : "No sample — proceeding directly to production";

  const body = {
    from: "PackOps <quotes@packops.in>",
    to: opts.to,
    subject: `Your PackOps quote is confirmed — ${opts.quoteId}`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;color:#0D1B2A">
        <div style="background:#0D1B2A;padding:32px 40px">
          <span style="color:#E8A838;font-size:22px;font-weight:900;letter-spacing:-0.5px">PackOps</span>
        </div>
        <div style="padding:40px 40px 0">
          <p style="font-size:13px;color:#1B6CA8;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Quote Confirmed</p>
          <h1 style="font-size:28px;font-weight:900;margin:0 0 24px">Your packaging is sorted, ${opts.name.split(" ")[0]}.</h1>
          <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:32px">
            We've received your quote request and our packaging engineers are already reviewing your spec.
            You'll receive a detailed, market-best quote within <strong>24–48 hours</strong>.
          </p>
          <div style="background:#F8F9FC;border:1px solid #E2EAF4;padding:24px;margin-bottom:32px">
            <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:16px">Order Summary</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#64748B">Quote ID</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.quoteId}</td></tr>
              <tr><td style="padding:6px 0;color:#64748B">Company</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.company}</td></tr>
              <tr><td style="padding:6px 0;color:#64748B">Product</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.productName}</td></tr>
              <tr><td style="padding:6px 0;color:#64748B">Quantity</td><td style="padding:6px 0;font-weight:700;text-align:right">${opts.qty.toLocaleString()} units</td></tr>
              <tr><td style="padding:6px 0;color:#64748B">Artwork</td><td style="padding:6px 0;font-weight:700;text-align:right;font-size:12px">${artworkLine}</td></tr>
              <tr><td style="padding:6px 0;color:#64748B">Sample</td><td style="padding:6px 0;font-weight:700;text-align:right;font-size:12px">${sampleLine}</td></tr>
            </table>
          </div>
          ${(opts.artworkOption === "design" && !opts.designPaid) || (opts.sampleOption !== "none" && !opts.samplePaid) ? `
          <div style="background:#FFFBF0;border:1px solid #E8A838;padding:20px;margin-bottom:32px">
            <p style="font-size:13px;font-weight:700;color:#92600A;margin-bottom:8px">⚡ Action required</p>
            <p style="font-size:13px;color:#475569;line-height:1.6;margin:0">
              ${opts.artworkOption === "design" && !opts.designPaid ? "• Design service payment (₹1,999) is pending — your slot is held for 48 hrs.<br>" : ""}
              ${opts.sampleOption === "express" && !opts.samplePaid ? "• Express sample payment (₹4,999) is pending — your priority slot is held for 48 hrs." : ""}
            </p>
          </div>` : ""}
          <p style="font-size:14px;color:#475569;line-height:1.7">
            Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919999999999" style="color:#1B6CA8;font-weight:700">+91 99999 99999</a>.
          </p>
        </div>
        <div style="padding:32px 40px;border-top:1px solid #E2EAF4;margin-top:40px">
          <p style="font-size:12px;color:#94A3B8;margin:0">PackOps — India's B2B Packaging Platform · <a href="https://packops.in" style="color:#94A3B8">packops.in</a></p>
        </div>
      </div>
    `,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Resend error:", err);
  } else {
    console.info("[email] Confirmation sent to", opts.to);
  }
}
