import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, Redirect, useLocation, useSearch } from "wouter";
import {
  AlertTriangle, ArrowRight, BadgeCheck, Box, CheckCircle2, ChevronRight, Clock3, FileUp, Image as ImageIcon,
  Loader2, Minus, Palette, Plus, Rotate3D, ShieldCheck, ShoppingCart, Sparkles, Truck, Upload,
} from "lucide-react";
import { calculateOrderEstimate } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { getCategoryBySlug } from "@/lib/skus";
import { CATALOG_SKUS, getCatalogImage, getCategoryLabel, requiresQuote, type CatalogSku } from "@/lib/catalog";
import { ARTICLES } from "@/lib/resources-data";
import { createConfiguredCartItem, useCart } from "@/lib/cart";
import { formatRupeeRange, formatUnitRate, getIndicativePrice } from "@/lib/indicative-pricing";
import { ARTWORK_ACCEPT, uploadArtwork } from "@/lib/artwork-upload";
import { MOCKUP_FORMAT_BY_SKU, dataUrlToFile, loadStudioDesign, type StudioDesign } from "@/lib/studio-handoff";
import { trackMarketingEvent } from "@/lib/analytics";
import {
  COMMERCE_PRODUCTS,
  LAUNCH_PROMOTION_CODE,
  RAZORPAY_PAYMENT_LIMIT_RUPEES,
  formatMeasurementInCm,
  getMinimumQuantityForConfiguration,
} from "@workspace/commerce";
import "./product-builder.css";

const MockupCanvas = lazy(() => import("@/components/mockup/PackagingMockupCanvas").then((module) => ({ default: module.PackagingMockupCanvas })));

const LEGACY_SLUG_ALIASES: Record<string, string> = {
  "hdpe-bottle": "plastic-bottle",
  "mono-carton": "folding-carton",
  "corrugated-box": "corrugated-shipping-box",
  "poly-mailer": "courier-bag",
  "kraft-mailer": "mailer-box",
  "compostable-mailer": "compostable-packaging",
  "shrink-sleeve": "labels",
  "paper-labels-stickers": "round-paper-labels",
  "folding-carton": "straight-tuck-end-carton",
  "rigid-box": "two-piece-rigid-box",
  "paper-cup": "compostable-bio-paper-cups",
};

const LEGACY_CATEGORY_SLUGS = new Set(["flexible", "bottles", "tubes", "boxes", "ecommerce", "protective", "rolls", "labels", "sustainable"]);

// Complementary items bought together, by category.
const PAIRS_WELL: Record<string, string[]> = {
  ecommerce: ["LC-810", "LC-811", "LC-808", "PR-601"],
  boxes: ["LC-810", "PR-602", "LC-815", "EC-501"],
  flexible: ["LC-816", "EC-502", "LC-804", "FP-106"],
  bottles: ["LC-804", "LC-806", "BX-401", "PR-601"],
  tubes: ["BX-401", "LC-805", "BC-204", "EC-501"],
  labels: ["EC-501", "FP-101", "LC-811", "BX-413"],
  sustainable: ["EC-510", "LC-816", "SP-909", "SP-912"],
  protective: ["EC-501", "EC-502", "LC-811", "LC-810"],
  rolls: ["LC-814", "FP-101", "EC-502", "LC-806"],
};

type ArtworkChoice = "upload" | "later" | "design";
const DESIGN_FEE = 1999;

function PriceLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`pb-line${strong ? " is-strong" : ""}`}><span>{label}</span><b>{value}</b></div>;
}

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const canonicalSlug = LEGACY_SLUG_ALIASES[slug] || slug;
  const product = CATALOG_SKUS.find((sku) => sku.slug === canonicalSlug);

  if (LEGACY_CATEGORY_SLUGS.has(slug)) return <Redirect to={`/products?category=${slug}`} replace />;
  if (canonicalSlug !== slug) return <Redirect to={`/products/${canonicalSlug}`} replace />;
  if (!product) {
    return (
      <main className="pb-missing">
        <h1>Product not found</h1>
        <Link href="/products">Back to the catalogue</Link>
      </main>
    );
  }
  return <ProductBuilder key={product.code} product={product} />;
}

function ProductBuilder({ product }: { product: CatalogSku }) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { addItem } = useCart();
  const commerce = COMMERCE_PRODUCTS[product.code];
  const mockupFormat = MOCKUP_FORMAT_BY_SKU[product.code];
  const fromStudio = new URLSearchParams(search).get("studio") === "1";

  const [sizeCode, setSizeCode] = useState(() => commerce?.sizes[0]?.code || "");
  const [variants, setVariants] = useState<Record<string, string>>(() => Object.fromEntries(product.variants.map((variant) => [variant.key, variant.options[0]])));
  const [sizeMode, setSizeMode] = useState<"standard" | "custom">("standard");
  const [customSpecs, setCustomSpecs] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(product.moq);
  const [quantityDraft, setQuantityDraft] = useState(String(product.moq));
  const [artworkChoice, setArtworkChoice] = useState<ArtworkChoice>("upload");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkUrl, setArtworkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [media, setMedia] = useState<"photo" | "3d">(fromStudio && mockupFormat ? "3d" : "photo");
  const [studioDesign, setStudioDesign] = useState<StudioDesign>();
  const [detailTab, setDetailTab] = useState<"overview" | "specs" | "delivery">("overview");
  const [added, setAdded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackMarketingEvent("product_viewed", { sku: product.code });
    if (fromStudio) setStudioDesign(loadStudioDesign(product.code));
  }, [fromStudio, product.code]);

  const minimumQuantity = Math.max(product.moq, commerce ? getMinimumQuantityForConfiguration(product.code, variants) : 0);
  useEffect(() => {
    if (quantity < minimumQuantity) { setQuantity(minimumQuantity); setQuantityDraft(String(minimumQuantity)); }
  }, [minimumQuantity, quantity]);

  const unitLabel = product.moq_unit.replace(/s$/, "");
  const estimate = calculateOrderEstimate(product, quantity, "standard", artworkChoice === "design" ? "design" : "upload", sizeCode || undefined, variants);
  const hasExactPrice = product.publicBuyingPath === "instant"
    && !requiresQuote(product, quantity)
    && "total" in estimate && typeof estimate.total === "number"
    && estimate.total <= RAZORPAY_PAYMENT_LIMIT_RUPEES;
  const indicative = getIndicativePrice(product, quantity, variants);
  const designFee = artworkChoice === "design" ? DESIGN_FEE : 0;
  const exactUnit = hasExactPrice && quantity > 0 ? ((estimate.material || 0) - (estimate.discount || 0)) / quantity : 0;

  const tiers = useMemo(() => {
    const source = (product.price_tiers || []).slice(0, 6);
    const base = source[0]?.unit_price || 1;
    return source.map((tier) => ({
      qty: Math.max(tier.min_qty, minimumQuantity),
      unit: tier.unit_price,
      save: Math.round((1 - tier.unit_price / base) * 100),
      bulk: requiresQuote(product, tier.min_qty) && product.publicBuyingPath === "instant",
    })).filter((tier, index, list) => list.findIndex((entry) => entry.qty === tier.qty) === index);
  }, [minimumQuantity, product]);

  const setQty = (value: number) => {
    const next = Math.max(minimumQuantity, Math.round(value) || minimumQuantity);
    setQuantity(next);
    setQuantityDraft(String(next));
  };
  const step = quantity >= 10000 ? 1000 : quantity >= 1000 ? 250 : quantity >= 100 ? 50 : 25;

  const handleFile = async (file: File) => {
    setArtworkFile(file);
    setArtworkUrl("");
    setUploadError("");
    setUploading(true);
    try {
      setArtworkUrl(await uploadArtwork(file));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed. Please retry.");
    } finally {
      setUploading(false);
    }
  };

  const attachStudioRender = async () => {
    const source = studioDesign?.artworkDataUrl || studioDesign?.logoDataUrl;
    if (!source) return;
    await handleFile(await dataUrlToFile(source, `${product.slug}-studio-design`));
  };

  const uploadBlocked = artworkChoice === "upload" && (uploading || (Boolean(artworkFile) && !artworkUrl));
  const specs = sizeMode === "custom" ? Object.fromEntries(Object.entries(customSpecs).filter(([, value]) => value)) : {};
  const studioSpecs: Record<string, string> = studioDesign ? { studio_design: `${studioDesign.brandName} · ${studioDesign.stock} · ${studioDesign.color}` } : {};

  const addToCart = (goToCheckout: boolean) => {
    if (uploadBlocked) return;
    const item = createConfiguredCartItem(product, {
      quantity,
      sizeCode,
      variantSelections: variants,
      customSpecs: {
        ...specs,
        ...studioSpecs,
        ...(artworkChoice === "later" ? { artwork: "Customer will send artwork after ordering" } : {}),
      } as Record<string, string>,
      artworkOption: artworkChoice === "design" ? "design" : "upload",
      artworkFileUrl: artworkChoice === "upload" ? artworkUrl || undefined : undefined,
      deliveryOption: "standard",
    });
    if (!item) return;
    addItem(item);
    trackMarketingEvent(goToCheckout ? "buy_now_clicked" : "add_to_cart", { sku: product.code, quantity, estimated: !hasExactPrice });
    if (goToCheckout) navigate("/cart/checkout");
    else { setAdded(true); window.setTimeout(() => setAdded(false), 2400); }
  };

  const category = getCategoryBySlug(product.category);
  const pairs = (PAIRS_WELL[product.category] || [])
    .map((code) => CATALOG_SKUS.find((sku) => sku.code === code))
    .filter((sku): sku is CatalogSku => Boolean(sku) && sku!.code !== product.code)
    .slice(0, 4);
  const productTerms = `${product.name} ${product.category} ${product.description}`.toLowerCase().split(/[^a-z0-9]+/)
    .filter((term) => term.length > 3 && !["packaging", "custom", "india", "with"].includes(term));
  const guides = ARTICLES
    .map((article) => ({ article, score: productTerms.reduce((score, term) => score + (`${article.title} ${article.description} ${article.keywords.join(" ")}`.toLowerCase().includes(term) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score).slice(0, 3).map(({ article }) => article);

  const priceHeadline = hasExactPrice
    ? <><strong>{formatUnitRate(exactUnit)}</strong><span>/ {unitLabel}</span></>
    : <><strong>{formatUnitRate(indicative.unitLow)} – {formatUnitRate(indicative.unitHigh)}</strong><span>/ {unitLabel} est.</span></>;
  const totalText = hasExactPrice
    ? formatINR(estimate.total || 0)
    : `${formatRupeeRange(indicative.totalLow + designFee, indicative.totalHigh + designFee)}`;
  const ctaLabel = hasExactPrice ? "Add to cart" : "Add to cart";
  const secondaryLabel = hasExactPrice ? "Buy now" : "Get my final price";

  return (
    <main className="pb">
      <nav className="pb-crumbs" aria-label="Breadcrumb">
        <Link href="/products">Packaging</Link><ChevronRight size={14} />
        <Link href={`/products?category=${product.category}`}>{getCategoryLabel(product.category)}</Link><ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      <div className="pb-grid">
        {/* ── Media ── */}
        <section className="pb-media" aria-label="Product preview">
          <div className="pb-stage">
            {media === "3d" && mockupFormat ? (
              <Suspense fallback={<div className="pb-stage-loading"><Loader2 className="animate-spin" /> Loading 3D preview…</div>}>
                <MockupCanvas
                  format={studioDesign?.format || mockupFormat}
                  color={studioDesign?.color || "#172A46"}
                  brandName={studioDesign?.brandName || "Your Brand"}
                  finish={studioDesign?.finish || (/gloss/i.test(Object.values(variants).join(" ")) ? "gloss" : "matte")}
                  stock={studioDesign?.stock || (/kraft/i.test(Object.values(variants).join(" ")) ? "kraft" : "color")}
                  artworkDataUrl={studioDesign?.artworkDataUrl}
                  logoDataUrl={studioDesign?.logoDataUrl}
                  artworkFit={studioDesign?.artworkFit}
                  backdrop="warm"
                  dimensions={studioDesign?.dimensions}
                />
              </Suspense>
            ) : (
              <img src={getCatalogImage(product)} alt={product.name} fetchPriority="high" />
            )}
            <div className="pb-badges">
              {hasExactPrice ? <span className="is-instant"><Truck size={13} /> Ships in {product.delivery_days_india} days</span> : <span className="is-quote"><Clock3 size={13} /> Price locked in 4 business hrs</span>}
              {product.is_eco && <span className="is-eco">Eco option</span>}
            </div>
          </div>
          {mockupFormat && (
            <div className="pb-media-tabs" role="tablist" aria-label="Preview mode">
              <button type="button" role="tab" aria-selected={media === "photo"} className={media === "photo" ? "is-active" : ""} onClick={() => setMedia("photo")}><ImageIcon size={15} /> Photo</button>
              <button type="button" role="tab" aria-selected={media === "3d"} className={media === "3d" ? "is-active" : ""} onClick={() => setMedia("3d")}><Rotate3D size={15} /> 3D preview</button>
              <Link href={`/mockup-studio?format=${mockupFormat}`} className="pb-media-link"><Sparkles size={15} /> Design in 3D Studio</Link>
            </div>
          )}
          {studioDesign && (
            <div className="pb-studio-note"><Sparkles size={16} /><span><b>Your 3D Studio design is loaded.</b> {studioDesign.artworkDataUrl || studioDesign.logoDataUrl ? "Attach it as your artwork below, or upload the print-ready file." : "Upload your print-ready artwork below."}</span></div>
          )}
          <ul className="pb-assurance">
            <li><ShieldCheck size={17} /> Prepress checks every file before print</li>
            <li><BadgeCheck size={17} /> Free digital proof before production</li>
            <li><Box size={17} /> <Link href="/samples">Feel the materials first · ₹299 kit</Link></li>
          </ul>
        </section>

        {/* ── Builder ── */}
        <section className="pb-builder" aria-labelledby="pb-title">
          <p className="pb-eyebrow">{category?.label || product.category} · {product.code}</p>
          <h1 id="pb-title">{product.name}</h1>
          <p className="pb-sub">{product.use_case}</p>

          <div className="pb-price">
            <div className="pb-price-main">{priceHeadline}</div>
            <p>{hasExactPrice ? <>Launch price incl. {LAUNCH_PROMOTION_CODE} saving · MOQ {minimumQuantity.toLocaleString("en-IN")}</> : <>Market-based estimate · MOQ {minimumQuantity.toLocaleString("en-IN")} · pay nothing until you approve</>}</p>
          </div>

          {/* 1. Size */}
          {(commerce?.sizes.length || product.customization_fields.length > 0) && (
            <fieldset className="pb-step">
              <legend><i>1</i> {product.category === "labels" ? "Size" : "Size"}</legend>
              {commerce?.sizes.length ? (
                <div className="pb-chips">
                  {commerce.sizes.map((size) => (
                    <button key={size.code} type="button" className={sizeCode === size.code ? "is-active" : ""} onClick={() => setSizeCode(size.code)} aria-pressed={sizeCode === size.code}>
                      <b>{formatMeasurementInCm(size.label)}</b>{size.detail && <small>{formatMeasurementInCm(size.detail)}</small>}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="pb-chips">
                    <button type="button" className={sizeMode === "standard" ? "is-active" : ""} onClick={() => setSizeMode("standard")}><b>Standard size</b><small>{product.standard_spec || "Recommended by our team"}</small></button>
                    <button type="button" className={sizeMode === "custom" ? "is-active" : ""} onClick={() => setSizeMode("custom")}><b>Custom size</b><small>Enter your dimensions</small></button>
                  </div>
                  {sizeMode === "custom" && (
                    <div className="pb-dims">
                      {product.customization_fields.map((field) => (
                        <label key={field.key}>
                          <span>{field.label}{field.unit ? ` (${field.unit})` : ""}</span>
                          {field.type === "select" ? (
                            <select value={customSpecs[field.key] || ""} onChange={(event) => setCustomSpecs((current) => ({ ...current, [field.key]: event.target.value }))}>
                              <option value="">Select</option>
                              {field.options?.map((option) => <option key={option}>{option}</option>)}
                            </select>
                          ) : (
                            <input type={field.type === "number" ? "number" : "text"} min={0} placeholder={field.placeholder} value={customSpecs[field.key] || ""} onChange={(event) => setCustomSpecs((current) => ({ ...current, [field.key]: event.target.value }))} />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
            </fieldset>
          )}

          {/* 2. Options */}
          {product.variants.length > 0 && (
            <fieldset className="pb-step">
              <legend><i>2</i> Customise</legend>
              {product.variants.map((variant) => (
                <div key={variant.key} className="pb-option">
                  <span>{variant.label}: <b>{variants[variant.key]}</b></span>
                  <div className="pb-pills" role="radiogroup" aria-label={variant.label}>
                    {variant.options.map((option) => (
                      <button key={option} type="button" role="radio" aria-checked={variants[variant.key] === option} className={variants[variant.key] === option ? "is-active" : ""} onClick={() => setVariants((current) => ({ ...current, [variant.key]: option }))}>{option}</button>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>
          )}

          {/* 3. Quantity */}
          <fieldset className="pb-step">
            <legend><i>3</i> Quantity</legend>
            {tiers.length > 1 && (
              <div className="pb-tiers">
                {tiers.map((tier) => (
                  <button key={tier.qty} type="button" className={quantity === tier.qty ? "is-active" : ""} onClick={() => setQty(tier.qty)} aria-pressed={quantity === tier.qty}>
                    <b>{tier.qty.toLocaleString("en-IN")}</b>
                    <span>{formatUnitRate(tier.unit)}/{unitLabel}</span>
                    {tier.save > 0 && <em>Save {tier.save}%</em>}
                    {tier.bulk && <small>Bulk quote</small>}
                  </button>
                ))}
              </div>
            )}
            <div className="pb-qty">
              <button type="button" onClick={() => setQty(quantity - step)} disabled={quantity <= minimumQuantity} aria-label="Decrease quantity"><Minus size={16} /></button>
              <input
                inputMode="numeric"
                value={quantityDraft}
                onChange={(event) => setQuantityDraft(event.target.value.replace(/[^0-9]/g, ""))}
                onBlur={() => setQty(Number(quantityDraft))}
                onKeyDown={(event) => { if (event.key === "Enter") setQty(Number(quantityDraft)); }}
                aria-label={`Quantity in ${product.moq_unit}`}
              />
              <button type="button" onClick={() => setQty(quantity + step)} aria-label="Increase quantity"><Plus size={16} /></button>
              <span>{product.moq_unit} · min {minimumQuantity.toLocaleString("en-IN")}</span>
            </div>
            {product.publicBuyingPath === "instant" && !hasExactPrice && (
              <p className="pb-note"><AlertTriangle size={15} /> Above the online range, we confirm production capacity and a sharper bulk rate before you pay.</p>
            )}
          </fieldset>

          {/* 4. Artwork */}
          <fieldset className="pb-step">
            <legend><i>4</i> Artwork</legend>
            <div className="pb-art-choices">
              {([
                ["upload", Upload, "Upload now", "PDF, AI, EPS, SVG, PNG"],
                ["later", Clock3, "Send later", "Order now, email files after"],
                ["design", Palette, "Design for me", `+${formatINR(DESIGN_FEE)} · dieline included`],
              ] as const).map(([id, Icon, title, text]) => (
                <button key={id} type="button" className={artworkChoice === id ? "is-active" : ""} onClick={() => setArtworkChoice(id)} aria-pressed={artworkChoice === id}>
                  <Icon size={18} /><b>{title}</b><small>{text}</small>
                </button>
              ))}
            </div>
            {artworkChoice === "upload" && (
              <div
                className={`pb-drop${uploadError ? " is-error" : artworkUrl ? " is-done" : ""}`}
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) void handleFile(file); }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => { if (event.key === "Enter") fileInputRef.current?.click(); }}
              >
                <input ref={fileInputRef} type="file" accept={ARTWORK_ACCEPT} hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFile(file); }} />
                {uploading ? <><Loader2 className="animate-spin" size={22} /><b>Uploading {artworkFile?.name}…</b></>
                  : uploadError ? (
                    <>
                      <AlertTriangle size={22} /><b>{artworkFile?.name} was not uploaded</b><small>{uploadError}</small>
                      <span className="pb-drop-actions">
                        <button type="button" onClick={(event) => { event.stopPropagation(); if (artworkFile) void handleFile(artworkFile); }}>Retry</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); setArtworkFile(null); setUploadError(""); setArtworkChoice("later"); }}>Send later instead</button>
                      </span>
                    </>
                  ) : artworkUrl ? <><CheckCircle2 size={22} /><b>{artworkFile?.name}</b><small>Uploaded securely · click to replace</small></>
                  : <><FileUp size={22} /><b>Drop your file or click to browse</b><small>Up to 10 MB per file · we check it before printing</small></>}
              </div>
            )}
            {artworkChoice === "upload" && studioDesign && (studioDesign.artworkDataUrl || studioDesign.logoDataUrl) && !artworkUrl && !uploading && (
              <button type="button" className="pb-studio-attach" onClick={() => void attachStudioRender()}><Sparkles size={15} /> Attach my 3D Studio artwork</button>
            )}
          </fieldset>

          {/* Summary */}
          <div className="pb-summary">
            <PriceLine label={`${quantity.toLocaleString("en-IN")} × ${product.name}`} value={hasExactPrice ? formatINR((estimate.material || 0) - (estimate.discount || 0)) : formatRupeeRange(indicative.unitLow * quantity, indicative.unitHigh * quantity)} />
            {!hasExactPrice && indicative.setupHigh > 0 && <PriceLine label="Tooling & setup (one-time)" value={formatRupeeRange(indicative.setupLow, indicative.setupHigh)} />}
            {designFee > 0 && <PriceLine label="Design service" value={formatINR(designFee)} />}
            {hasExactPrice && <PriceLine label="Delivery, setup & GST" value={formatINR((estimate.total || 0) - ((estimate.material || 0) - (estimate.discount || 0)))} />}
            <PriceLine label={hasExactPrice ? "Total payable" : "Estimated total (ex-GST)"} value={totalText} strong />
            <div className="pb-cta">
              <button type="button" className="pb-btn is-primary" onClick={() => addToCart(false)} disabled={uploadBlocked}>
                {added ? <><CheckCircle2 size={18} /> Added to cart</> : <><ShoppingCart size={18} /> {ctaLabel}</>}
              </button>
              <button type="button" className="pb-btn is-dark" onClick={() => addToCart(true)} disabled={uploadBlocked}>{secondaryLabel} <ArrowRight size={18} /></button>
            </div>
            <p className="pb-fine">
              {hasExactPrice
                ? <>Secure Razorpay checkout · GST invoice · dispatch in about {product.delivery_days_india} days after artwork approval.</>
                : <>No payment now. A specialist confirms your final price, lead time and payment schedule within 4 business hours — you approve before anything is produced.</>}
            </p>
            {uploadBlocked && !uploading && <p className="pb-fine is-warn">Retry the upload or choose “Send later” to continue.</p>}
          </div>
        </section>
      </div>

      {/* ── Details ── */}
      <section className="pb-details">
        <div className="pb-detail-tabs" role="tablist">
          {([["overview", "Overview"], ["specs", "Specifications"], ["delivery", "Production & delivery"]] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={detailTab === id} className={detailTab === id ? "is-active" : ""} onClick={() => setDetailTab(id)}>{label}</button>
          ))}
        </div>
        {detailTab === "overview" && (
          <div className="pb-detail-body">
            <p className="pb-lead">{product.description}</p>
            <p><b>Best for:</b> {product.use_case}.</p>
            {product.standard_spec && <p><b>Standard specification:</b> {product.standard_spec}.</p>}
          </div>
        )}
        {detailTab === "specs" && (
          <dl className="pb-spec-table">
            <div><dt>Product code</dt><dd>{product.code}</dd></div>
            <div><dt>Minimum order</dt><dd>{minimumQuantity.toLocaleString("en-IN")} {product.moq_unit}</dd></div>
            {product.materials?.length ? <div><dt>Materials</dt><dd>{product.materials.join(", ")}</dd></div> : null}
            {product.print_methods?.length ? <div><dt>Print methods</dt><dd>{product.print_methods.join(", ")}</dd></div> : null}
            {product.variants.map((variant) => <div key={variant.key}><dt>{variant.label}</dt><dd>{variant.options.join(", ")}</dd></div>)}
            {commerce && <div><dt>Production sizes</dt><dd>{commerce.sizes.map((size) => formatMeasurementInCm(size.label)).join(" · ")}</dd></div>}
            {product.hsn_code && <div><dt>HSN / GST</dt><dd>{product.hsn_code} · {product.gst_rate ?? 18}%</dd></div>}
            {product.sustainability_notes?.length ? <div><dt>Sustainability</dt><dd>{product.sustainability_notes.join(". ")}</dd></div> : null}
            <div><dt>Certifications</dt><dd>Food-contact, FSC or compliance documents are confirmed for the selected supplier and shared with your quote on request.</dd></div>
          </dl>
        )}
        {detailTab === "delivery" && (
          <div className="pb-detail-body pb-delivery">
            <div><b>1. Order or request</b><span>Add to cart and check out. Instant items are paid online; estimated items are confirmed within 4 business hours.</span></div>
            <div><b>2. Proof & approve</b><span>We check your artwork and send a digital proof. Nothing is printed until you approve.</span></div>
            <div><b>3. Produce</b><span>Standard lead time is about {product.delivery_days_india} days after approval within India. Exports are quoted per destination.</span></div>
            <div><b>4. Deliver & track</b><span>Pan-India delivery with a tracking link and GST invoice. Reorder the same spec in one click.</span></div>
          </div>
        )}
      </section>

      {pairs.length > 0 && (
        <section className="pb-related">
          <div className="pb-related-head"><p className="pb-eyebrow">Pairs well with</p><h2>Complete the unboxing.</h2></div>
          <div className="pb-related-grid">
            {pairs.map((sku) => (
              <Link key={sku.code} href={`/products/${sku.slug}`} className="pb-related-card">
                <img src={getCatalogImage(sku)} alt={sku.name} loading="lazy" />
                <span><b>{sku.name}</b><small>From {formatUnitRate(Math.min(...(sku.price_tiers?.map((tier) => tier.unit_price) || [sku.price_min])))} / {sku.moq_unit.replace(/s$/, "")}</small></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="pb-related pb-guides">
          <div className="pb-related-head"><p className="pb-eyebrow">Buying guides</p><h2>Choose the spec with confidence.</h2><Link href="/resources">All guides <ArrowRight size={15} /></Link></div>
          <div className="pb-guide-grid">
            {guides.map((guide) => <Link key={guide.slug} href={`/resources/${guide.slug}`}><small>{guide.category}</small><b>{guide.title}</b></Link>)}
          </div>
        </section>
      )}

      {/* Mobile sticky bar */}
      <div className="pb-mobile-bar">
        <span><b>{hasExactPrice ? formatINR(estimate.total || 0) : formatRupeeRange(indicative.totalLow, indicative.totalHigh)}</b><small>{quantity.toLocaleString("en-IN")} {product.moq_unit}{hasExactPrice ? " · incl. GST" : " · estimate"}</small></span>
        <button type="button" onClick={() => addToCart(false)} disabled={uploadBlocked}>{added ? <CheckCircle2 size={18} /> : <ShoppingCart size={18} />} {added ? "Added" : "Add to cart"}</button>
      </div>
    </main>
  );
}
