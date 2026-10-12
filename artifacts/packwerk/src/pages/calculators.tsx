import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Box, Calculator as CalcIcon, CheckCircle2, Download, Loader2, Mail, PenTool, Plus, Scale } from "lucide-react";
import { COMMERCE_PRODUCTS, formatMeasurementInCm, getEffectiveCommerceTiers, getMinimumQuantityForConfiguration } from "@workspace/commerce";
import { CATALOG_SKUS, getCatalogImage, getConfigureHref, requiresQuote, type CatalogSku } from "@/lib/catalog";
import { calculateOrderEstimate } from "@/lib/pricing";
import { CALCULATORS, CALCULATOR_BY_SLUG, type PriceCalculator, type ToolCalculator } from "@/lib/calculators";
import { DIELINE_STYLES, buildDieline, dielinePdf, dielineSvg, type DielineStyle } from "@/lib/dieline";
import "./manufacturing/make.css";
import "./calculators.css";

const inr = (value: number, digits = 0) => `₹${value.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
const unitRate = (value: number) => `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Faqs({ faqs }: { faqs: Array<[string, string]> }) {
  return (
    <section className="mk-section is-paper">
      <div className="mk-wrap mk-faq-grid">
        <div className="mk-intro"><p className="mk-label">Questions</p><h2>Good to know.</h2></div>
        <div className="mk-faq">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<Plus size={20} /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function OtherCalculators({ current }: { current?: string }) {
  return (
    <section className="mk-section">
      <div className="mk-wrap">
        <div className="mk-head-row">
          <div className="mk-intro"><p className="mk-label">More free tools</p><h2>Other packaging calculators.</h2></div>
          <Link className="mk-link" href="/calculators">All calculators <ArrowRight size={15} /></Link>
        </div>
        <div className="cx-tiles">
          {CALCULATORS.filter((c) => c.slug !== current).map((c) => (
            <Link key={c.slug} href={`/calculators/${c.slug}`} className="cx-tile">
              <span className="cx-tile-icon">{c.slug === "dieline-generator" ? <PenTool size={18} /> : c.kind === "tool" ? <Scale size={18} /> : <CalcIcon size={18} />}</span>
              <b>{c.name}</b>
              <small>{c.short}</small>
              <i><ArrowUpRight size={16} /></i>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── "Email me this price" ─────────────────────────────────────────────────────

type SavedPrice = {
  calculator: string;
  skuCode: string;
  product: string;
  size?: string;
  quantity: number;
  unitLabel: string;
  options: Record<string, string>;
  unitPrice: number;
  total: number;
  exact: boolean;
  orderPath: string;
};

function SavePrice({ price }: { price: SavedPrice }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [emailed, setEmailed] = useState(true);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("sending");
    setError("");
    const summary = `${price.quantity.toLocaleString("en-IN")} ${price.unitLabel} · ${price.product}${price.size ? ` · ${price.size}` : ""} — ${inr(price.unitPrice, 2)} each, ${price.exact ? "total" : "estimated total"} ${inr(price.total)}`;
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "calculator_quote",
          name: name.trim() || "Calculator visitor",
          email: email.trim(),
          phone: phone.trim(),
          subject: `Calculator price · ${price.product}`,
          message: `Saved a price on the ${price.calculator} calculator: ${summary}`,
          metadata: {
            calculator: price.calculator,
            sku_code: price.skuCode,
            product: price.product,
            size: price.size,
            quantity: price.quantity,
            unit_label: price.unitLabel,
            options: price.options,
            unit_price: Number(price.unitPrice.toFixed(2)),
            total: Math.round(price.total),
            exact: price.exact,
            order_path: price.orderPath,
            page: typeof window !== "undefined" ? window.location.pathname : undefined,
          },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not save your price");
      setEmailed(body.emailed !== false);
      setState("sent");
    } catch (cause) {
      setState("error");
      setError(cause instanceof Error ? cause.message : "Could not save your price");
    }
  };

  if (state === "sent") {
    return <p className="cx-saved"><CheckCircle2 size={16} /> {emailed
      ? <>Sent to {email}. Check your inbox — the link takes you straight back to this order.</>
      : <>Saved. Our team will email it to {email} shortly.</>}</p>;
  }
  if (!open) {
    return <button type="button" className="cx-save-toggle" onClick={() => setOpen(true)}><Mail size={15} /> Email me this price</button>;
  }
  return (
    <form className="cx-save" onSubmit={submit}>
      <p>We'll email this price with a link back to the order — and check in once tomorrow. No spam.</p>
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <div>
        <input type="text" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <input type="tel" placeholder="WhatsApp (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      </div>
      <button type="submit" disabled={state === "sending"}>{state === "sending" ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : "Send my price"}</button>
      {state === "error" && <small>{error}</small>}
    </form>
  );
}

// ── Price calculator ──────────────────────────────────────────────────────────

function PriceCalculatorView({ calc }: { calc: PriceCalculator }) {
  const skus = useMemo(
    () => calc.codes.map((code) => CATALOG_SKUS.find((sku) => sku.code === code)).filter((sku): sku is CatalogSku => Boolean(sku && COMMERCE_PRODUCTS[sku.code])),
    [calc],
  );
  const [code, setCode] = useState(skus[0]?.code || "");
  const sku = skus.find((s) => s.code === code) || skus[0];
  const product = sku ? COMMERCE_PRODUCTS[sku.code] : undefined;
  const [sizeCode, setSizeCode] = useState(product?.sizes[1]?.code || product?.sizes[0]?.code || "");
  const [options, setOptions] = useState<Record<string, string>>({});
  const [artwork, setArtwork] = useState<"upload" | "design">("upload");
  const [qtyInput, setQtyInput] = useState("");

  const configuration = useMemo(() => {
    const config: Record<string, string> = {};
    sku?.variants.forEach((group) => { config[group.key] = options[group.key] && group.options.includes(options[group.key]) ? options[group.key] : group.options[0]; });
    return config;
  }, [sku, options]);
  const minQty = sku ? getMinimumQuantityForConfiguration(sku.code, configuration) || sku.moq : 1;
  const tiers = sku ? getEffectiveCommerceTiers(sku.code).filter((tier) => tier.minQty >= minQty) : [];
  const ladder = tiers.length ? tiers.map((tier) => tier.minQty) : [minQty];
  const qty = Math.max(minQty, parseInt(qtyInput) || ladder[Math.min(1, ladder.length - 1)]);

  // Picking a product resets the size and options to that product's own defaults.
  const choose = (next: string) => {
    setCode(next);
    const sizes = COMMERCE_PRODUCTS[next]?.sizes || [];
    setSizeCode(sizes[1]?.code || sizes[0]?.code || "");
    setOptions({});
    setQtyInput("");
  };
  useEffect(() => {
    if (product && !product.sizes.some((s) => s.code === sizeCode)) setSizeCode(product.sizes[0]?.code || "");
  }, [product, sizeCode]);

  if (!sku || !product) return null;
  const estimate = calculateOrderEstimate(sku, qty, "standard", artwork, sizeCode, configuration) as ReturnType<typeof calculateOrderEstimate> & {
    total?: number; gst?: number; subtotal?: number; paymentEligible?: boolean;
  };
  const exact = typeof estimate.total === "number" && estimate.low === estimate.high;
  const onlineOrder = exact && sku.publicBuyingPath === "instant" && !requiresQuote(sku, qty) && estimate.paymentEligible !== false;
  const total = exact ? estimate.total! : estimate.low;
  const perPiece = exact ? total / qty : estimate.low / qty;
  const size = product.sizes.find((s) => s.code === sizeCode);
  const unitLabel = sku.moq_unit === "units" ? "piece" : sku.moq_unit.replace(/s$/, "");
  const orderHref = `${getConfigureHref(sku, qty)}&size=${encodeURIComponent(sizeCode)}&qty=${qty}&config=${encodeURIComponent(JSON.stringify(configuration))}`;

  const ladderRows = ladder.slice(0, 6).map((q) => {
    const e = calculateOrderEstimate(sku, q, "standard", artwork, sizeCode, configuration) as typeof estimate;
    const t = typeof e.total === "number" && e.low === e.high ? e.total : e.low;
    return { q, unit: e.unit, total: t };
  });

  return (
    <div className="cx-tool">
      <div className="cx-inputs">
        <fieldset className="cx-field">
          <legend>1 · Product</legend>
          <div className="cx-products">
            {skus.map((s) => (
              <button key={s.code} type="button" className={`cx-product ${s.code === sku.code ? "is-on" : ""}`} onClick={() => choose(s.code)}>
                <img src={getCatalogImage(s)} alt="" loading="lazy" />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="cx-field">
          <legend>2 · Size</legend>
          <div className="cx-chips">
            {product.sizes.map((s) => (
              <button key={s.code} type="button" className={`cx-chip ${s.code === sizeCode ? "is-on" : ""}`} onClick={() => setSizeCode(s.code)}>
                <b>{formatMeasurementInCm(s.label)}</b>
                <small>{formatMeasurementInCm(s.detail)}</small>
              </button>
            ))}
          </div>
        </fieldset>

        {sku.variants.length > 0 && (
          <fieldset className="cx-field">
            <legend>3 · Options</legend>
            <div className="cx-selects">
              {sku.variants.map((group) => (
                <label key={group.key}>
                  <span>{group.label}</span>
                  <select value={configuration[group.key]} onChange={(e) => { setOptions((prev) => ({ ...prev, [group.key]: e.target.value })); }}>
                    {group.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="cx-field">
          <legend>{sku.variants.length ? "4" : "3"} · Quantity</legend>
          <div className="cx-qty">
            {ladder.slice(0, 6).map((q) => (
              <button key={q} type="button" className={`cx-chip is-qty ${q === qty ? "is-on" : ""}`} onClick={() => setQtyInput(String(q))}>
                <b>{q.toLocaleString("en-IN")}</b>
              </button>
            ))}
            <input
              type="number"
              inputMode="numeric"
              min={minQty}
              value={qtyInput}
              placeholder="Other"
              aria-label="Custom quantity"
              onChange={(e) => setQtyInput(e.target.value)}
            />
          </div>
          {parseInt(qtyInput) > 0 && parseInt(qtyInput) < minQty && <p className="cx-note">Minimum order is {minQty.toLocaleString("en-IN")} {sku.moq_unit} — priced at the minimum.</p>}
        </fieldset>

        <fieldset className="cx-field">
          <legend>{sku.variants.length ? "5" : "4"} · Artwork</legend>
          <div className="cx-toggle">
            <button type="button" className={artwork === "upload" ? "is-on" : ""} onClick={() => setArtwork("upload")}>I have artwork</button>
            <button type="button" className={artwork === "design" ? "is-on" : ""} onClick={() => setArtwork("design")}>Design it for me (+{inr(1999)})</button>
          </div>
        </fieldset>
      </div>

      <a className="cx-mobile-bar" href="#cx-result">
        <span><b>{unitRate(estimate.unit || perPiece)}</b> per {unitLabel}</span>
        <span>{exact ? inr(total) : `from ${inr(estimate.low)}`} total <ArrowRight size={14} /></span>
      </a>

      <aside className="cx-result" id="cx-result" aria-live="polite">
        <p className="cx-result-label">{onlineOrder ? "Your price · order online" : "Your estimate · reviewed quote"}</p>
        <div className="cx-result-unit">
          <strong>{unitRate(estimate.unit || perPiece)}</strong>
          <span>per {unitLabel}<br />before GST</span>
        </div>
        <dl className="cx-breakdown">
          <div><dt>{qty.toLocaleString("en-IN")} × {sku.name}{size ? ` · ${formatMeasurementInCm(size.label)}` : ""}</dt><dd>{inr(estimate.material || 0)}</dd></div>
          {estimate.setup > 0 && <div><dt>Setup & plates</dt><dd>{inr(estimate.setup)}</dd></div>}
          {estimate.artwork > 0 && <div><dt>Design service</dt><dd>{inr(estimate.artwork)}</dd></div>}
          <div><dt>Delivery across India</dt><dd>{estimate.logistics ? inr(estimate.logistics) : "Free"}</dd></div>
          {exact && <div><dt>GST (18%)</dt><dd>{inr(estimate.gst || 0)}</dd></div>}
        </dl>
        <div className="cx-total">
          <span>{exact ? "Total incl. GST & delivery" : "Estimated total"}</span>
          <strong>{exact ? inr(total, 2) : `${inr(estimate.low)} – ${inr(estimate.high)}`}</strong>
        </div>
        <Link className="mk-btn is-ink cx-cta" href={orderHref}>
          {onlineOrder ? "Order this now" : "Get my exact price"} <ArrowRight size={16} />
        </Link>
        <p className="cx-fine">
          {onlineOrder
            ? "Same price at checkout. Pay securely with Razorpay; production starts after artwork approval."
            : "Free to request. Our team confirms the exact price within 4 business hours — nothing to pay until you approve."}
        </p>
        <SavePrice
          key={`${sku.code}-${sizeCode}-${qty}-${JSON.stringify(configuration)}`}
          price={{
            calculator: calc.name,
            skuCode: sku.code,
            product: sku.name,
            size: size ? formatMeasurementInCm(size.label) : undefined,
            quantity: qty,
            unitLabel: sku.moq_unit === "units" ? "pcs" : sku.moq_unit,
            options: Object.fromEntries(sku.variants.map((group) => [group.label, configuration[group.key]])),
            unitPrice: estimate.unit || perPiece,
            total,
            exact,
            orderPath: orderHref,
          }}
        />
        <Link className="cx-sample" href="/samples">Feel it first — sample kit {inr(299)} <ArrowRight size={14} /></Link>
      </aside>

      <div className="cx-ladder">
        <p className="mk-label">Price ladder · {sku.name}{size ? `, ${formatMeasurementInCm(size.label)}` : ""}</p>
        <table>
          <thead><tr><th>Quantity</th><th>Per {unitLabel}</th><th>Order total</th></tr></thead>
          <tbody>
            {ladderRows.map((row) => (
              <tr key={row.q} className={row.q === qty ? "is-on" : ""} onClick={() => setQtyInput(String(row.q))}>
                <td>{row.q.toLocaleString("en-IN")}</td>
                <td>{unitRate(row.unit)}</td>
                <td>{inr(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="cx-fine">Per-piece prices are before GST. Totals include GST and standard delivery. <Link href={`/products/${sku.slug}`}>See {sku.name.toLowerCase()} details</Link>.</p>
      </div>
    </div>
  );
}

// ── Volumetric weight ─────────────────────────────────────────────────────────

const roundUpHalf = (kg: number) => Math.ceil(kg * 2) / 2;

function VolumetricView() {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [dims, setDims] = useState({ l: "30", w: "20", h: "15" });
  const [actual, setActual] = useState("1");
  const [boxes, setBoxes] = useState("1");
  const [divisor, setDivisor] = useState(5000);

  const toCm = (value: string) => (parseFloat(value) || 0) * (unit === "in" ? 2.54 : 1);
  const [l, w, h] = [toCm(dims.l), toCm(dims.w), toCm(dims.h)];
  const volumetric = (l * w * h) / divisor;
  const actualKg = parseFloat(actual) || 0;
  const count = Math.max(1, parseInt(boxes) || 1);
  const chargeable = roundUpHalf(Math.max(volumetric, actualKg));
  const volumetricWins = volumetric > actualKg;
  // How much each side must shrink (proportionally) for volumetric weight to match the real weight.
  const shrink = volumetricWins && actualKg > 0 ? 1 - Math.cbrt((actualKg * divisor) / (l * w * h)) : 0;

  const setDim = (key: "l" | "w" | "h") => (e: React.ChangeEvent<HTMLInputElement>) => setDims((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="cx-tool">
      <div className="cx-inputs">
        <fieldset className="cx-field">
          <legend>1 · Box size</legend>
          <div className="cx-toggle is-small">
            <button type="button" className={unit === "cm" ? "is-on" : ""} onClick={() => setUnit("cm")}>Centimetres</button>
            <button type="button" className={unit === "in" ? "is-on" : ""} onClick={() => setUnit("in")}>Inches</button>
          </div>
          <div className="cx-dims">
            <label><span>Length</span><input type="number" inputMode="decimal" min="0" value={dims.l} onChange={setDim("l")} /><i>{unit}</i></label>
            <label><span>Width</span><input type="number" inputMode="decimal" min="0" value={dims.w} onChange={setDim("w")} /><i>{unit}</i></label>
            <label><span>Height</span><input type="number" inputMode="decimal" min="0" value={dims.h} onChange={setDim("h")} /><i>{unit}</i></label>
          </div>
        </fieldset>
        <fieldset className="cx-field">
          <legend>2 · Actual weight & boxes</legend>
          <div className="cx-dims is-two">
            <label><span>Actual weight per box</span><input type="number" inputMode="decimal" min="0" value={actual} onChange={(e) => setActual(e.target.value)} /><i>kg</i></label>
            <label><span>Number of boxes</span><input type="number" inputMode="numeric" min="1" value={boxes} onChange={(e) => setBoxes(e.target.value)} /><i>boxes</i></label>
          </div>
        </fieldset>
        <fieldset className="cx-field">
          <legend>3 · Courier divisor</legend>
          <div className="cx-toggle">
            {[[5000, "5,000 · express & e-commerce"], [4000, "4,000 · some air"], [6000, "6,000"]].map(([value, label]) => (
              <button key={value} type="button" className={divisor === value ? "is-on" : ""} onClick={() => setDivisor(Number(value))}>{label}</button>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="cx-result" aria-live="polite">
        <p className="cx-result-label">Chargeable weight per box</p>
        <div className="cx-result-unit">
          <strong>{chargeable.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg</strong>
          <span>billed on<br />{volumetricWins ? "volume" : "actual weight"}</span>
        </div>
        <dl className="cx-breakdown">
          <div><dt>Volumetric weight</dt><dd>{volumetric.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg</dd></div>
          <div><dt>Actual weight</dt><dd>{actualKg.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg</dd></div>
          <div><dt>Formula</dt><dd>{Math.round(l)} × {Math.round(w)} × {Math.round(h)} cm ÷ {divisor.toLocaleString("en-IN")}</dd></div>
        </dl>
        <div className="cx-total">
          <span>Total chargeable · {count} {count === 1 ? "box" : "boxes"}</span>
          <strong>{(chargeable * count).toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg</strong>
        </div>
        {volumetricWins && shrink > 0.02 && (
          <p className="cx-tip"><Box size={15} /> You're paying for air. A box about {Math.round(shrink * 100)}% smaller on each side would be billed on its real weight.</p>
        )}
        <Link className="mk-btn is-ink cx-cta" href="/calculators/box-price">Price a right-sized box <ArrowRight size={16} /></Link>
        <p className="cx-fine">Couriers usually round up to the next 0.5 kg. Check your courier's rate card for its exact divisor and slabs.</p>
      </aside>
    </div>
  );
}

// ── Dieline generator ────────────────────────────────────────────────────────

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function DielineView() {
  const [style, setStyle] = useState<DielineStyle>("rte");
  const preset = DIELINE_STYLES.find((s) => s.id === style)!;
  const [dims, setDims] = useState({ L: String(preset.defaults.L), W: String(preset.defaults.W), H: String(preset.defaults.H), t: String(preset.defaults.t) });
  const pick = (next: DielineStyle) => {
    const p = DIELINE_STYLES.find((s) => s.id === next)!;
    setStyle(next);
    setDims({ L: String(p.defaults.L), W: String(p.defaults.W), H: String(p.defaults.H), t: String(p.defaults.t) });
  };
  const n = (v: string, lo: number, hi: number) => Math.min(hi, Math.max(lo, parseFloat(v) || lo));
  const L = n(dims.L, 10, 1200), W = n(dims.W, 5, 1200), H = n(dims.H, 5, 1200), t = n(dims.t, 0, 10);
  const dieline = useMemo(() => buildDieline(style, L, W, H, t), [style, L, W, H, t]);
  const svg = useMemo(() => dielineSvg(dieline), [dieline]);
  const title = `${preset.name} ${L} x ${W} x ${H} mm (internal)`;
  const file = `packworkz-dieline-${style}-${L}x${W}x${H}mm`;
  const set = (key: "L" | "W" | "H" | "t") => (e: React.ChangeEvent<HTMLInputElement>) => setDims((prev) => ({ ...prev, [key]: e.target.value }));
  const boxSku = style === "rsc" ? "EC-502" : style === "sleeve" ? "BX-405" : "BX-401";

  return (
    <div className="cx-tool is-dieline">
      <div className="cx-inputs">
        <fieldset className="cx-field">
          <legend>1 · Box style</legend>
          <div className="cx-styles">
            {DIELINE_STYLES.map((s) => (
              <button key={s.id} type="button" className={`cx-style ${s.id === style ? "is-on" : ""}`} onClick={() => pick(s.id)}>
                <b>{s.name}</b>
                <small>{s.detail}</small>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="cx-field">
          <legend>2 · Internal size</legend>
          <div className="cx-dims is-four">
            <label><span>Length</span><input type="number" inputMode="decimal" min="10" value={dims.L} onChange={set("L")} /><i>mm</i></label>
            <label><span>Width (depth)</span><input type="number" inputMode="decimal" min="5" value={dims.W} onChange={set("W")} /><i>mm</i></label>
            <label><span>Height</span><input type="number" inputMode="decimal" min="5" value={dims.H} onChange={set("H")} /><i>mm</i></label>
            <label><span>Board</span><input type="number" inputMode="decimal" min="0" step="0.1" value={dims.t} onChange={set("t")} /><i>mm</i></label>
          </div>
          <p className="cx-note is-quiet">Measure the product, then add a few millimetres of room on each side. Board: ~0.4 mm for cartons, 3 mm for 3-ply and 5 mm for 5-ply corrugated.</p>
        </fieldset>
      </div>

      <aside className="cx-result">
        <p className="cx-result-label">Flat size</p>
        <div className="cx-result-unit">
          <strong>{Math.round(dieline.width)} × {Math.round(dieline.height)}</strong>
          <span>mm<br />sheet before folding</span>
        </div>
        <dl className="cx-breakdown">
          <div><dt>Style</dt><dd>{preset.name}</dd></div>
          <div><dt>Internal size</dt><dd>{L} × {W} × {H} mm</dd></div>
          <div><dt>Legend</dt><dd>— cut · - - fold</dd></div>
        </dl>
        <div className="cx-downloads">
          <button type="button" className="mk-btn is-ink cx-cta" onClick={() => download(dielinePdf(dieline, title), `${file}.pdf`)}><Download size={16} /> Download PDF</button>
          <button type="button" className="cx-save-toggle" onClick={() => download(new Blob([dielineSvg(dieline, { title, forDownload: true })], { type: "image/svg+xml" }), `${file}.svg`)}><Download size={15} /> Download SVG</button>
        </div>
        <p className="cx-fine">True 1:1 scale. Keep artwork 3 mm past cut lines. Our prepress team checks it against the converter's die before printing.</p>
        <Link className="cx-sample" href={`/calculators/box-price`}>Price this box <ArrowRight size={14} /></Link>
        <a className="cx-sample" href={`https://wa.me/918208990366?text=${encodeURIComponent(`Hi Packworkz, I made a ${preset.name.toLowerCase()} dieline (${L} x ${W} x ${H} mm). Can you print it and share a free 3D mockup?`)}`} target="_blank" rel="noreferrer">Free 3D mockup on WhatsApp <ArrowRight size={14} /></a>
      </aside>

      <div className="cx-dieline">
        <div className="cx-dieline-head">
          <p className="mk-label"><PenTool size={13} /> Preview · {title}</p>
          <Link className="mk-link" href={`/products/${CATALOG_SKUS.find((sku) => sku.code === boxSku)?.slug || ""}`}>Order this box style <ArrowRight size={14} /></Link>
        </div>
        <div className="cx-dieline-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
        <ul className="cx-dieline-notes">{dieline.notes.map((note) => <li key={note}>{note}</li>)}</ul>
      </div>
    </div>
  );
}

// ── Pages ─────────────────────────────────────────────────────────────────────

export function CalculatorPage({ params }: { params: { slug: string } }) {
  const calc = CALCULATOR_BY_SLUG[params.slug];
  if (!calc) return <CalculatorsHub />;
  return (
    <main className="mk cx">
      <section className="cx-hero">
        <div className="mk-wrap">
          <nav className="mk-crumbs"><Link href="/calculators">Calculators</Link><span>/</span>{calc.name}</nav>
          <h1>{calc.h1}</h1>
          <p className="mk-lede">{calc.intro}</p>
        </div>
      </section>
      <section className="cx-body">
        <div className="mk-wrap">
          {calc.kind === "price" ? <PriceCalculatorView calc={calc} /> : calc.slug === "dieline-generator" ? <DielineView /> : <VolumetricView />}
        </div>
      </section>
      <Faqs faqs={calc.faqs} />
      <OtherCalculators current={calc.slug} />
    </main>
  );
}

export default function CalculatorsHub() {
  const price = CALCULATORS.filter((c): c is PriceCalculator => c.kind === "price");
  const tools = CALCULATORS.filter((c): c is ToolCalculator => c.kind === "tool");
  return (
    <main className="mk cx">
      <section className="cx-hero">
        <div className="mk-wrap">
          <nav className="mk-crumbs"><Link href="/products">Packaging</Link><span>/</span>Calculators</nav>
          <h1>Packaging calculators</h1>
          <p className="mk-lede">Real prices for custom packaging in seconds — the same numbers you pay at checkout, with GST and delivery included. Free, no sign-up.</p>
        </div>
      </section>
      <section className="cx-body">
        <div className="mk-wrap">
          <p className="mk-label">Price calculators</p>
          <div className="cx-hub">
            {price.map((c) => {
              const first = CATALOG_SKUS.find((sku) => sku.code === c.codes[0]);
              return (
                <Link key={c.slug} href={`/calculators/${c.slug}`} className="cx-hub-card">
                  {first && <figure><img src={getCatalogImage(first)} alt="" loading="lazy" /></figure>}
                  <div>
                    <b>{c.name}</b>
                    <small>{c.short}</small>
                    <span>Open calculator <ArrowRight size={14} /></span>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="mk-label" style={{ marginTop: 56 }}>Design & shipping tools</p>
          <div className="cx-tiles">
            {tools.map((c) => (
              <Link key={c.slug} href={`/calculators/${c.slug}`} className="cx-tile">
                <span className="cx-tile-icon">{c.slug === "dieline-generator" ? <PenTool size={18} /> : <Scale size={18} />}</span>
                <b>{c.name}</b>
                <small>{c.short}</small>
                <i><ArrowUpRight size={16} /></i>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
