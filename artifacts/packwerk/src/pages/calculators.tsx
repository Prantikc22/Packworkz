import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Box, Calculator as CalcIcon, Plus, Scale } from "lucide-react";
import { COMMERCE_PRODUCTS, formatMeasurementInCm, getEffectiveCommerceTiers, getMinimumQuantityForConfiguration } from "@workspace/commerce";
import { CATALOG_SKUS, getCatalogImage, getConfigureHref, requiresQuote, type CatalogSku } from "@/lib/catalog";
import { calculateOrderEstimate } from "@/lib/pricing";
import { CALCULATORS, CALCULATOR_BY_SLUG, type PriceCalculator, type ToolCalculator } from "@/lib/calculators";
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
              <span className="cx-tile-icon">{c.kind === "tool" ? <Scale size={18} /> : <CalcIcon size={18} />}</span>
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
          {calc.kind === "price" ? <PriceCalculatorView calc={calc} /> : <VolumetricView />}
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
          <p className="mk-label" style={{ marginTop: 56 }}>Shipping tools</p>
          <div className="cx-tiles">
            {tools.map((c) => (
              <Link key={c.slug} href={`/calculators/${c.slug}`} className="cx-tile">
                <span className="cx-tile-icon"><Scale size={18} /></span>
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
