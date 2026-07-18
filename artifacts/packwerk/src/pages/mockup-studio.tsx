import { useCallback, useRef, useState } from "react";
import { Download, FileImage, ImagePlus, Pause, Play, Rotate3D, Ruler, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import type * as THREE from "three";
import { Link } from "wouter";
import { PackagingDieline } from "@/components/mockup/PackagingDieline";
import { PackagingMockupCanvas, type ArtworkFit, type MockupFormat } from "@/components/mockup/PackagingMockupCanvas";

const FORMATS: Array<{ id: MockupFormat; label: string; sku: string }> = [
  { id: "mailer", label: "Mailer box", sku: "EC-501" },
  { id: "shipping", label: "Shipping box", sku: "EC-502" },
  { id: "carton", label: "Retail carton", sku: "BX-401" },
  { id: "rigid", label: "Rigid box", sku: "BX-402" },
  { id: "pouch", label: "Stand-up pouch", sku: "FP-101" },
  { id: "bottle", label: "Bottle", sku: "BC-201" },
  { id: "jar", label: "Jar", sku: "BC-207" },
  { id: "tube", label: "Cosmetic tube", sku: "TS-301" },
];

const COLORS = ["#0F4C5C", "#1F5A46", "#C7432B", "#D6A136", "#5A3C82", "#172A46", "#D6D0C4", "#171717"];

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "packworkz";
}

export default function MockupStudio() {
  const [format, setFormat] = useState<MockupFormat>("mailer");
  const [view, setView] = useState<"preview" | "dieline">("preview");
  const [color, setColor] = useState("#0F4C5C");
  const [brandName, setBrandName] = useState("Northstar");
  const [finish, setFinish] = useState<"matte" | "gloss">("matte");
  const [artworkFit, setArtworkFit] = useState<ArtworkFit>("cover");
  const [autoRotate, setAutoRotate] = useState(true);
  const [logoDataUrl, setLogoDataUrl] = useState<string>();
  const [artworkDataUrl, setArtworkDataUrl] = useState<string>();
  const [uploadError, setUploadError] = useState("");
  const [dimensions, setDimensions] = useState({ width: 220, height: 160, depth: 80 });
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
  const setRenderer = useCallback((renderer: THREE.WebGLRenderer) => { rendererRef.current = renderer; }, []);
  const selected = FORMATS.find((item) => item.id === format) || FORMATS[0];

  const readImage = (file: File | undefined, setter: (value: string) => void) => {
    setUploadError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Upload a PNG, JPG or WebP preview. Print PDFs are attached during checkout.");
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

  return (
    <main className="pw-mockup-page">
      <header className="pw-studio-head">
        <div>
          <p><Sparkles size={15} /> Packworkz 3D Studio</p>
          <h1>Build the preview. Check the dieline.</h1>
        </div>
        <div className="pw-studio-view-toggle" role="tablist" aria-label="Studio view">
          <button type="button" className={view === "preview" ? "active" : ""} onClick={() => setView("preview")}><Rotate3D size={17} /> 3D preview</button>
          <button type="button" className={view === "dieline" ? "active" : ""} onClick={() => setView("dieline")}><Ruler size={17} /> Dieline</button>
        </div>
      </header>

      <section className="pw-mockup-stage">
        <aside className="pw-mockup-controls">
          <div className="pw-mockup-control-group">
            <span>1. Choose format</span>
            <div className="pw-mockup-format-grid" role="tablist" aria-label="Packaging format">
              {FORMATS.map((item) => <button key={item.id} type="button" className={format === item.id ? "active" : ""} onClick={() => setFormat(item.id)}>{item.label}</button>)}
            </div>
          </div>

          <div className="pw-mockup-control-group">
            <span>2. Pack dimensions</span>
            <div className="pw-dimension-inputs">
              {(["width", "height", "depth"] as const).map((key) => (
                <label key={key}><small>{key[0].toUpperCase()}</small><input type="number" min="20" max="2000" value={dimensions[key]} onChange={(event) => setDimensions((current) => ({ ...current, [key]: Math.max(20, Number(event.target.value) || 20) }))} /><em>mm</em></label>
              ))}
            </div>
          </div>

          <div className="pw-mockup-control-group">
            <span>3. Add your design</span>
            <div className="pw-artwork-actions">
              <label className="pw-mockup-upload primary"><FileImage size={18} /><b>{artworkDataUrl ? "Replace artwork" : "Upload full artwork"}</b><small>PNG, JPG or WebP</small><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImage(event.target.files?.[0], setArtworkDataUrl)} /></label>
              <label className="pw-mockup-upload"><ImagePlus size={18} /> {logoDataUrl ? "Replace logo" : "Add logo only"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImage(event.target.files?.[0], setLogoDataUrl)} /></label>
              {(artworkDataUrl || logoDataUrl) && <button type="button" className="pw-clear-artwork" title="Clear uploaded artwork" onClick={() => { setArtworkDataUrl(undefined); setLogoDataUrl(undefined); }}><Trash2 size={17} /> Clear</button>}
            </div>
            {uploadError && <p className="pw-upload-error" role="alert">{uploadError}</p>}
          </div>

          <label className="pw-mockup-control-group">
            <span>Brand name</span>
            <input value={brandName} maxLength={18} onChange={(event) => setBrandName(event.target.value)} aria-label="Brand name" />
          </label>

          <div className="pw-mockup-control-row">
            <div className="pw-mockup-control-group"><span>Brand color</span><div className="pw-mockup-swatches">{COLORS.map((swatch) => <button key={swatch} type="button" aria-label={`Use color ${swatch}`} className={color === swatch ? "active" : ""} style={{ background: swatch }} onClick={() => setColor(swatch)} />)}<input type="color" value={color} onChange={(event) => setColor(event.target.value)} aria-label="Choose custom brand color" /></div></div>
            <div className="pw-mockup-control-group"><span>Finish</span><div className="pw-mockup-segments compact"><button type="button" className={finish === "matte" ? "active" : ""} onClick={() => setFinish("matte")}>Matte</button><button type="button" className={finish === "gloss" ? "active" : ""} onClick={() => setFinish("gloss")}>Gloss</button></div></div>
          </div>

          {artworkDataUrl && <div className="pw-mockup-control-group"><span>Artwork fit</span><div className="pw-mockup-segments three">{(["cover", "contain", "repeat"] as ArtworkFit[]).map((fit) => <button key={fit} type="button" className={artworkFit === fit ? "active" : ""} onClick={() => setArtworkFit(fit)}>{fit}</button>)}</div></div>}

          <div className="pw-mockup-footer">
            <p><Rotate3D size={17} /> {view === "preview" ? "Drag to rotate. Scroll to zoom." : "Solid lines cut. Dashed lines fold."}</p>
            <Link className="btn-fill btn-amber" href={`/configure?sku=${selected.sku}`}><ShoppingBag size={17} /> Configure {selected.label}</Link>
          </div>
        </aside>

        <div className="pw-studio-workspace">
          <div className="pw-studio-workspace-bar">
            <div><span>{selected.label}</span><small>{dimensions.width} x {dimensions.height} x {dimensions.depth} mm</small></div>
            <div className="pw-mockup-actions">
              {view === "preview" && <button type="button" onClick={() => setAutoRotate((value) => !value)} title={autoRotate ? "Pause rotation" : "Start rotation"}>{autoRotate ? <Pause size={17} /> : <Play size={17} />}{autoRotate ? "Pause" : "Rotate"}</button>}
              <button type="button" onClick={view === "preview" ? downloadMockup : downloadDieline}><Download size={17} /> Export {view === "preview" ? "PNG" : "SVG"}</button>
            </div>
          </div>
          <div className="pw-studio-viewport">
            {view === "preview" ? <PackagingMockupCanvas format={format} color={color} brandName={brandName} finish={finish} logoDataUrl={logoDataUrl} artworkDataUrl={artworkDataUrl} artworkFit={artworkFit} autoRotate={autoRotate} onReady={setRenderer} /> : <PackagingDieline format={format} width={dimensions.width} height={dimensions.height} depth={dimensions.depth} artworkDataUrl={artworkDataUrl} />}
          </div>
          <div className="pw-studio-status"><span><b>Preview quality</b> 3D review render</span><span><b>Artwork</b> {artworkDataUrl ? "Uploaded" : logoDataUrl ? "Logo applied" : "Editable starter"}</span><span><b>Prepress</b> Human check before production</span></div>
        </div>
      </section>
    </main>
  );
}
