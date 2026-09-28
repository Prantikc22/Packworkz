import type { ArtworkFit, MockupDimensions, MockupFormat, PaperStock } from "@/components/mockup/PackagingMockupCanvas";

/** Design carried from the 3D Studio into a product page, per browser tab. */
export type StudioDesign = {
  format: MockupFormat;
  skuCode: string;
  color: string;
  brandName: string;
  stock: PaperStock;
  finish: "matte" | "gloss";
  artworkFit: ArtworkFit;
  dimensions: MockupDimensions;
  artworkDataUrl?: string;
  logoDataUrl?: string;
};

const KEY = "packworkz_studio_design_v1";

export const MOCKUP_FORMAT_BY_SKU: Record<string, MockupFormat> = {
  "EC-501": "mailer",
  "EC-502": "shipping",
  "BX-401": "carton",
  "BX-402": "rigid",
  "BX-403": "rigid",
  "BX-405": "rigid",
  "BX-408": "rigid",
  "FP-101": "pouch",
  "FP-103": "coffee",
  "FP-109": "coffee",
  "BC-201": "bottle",
  "BC-214": "bottle",
  "BC-204": "jar",
  "TS-301": "tube",
  "TS-306": "tube",
};

export function saveStudioDesign(design: StudioDesign) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(design));
  } catch {
    // Large artwork can exceed storage quota; keep the design without images.
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ ...design, artworkDataUrl: undefined, logoDataUrl: undefined }));
    } catch { /* storage unavailable */ }
  }
}

export function loadStudioDesign(skuCode?: string): StudioDesign | undefined {
  try {
    const design = JSON.parse(sessionStorage.getItem(KEY) || "null") as StudioDesign | null;
    if (!design) return undefined;
    return !skuCode || design.skuCode === skuCode ? design : undefined;
  } catch {
    return undefined;
  }
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  const extension = blob.type.split("/")[1] || "png";
  return new File([blob], `${name}.${extension}`, { type: blob.type });
}
