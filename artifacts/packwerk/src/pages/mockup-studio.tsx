import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Box, Camera, Download, Eye, FileImage, ImagePlus, Layers, Moon, Package, Pause, Play,
  Rotate3D, Ruler, Sparkles, Sun, SunMedium, Trash2, Wand2,
} from "lucide-react";
import type * as THREE from "three";
import { Link, useLocation, useSearch } from "wouter";
import { PackagingDieline } from "@/components/mockup/PackagingDieline";
import {
  PackagingMockupCanvas, type ArtworkFit, type CameraView, type MockupFormat, type PaperStock, type StudioBackdrop,
} from "@/components/mockup/PackagingMockupCanvas";
import { CATALOG_SKUS, getCatalogImage } from "@/lib/catalog";
import { formatUnitRate, getFromUnitPrice } from "@/lib/indicative-pricing";
import { saveStudioDesign } from "@/lib/studio-handoff";
import "./studio.css";

type FormatOption = { id: MockupFormat; label: string; sku: string; dimensions: { width: number; height: number; depth: number } };

const FORMATS: FormatOption[] = [
  { id: "mailer", label: "Mailer box", sku: "EC-501", dimensions: { width: 230, height: 80, depth: 160 } },
  { id: "shipping", label: "Shipping box", sku: "EC-502", dimensions: { width: 300, height: 220, depth: 220 } },
  { id: "carton", label: "Retail carton", sku: "BX-401", dimensions: { width: 75, height: 140, depth: 45 } },
  { id: "rigid", label: "Rigid gift box", sku: "BX-402", dimensions: { width: 240, height: 75, depth: 190 } },
  { id: "pouch", label: "Stand-up pouch", sku: "FP-101", dimensions: { width: 160, height: 230, depth: 80 } },
  { id: "coffee", label: "Coffee bag", sku: "FP-109", dimensions: { width: 135, height: 320, depth: 80 } },
  { id: "bottle", label: "Bottle", sku: "BC-201", dimensions: { width: 70, height: 190, depth: 70 } },
  { id: "jar", label: "Cosmetic jar", sku: "BC-204", dimensions: { width: 85, height: 95, depth: 85 } },
  { id: "tube", label: "Cosmetic tube", sku: "TS-301", dimensions: { width: 55, height: 155, depth: 35 } },
];

const BOX_FORMATS = new Set<MockupFormat>(["mailer", "shipping", "carton", "rigid"]);
const COLORS = ["#0F4C5C", "#1F5A46", "#C7432B", "#D6A136", "#5A3C82", "#172A46", "#E8B7B0", "#171717"];
const STOCKS: Array<{ id: PaperStock; label: string; swatch: string }> = [
  { id: "color", label: "Full colour", swatch: "linear-gradient(135deg,#0F4C5C 50%,#D6A136 50%)" },
  { id: "white", label: "White board", swatch: "#F7F6F2" },
  { id: "kraft", label: "Natural kraft", swatch: "#C49A6C" },
];
const BACKDROPS: Array<{ id: StudioBackdrop; label: string; Icon: typeof Sun }> = [
  { id: "studio", label: "Studio", Icon: SunMedium },
  { id: "warm", label: "Warm", Icon: Sun },
  { id: "night", label: "Night", Icon: Moon },
];
const VIEWS: Array<{ id: CameraView; label: string }> = [
  { id: "hero", label: "3/4" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "top", label: "Top" },
];

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "packworkz";
}

export default function MockupStudio() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const requestedFormat = new URLSearchParams(search).get("format") as MockupFormat | null;
  const initialFormat = FORMATS.some((item) => item.id === requestedFormat) ? requestedFormat! : "mailer";
  const [format, setFormat] = useState<MockupFormat>(initialFormat);
  const [view, setView] = useState<"preview" | "dieline">("preview");
  const [panel, setPanel] = useState<"design" | "size">("design");
  const [color, setColor] = useState("#0F4C5C");
  const [brandName, setBrandName] = useState("Northstar");
  const [stock, setStock] = useState<PaperStock>("color");
  const [finish, setFinish] = useState<"matte" | "gloss">("matte");
  const [artworkFit, setArtworkFit] = useState<ArtworkFit>("cover");
  const [autoRotate, setAutoRotate] = useState(true);
  const [backdrop, setBackdrop] = useState<StudioBackdrop>("studio");
  const [cameraView, setCameraView] = useState<CameraView>("hero");
  const [logoDataUrl, setLogoDataUrl] = useState<string>();
  const [artworkDataUrl, setArtworkDataUrl] = useState<string>();
  const [uploadError, setUploadError] = useState("");
  const [dimensions, setDimensions] = useState(() => FORMATS.find((item) => item.id === initialFormat)?.dimensions || FORMATS[0].dimensions);
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
  const setRenderer = useCallback((renderer: THREE.WebGLRenderer) => { rendererRef.current = renderer; }, []);
  const selected = FORMATS.find((item) => item.id === format) || FORMATS[0];
  const selectedSku = useMemo(() => CATALOG_SKUS.find((sku) => sku.code === selected.sku), [selected.sku]);

  useEffect(() => {
    if (!requestedFormat || !FORMATS.some((item) => item.id === requestedFormat)) return;
    setFormat(requestedFormat);
    setDimensions(FORMATS.find((item) => item.id === requestedFormat)?.dimensions || FORMATS[0].dimensions);
  }, [requestedFormat]);

  const chooseFormat = (nextFormat: MockupFormat) => {
    const next = FORMATS.find((item) => item.id === nextFormat) || FORMATS[0];
    setFormat(nextFormat);
    setDimensions(next.dimensions);
    setCameraView("hero");
  };

  const readImage = (file: File | undefined, setter: (value: string) => void) => {
    setUploadError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Upload a PNG, JPG or WebP preview. Print-ready PDFs are attached when you order.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("That file is over 15 MB. Please upload a smaller preview image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result));
    reader.onerror = () => setUploadError("We could not read that file. Please try another image.");
    reader.readAsDataURL(file);
  };

  const downloadMockup = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const anchor = document.createElement("a");
    anchor.download = `${slug(brandName)}-${format}-mockup.png`;
    anchor.href = renderer.domElement.toDataURL("image/png");
    anchor.click();
  };

  const downloadDieline = () => {
    const source = document.querySelector<SVGSVGElement>(".pw-dieline-svg");
    if (!source) return;
    const copy = source.cloneNode(true) as SVGSVGElement;
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([new XMLSerializer().serializeToString(copy)], { type: "image/svg+xml" });
    const anchor = document.createElement("a");
    anchor.download = `${format}-${dimensions.width}x${dimensions.height}-concept-dieline.svg`;
    anchor.href = URL.createObjectURL(blob);
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const orderDesign = () => {
    if (!selectedSku) return;
    saveStudioDesign({ format, skuCode: selectedSku.code, color, brandName, stock, finish, artworkFit, dimensions, artworkDataUrl, logoDataUrl });
    navigate(`/products/${selectedSku.slug}?studio=1`);
  };

  return (
    <main className="pw-st">
      <header className="pw-st-head">
        <div>
          <p><Sparkles size={14} /> Packworkz 3D Studio</p>
          <h1>Design it. Spin it. <em>Order it.</em></h1>
        </div>
        <div className="pw-st-toggle" role="tablist" aria-label="Studio view">
          <button type="button" role="tab" aria-selected={view === "preview"} className={view === "preview" ? "is-active" : ""} onClick={() => setView("preview")}><Rotate3D size={16} /> 3D preview</button>
          <button type="button" role="tab" aria-selected={view === "dieline"} className={view === "dieline" ? "is-active" : ""} onClick={() => setView("dieline")}><Ruler size={16} /> Dieline</button>
        </div>
      </header>

      <section className="pw-st-shell">
        {/* ── Format rail ── */}
        <nav className="pw-st-rail" aria-label="Packaging format">
          <span className="pw-st-label">Format</span>
          {FORMATS.map((item) => {
            const sku = CATALOG_SKUS.find((entry) => entry.code === item.sku);
            return (
              <button key={item.id} type="button" className={format === item.id ? "is-active" : ""} onClick={() => chooseFormat(item.id)} aria-pressed={format === item.id}>
                {sku ? <img src={getCatalogImage(sku)} alt="" loading="lazy" /> : <Box size={20} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Viewport ── */}
        <div className="pw-st-stage">
          <div className="pw-st-viewport">
            {view === "preview" ? (
              <PackagingMockupCanvas
                format={format} color={color} brandName={brandName} finish={finish} stock={stock}
                logoDataUrl={logoDataUrl} artworkDataUrl={artworkDataUrl} artworkFit={artworkFit}
                autoRotate={autoRotate} backdrop={backdrop} cameraView={cameraView}
                dimensions={BOX_FORMATS.has(format) ? dimensions : undefined} onReady={setRenderer}
              />
            ) : (
              <PackagingDieline format={format} width={dimensions.width} height={dimensions.height} depth={dimensions.depth} artworkDataUrl={artworkDataUrl} />
            )}
            <div className="pw-st-chip-top">
              <b>{selected.label}</b>
              <span>{dimensions.width} × {dimensions.height} × {dimensions.depth} mm</span>
            </div>
            {view === "preview" && (
              <div className="pw-st-toolbar" role="toolbar" aria-label="Viewport controls">
                <div className="pw-st-seg" aria-label="Camera angle">
                  <Camera size={15} />
                  {VIEWS.map((item) => <button key={item.id} type="button" className={cameraView === item.id ? "is-active" : ""} onClick={() => { setAutoRotate(false); setCameraView(item.id); }}>{item.label}</button>)}
                </div>
                <div className="pw-st-seg" aria-label="Backdrop">
                  {BACKDROPS.map(({ id, label, Icon }) => <button key={id} type="button" title={`${label} backdrop`} aria-label={`${label} backdrop`} className={backdrop === id ? "is-active" : ""} onClick={() => setBackdrop(id)}><Icon size={15} /></button>)}
                </div>
                <button type="button" className="pw-st-tool" onClick={() => setAutoRotate((value) => !value)} aria-pressed={autoRotate}>{autoRotate ? <Pause size={15} /> : <Play size={15} />}{autoRotate ? "Pause" : "Spin"}</button>
                <button type="button" className="pw-st-tool" onClick={downloadMockup}><Download size={15} /> PNG</button>
              </div>
            )}
            {view === "dieline" && (
              <div className="pw-st-toolbar">
                <span className="pw-st-hint"><Eye size={15} /> Solid lines cut · dashed lines fold</span>
                <button type="button" className="pw-st-tool" onClick={downloadDieline}><Download size={15} /> SVG</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Design panel ── */}
        <aside className="pw-st-panel">
          <div className="pw-st-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={panel === "design"} className={panel === "design" ? "is-active" : ""} onClick={() => setPanel("design")}><Wand2 size={15} /> Design</button>
            <button type="button" role="tab" aria-selected={panel === "size"} className={panel === "size" ? "is-active" : ""} onClick={() => setPanel("size")}><Ruler size={15} /> Size & finish</button>
          </div>

          {panel === "design" ? (
            <div className="pw-st-panel-body">
              <div className="pw-st-group">
                <span className="pw-st-label">Artwork</span>
                <label className="pw-st-drop">
                  <FileImage size={20} />
                  <b>{artworkDataUrl ? "Replace full artwork" : "Upload full artwork"}</b>
                  <small>PNG, JPG or WebP · wraps the front panel</small>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImage(event.target.files?.[0], setArtworkDataUrl)} />
                </label>
                <div className="pw-st-row">
                  <label className="pw-st-mini"><ImagePlus size={15} /> {logoDataUrl ? "Replace logo" : "Logo only"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImage(event.target.files?.[0], setLogoDataUrl)} /></label>
                  {(artworkDataUrl || logoDataUrl) && <button type="button" className="pw-st-mini" onClick={() => { setArtworkDataUrl(undefined); setLogoDataUrl(undefined); }}><Trash2 size={15} /> Clear</button>}
                </div>
                {uploadError && <p className="pw-st-error" role="alert">{uploadError}</p>}
                {artworkDataUrl && (
                  <div className="pw-st-seg is-full" aria-label="Artwork fit">
                    {(["cover", "contain", "repeat"] as ArtworkFit[]).map((fit) => <button key={fit} type="button" className={artworkFit === fit ? "is-active" : ""} onClick={() => setArtworkFit(fit)}>{fit}</button>)}
                  </div>
                )}
              </div>

              {!artworkDataUrl && (
                <label className="pw-st-group">
                  <span className="pw-st-label">Brand name</span>
                  <input className="pw-st-input" value={brandName} maxLength={18} onChange={(event) => setBrandName(event.target.value)} />
                </label>
              )}

              <div className="pw-st-group">
                <span className="pw-st-label">Board / stock</span>
                <div className="pw-st-stocks">
                  {STOCKS.map((item) => (
                    <button key={item.id} type="button" className={stock === item.id ? "is-active" : ""} onClick={() => setStock(item.id)}>
                      <i style={{ background: item.swatch }} />{item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pw-st-group">
                <span className="pw-st-label">{stock === "color" ? "Pack colour" : "Ink colour"}</span>
                <div className="pw-st-swatches">
                  {COLORS.map((swatch) => <button key={swatch} type="button" aria-label={`Use colour ${swatch}`} className={color === swatch ? "is-active" : ""} style={{ background: swatch }} onClick={() => setColor(swatch)} />)}
                  <label className="pw-st-custom" title="Custom colour"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} aria-label="Custom colour" /></label>
                </div>
              </div>
            </div>
          ) : (
            <div className="pw-st-panel-body">
              <div className="pw-st-group">
                <span className="pw-st-label">Pack dimensions (mm)</span>
                <div className="pw-st-dims">
                  {(["width", "height", "depth"] as const).map((key) => (
                    <label key={key}><small>{key[0].toUpperCase()}</small><input type="number" min="20" max="2000" value={dimensions[key]} onChange={(event) => setDimensions((current) => ({ ...current, [key]: Math.max(20, Number(event.target.value) || 20) }))} /></label>
                  ))}
                </div>
                <p className="pw-st-note">{BOX_FORMATS.has(format) ? "The 3D box resizes to these proportions live." : "Size changes update the dieline; this 3D model keeps a standard shape."}</p>
              </div>
              <div className="pw-st-group">
                <span className="pw-st-label">Finish</span>
                <div className="pw-st-seg is-full">
                  <button type="button" className={finish === "matte" ? "is-active" : ""} onClick={() => setFinish("matte")}>Matte</button>
                  <button type="button" className={finish === "gloss" ? "is-active" : ""} onClick={() => setFinish("gloss")}>Gloss</button>
                </div>
              </div>
              <div className="pw-st-group pw-st-facts">
                <span><Layers size={15} /> Prepress checks every file before production</span>
                <span><Package size={15} /> Physical sample available before bulk</span>
              </div>
            </div>
          )}

          <div className="pw-st-order">
            {selectedSku && (
              <div className="pw-st-order-meta">
                <img src={getCatalogImage(selectedSku)} alt="" />
                <span><b>{selectedSku.name}</b><small>From {formatUnitRate(getFromUnitPrice(selectedSku))} / unit · MOQ {selectedSku.moq.toLocaleString("en-IN")}</small></span>
              </div>
            )}
            <button type="button" className="pw-st-cta" onClick={orderDesign} disabled={!selectedSku}>Order this design <ArrowRight size={17} /></button>
            <Link href="/samples" className="pw-st-secondary">Feel the materials first · ₹299 sample kit</Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
