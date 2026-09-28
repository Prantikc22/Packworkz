import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { CATALOG_SKUS, getCatalogImage, requiresQuote, type CatalogSku } from "@/lib/catalog";
import { calculateOrderEstimate } from "@/lib/pricing";
import { formatUnitRate, getIndicativePrice } from "@/lib/indicative-pricing";
import { formatINR } from "@/lib/format";
import { COMMERCE_PRODUCTS } from "@workspace/commerce";
import { trackMarketingEvent } from "@/lib/analytics";

const FORMATS: Array<{ code: string; label: string }> = [
  { code: "EC-501", label: "Mailer box" },
  { code: "FP-101", label: "Stand-up pouch" },
  { code: "LC-816", label: "Round labels" },
  { code: "BX-401", label: "Folding carton" },
  { code: "EC-510", label: "Paper carry bag" },
  { code: "BC-201", label: "Bottles & jars" },
  { code: "FP-109", label: "Coffee pouch" },
  { code: "BX-413", label: "Pillow box" },
];

function quantityOptions(sku: CatalogSku) {
  const tiers = Array.from(new Set((sku.price_tiers || []).map((tier) => Math.max(tier.min_qty, sku.moq)))).sort((a, b) => a - b);
  return tiers.length ? tiers.slice(0, 5) : [sku.moq];
}

/** Search-style bar: pick a format and quantity, see a real price, jump into the builder. */
export function HeroQuickPrice() {
  const formats = useMemo(() => FORMATS
    .map((format) => ({ ...format, sku: CATALOG_SKUS.find((sku) => sku.code === format.code) }))
    .filter((item): item is { code: string; label: string; sku: CatalogSku } => Boolean(item.sku)), []);
  const [code, setCode] = useState(formats[0]?.code);
  // Hide the floating sample button while the hero bar is on screen so they never overlap.
  useEffect(() => {
    const update = () => document.body.classList.toggle("pw-at-hero", window.scrollY < 560);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); document.body.classList.remove("pw-at-hero"); };
  }, []);
  const active = formats.find((item) => item.code === code) || formats[0];
  const sku = active.sku;
  const options = quantityOptions(sku);
  const [quantity, setQuantity] = useState(options[Math.min(1, options.length - 1)]);
  const qty = options.includes(quantity) ? quantity : options[0];

  const sizeCode = COMMERCE_PRODUCTS[sku.code]?.sizes[0]?.code;
  const estimate = calculateOrderEstimate(sku, qty, "standard", "upload", sizeCode, Object.fromEntries(sku.variants.map((variant) => [variant.key, variant.options[0]])));
  const exact = sku.publicBuyingPath === "instant" && !requiresQuote(sku, qty) && typeof estimate.total === "number";
  const indicative = getIndicativePrice(sku, qty);
  const unit = exact ? ((estimate.material || 0) - (estimate.discount || 0)) / qty : indicative.unitLow;
  const unitLabel = sku.moq_unit.replace(/s$/, "");

  const chooseFormat = (next: string) => {
    setCode(next);
    const nextSku = formats.find((item) => item.code === next)?.sku;
    if (nextSku) { const nextOptions = quantityOptions(nextSku); setQuantity(nextOptions[Math.min(1, nextOptions.length - 1)]); }
  };

  return (
    <form className="pw-qp" aria-label="Instant price check" onSubmit={(event) => event.preventDefault()}>
      <div className="pw-qp-tag"><Sparkles size={16} /><span>Instant<br />price</span></div>
      <label className="pw-qp-field is-format">
        <img src={getCatalogImage(sku)} alt="" />
        <span className="pw-qp-field-body">
          <small>Packaging</small>
          <select value={code} onChange={(event) => chooseFormat(event.target.value)} aria-label="Packaging format">
            {formats.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
          </select>
        </span>
        <ChevronDown size={16} />
      </label>
      <label className="pw-qp-field">
        <span className="pw-qp-field-body">
          <small>Quantity</small>
          <select value={qty} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Quantity">
            {options.map((option) => <option key={option} value={option}>{option.toLocaleString("en-IN")} {sku.moq_unit}</option>)}
          </select>
        </span>
        <ChevronDown size={16} />
      </label>
      <div className="pw-qp-field is-price" aria-live="polite" key={`${code}-${qty}`}>
        <span className="pw-qp-field-body">
          <small>{exact ? "Your price" : "From (estimate)"}</small>
          <b>{formatUnitRate(unit)}<i>/{unitLabel}</i></b>
        </span>
        <span className="pw-qp-total">{exact ? `${formatINR(estimate.total || 0)} total` : `≈ ${formatINR(indicative.totalLow)}+`}</span>
      </div>
      <Link href={`/products/${sku.slug}`} className="pw-qp-cta" onClick={() => trackMarketingEvent("hero_quick_price_clicked", { sku: sku.code, quantity: qty })}>
        Customise <ArrowRight size={17} />
      </Link>
    </form>
  );
}
