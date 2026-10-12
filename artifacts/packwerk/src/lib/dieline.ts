// Box dieline geometry, in millimetres, y pointing down (SVG convention).
// Every style is laid out flat from internal dimensions L × W × H.
//   cut  = solid line (knife), fold = dashed line (crease).

export type DielineStyle = "rte" | "ste" | "rsc" | "sleeve";
export type Point = [number, number];
export type Label = { x: number; y: number; text: string; size: number };

export type Dieline = {
  style: DielineStyle;
  width: number;
  height: number;
  cuts: Point[][];
  folds: Point[][];
  labels: Label[];
  notes: string[];
};

export const DIELINE_STYLES: Array<{ id: DielineStyle; name: string; detail: string; defaults: { L: number; W: number; H: number; t: number } }> = [
  { id: "rte", name: "Reverse tuck end carton", detail: "Retail cartons for cosmetics, food and supplements. Top tucks from the back, bottom from the front.", defaults: { L: 60, W: 35, H: 100, t: 0.4 } },
  { id: "ste", name: "Straight tuck end carton", detail: "Both tucks close from the back panel — a clean front face for display.", defaults: { L: 60, W: 35, H: 100, t: 0.4 } },
  { id: "rsc", name: "Shipping box (RSC)", detail: "Regular slotted corrugated carton for shipping and storage, closed with tape.", defaults: { L: 300, W: 200, H: 150, t: 3 } },
  { id: "sleeve", name: "Sleeve / wrap", detail: "Open-ended sleeve for drawer boxes, trays and multipacks.", defaults: { L: 120, W: 80, H: 40, t: 0.4 } },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number) => Math.round(v * 100) / 100;

/** Quarter-rounded tuck flap outline between xa and xb, starting at fold line y, opening in direction dir. */
function tuckOutline(xa: number, xb: number, y: number, dir: 1 | -1, depth: number): Point[] {
  const inset = 1;
  const r = Math.min(depth * 0.8, (xb - xa) / 4);
  const cy = y + dir * (depth - r);
  const cxL = xa + inset + r, cxR = xb - inset - r;
  const pts: Point[] = [[xa, y], [xa + inset, y]];
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI - (Math.PI / 2) * (i / 6); // left corner: 180° → 90°
    pts.push([cxL + r * Math.cos(a), cy + dir * r * Math.sin(a)]);
  }
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI / 2 - (Math.PI / 2) * (i / 6); // right corner: 90° → 0°
    pts.push([cxR + r * Math.cos(a), cy + dir * r * Math.sin(a)]);
  }
  pts.push([xb - inset, y], [xb, y]);
  return pts;
}

function tuckCarton(style: "rte" | "ste", L: number, W: number, H: number): Dieline {
  const glue = clamp(W * 0.45, 10, 18);
  const tuck = clamp(W * 0.45, 10, 22);
  const dust = Math.min(W * 0.75, W - 1);
  const chamfer = Math.min(dust * 0.45, W * 0.3);
  const top = W + tuck;
  const [x0, x1] = [0, glue];
  const x2 = x1 + L, x3 = x2 + W, x4 = x3 + L, x5 = x4 + W;
  const yT = top, yB = top + H;
  const cuts: Point[][] = [];
  const folds: Point[][] = [];
  const labels: Label[] = [];
  const fs = clamp(Math.min(L, W, H) * 0.16, 2.2, 9);

  // Body creases and glue flap
  for (const x of [x1, x2, x3, x4]) folds.push([[x, yT], [x, yB]]);
  const taper = Math.min(6, H * 0.08);
  cuts.push([[x1, yT], [x0, yT + taper], [x0, yB - taper], [x1, yB]]);
  cuts.push([[x5, yT], [x5, yB]]);

  const lid = (xa: number, xb: number, y0: number, dir: 1 | -1) => {
    folds.push([[xa, y0], [xb, y0]]);
    const yL = y0 + dir * W;
    cuts.push([[xa, y0], [xa, yL]], [[xb, y0], [xb, yL]]);
    folds.push([[xa + 1, yL], [xb - 1, yL]]);
    cuts.push(tuckOutline(xa, xb, yL, dir, tuck));
    labels.push({ x: (xa + xb) / 2, y: y0 + dir * W / 2, text: "LID", size: fs }, { x: (xa + xb) / 2, y: yL + dir * tuck / 2, text: "TUCK", size: fs * 0.8 });
  };
  const dustFlap = (xa: number, xb: number, y0: number, dir: 1 | -1, lidLeft: boolean, lidRight: boolean) => {
    folds.push([[xa, y0], [xb, y0]]);
    const yd = y0 + dir * dust;
    const pts: Point[] = lidLeft ? [[xa, yd]] : [[xa, y0], [xa + chamfer, yd]];
    pts.push(...(lidRight ? [[xb, yd] as Point] : [[xb - chamfer, yd] as Point, [xb, y0] as Point]));
    cuts.push(pts);
    labels.push({ x: (xa + xb) / 2, y: y0 + dir * dust / 2, text: "DUST", size: fs * 0.7 });
  };
  const plain = (xa: number, xb: number, y: number) => cuts.push([[xa, y], [xb, y]]);

  // Top: lid on the back panel for both styles
  plain(x1, x2, yT);
  dustFlap(x2, x3, yT, -1, false, true);
  lid(x3, x4, yT, -1);
  dustFlap(x4, x5, yT, -1, true, false);
  // Bottom: RTE closes from the front, STE from the back
  if (style === "rte") {
    lid(x1, x2, yB, 1);
    dustFlap(x2, x3, yB, 1, true, false);
    plain(x3, x4, yB);
    dustFlap(x4, x5, yB, 1, false, false);
  } else {
    plain(x1, x2, yB);
    dustFlap(x2, x3, yB, 1, false, true);
    lid(x3, x4, yB, 1);
    dustFlap(x4, x5, yB, 1, true, false);
  }

  const mid = (yT + yB) / 2;
  labels.push(
    { x: x0 + glue / 2, y: mid, text: "GLUE", size: fs * 0.7 },
    { x: (x1 + x2) / 2, y: mid, text: "FRONT", size: fs },
    { x: (x2 + x3) / 2, y: mid, text: "SIDE", size: fs * 0.85 },
    { x: (x3 + x4) / 2, y: mid, text: "BACK", size: fs },
    { x: (x4 + x5) / 2, y: mid, text: "SIDE", size: fs * 0.85 },
  );
  return {
    style,
    width: x5,
    height: yB + top,
    cuts,
    folds,
    labels,
    notes: [
      `Glue flap ${round(glue)} mm, tuck ${round(tuck)} mm, dust flaps ${round(dust)} mm.`,
      "Panels are drawn at internal size. For board above 0.5 mm, your converter adds thickness allowances to the side panels and tuck.",
    ],
  };
}

function shippingBox(L: number, W: number, H: number, t: number): Dieline {
  const pL = L + t, pW = W + t, pH = H + 2 * t;
  const flap = pW / 2;
  const joint = clamp(Math.min(L, W) * 0.12, 25, 40);
  const x0 = 0, x1 = joint, x2 = x1 + pL, x3 = x2 + pW, x4 = x3 + pL, x5 = x4 + pW;
  const yT = flap, yB = flap + pH, bottom = yB + flap;
  const cuts: Point[][] = [];
  const folds: Point[][] = [];
  const fs = clamp(Math.min(L, W, H) * 0.12, 6, 22);

  cuts.push([[x1, yT], [x1, 0], [x5, 0], [x5, bottom], [x1, bottom], [x1, yB]]);
  const taper = Math.min(12, pH * 0.12);
  cuts.push([[x1, yT], [x0, yT + taper], [x0, yB - taper], [x1, yB]]);
  for (const x of [x2, x3, x4]) cuts.push([[x, 0], [x, yT]], [[x, yB], [x, bottom]]);
  folds.push([[x1, yT], [x5, yT]], [[x1, yB], [x5, yB]]);
  for (const x of [x1, x2, x3, x4]) folds.push([[x, yT], [x, yB]]);

  const mid = (yT + yB) / 2;
  const labels: Label[] = [
    { x: x0 + joint / 2, y: mid, text: "JOINT", size: fs * 0.55 },
    { x: (x1 + x2) / 2, y: mid, text: "LENGTH", size: fs },
    { x: (x2 + x3) / 2, y: mid, text: "WIDTH", size: fs },
    { x: (x3 + x4) / 2, y: mid, text: "LENGTH", size: fs },
    { x: (x4 + x5) / 2, y: mid, text: "WIDTH", size: fs },
    ...[[x1, x2], [x2, x3], [x3, x4], [x4, x5]].flatMap(([a, b]) => [
      { x: (a + b) / 2, y: yT / 2, text: "FLAP", size: fs * 0.7 },
      { x: (a + b) / 2, y: yB + flap / 2, text: "FLAP", size: fs * 0.7 },
    ]),
  ];
  return {
    style: "rsc",
    width: x5,
    height: bottom,
    cuts,
    folds,
    labels,
    notes: [
      `Board thickness ${t} mm added to each panel (L ${round(pL)}, W ${round(pW)}, H ${round(pH)} mm). Flaps meet in the middle at ${round(flap)} mm.`,
      `Manufacturer's joint ${round(joint)} mm — glued or stitched. Slots are shown as single cuts; your converter sets the slot width to the flute.`,
    ],
  };
}

function sleeve(L: number, W: number, H: number): Dieline {
  const glue = clamp(W * 0.3, 10, 15);
  const x0 = 0, x1 = glue, x2 = x1 + L, x3 = x2 + W, x4 = x3 + L, x5 = x4 + W;
  const fs = clamp(Math.min(L, W, H) * 0.2, 2.5, 10);
  const taper = Math.min(4, H * 0.1);
  return {
    style: "sleeve",
    width: x5,
    height: H,
    cuts: [[[x1, 0], [x5, 0], [x5, H], [x1, H]], [[x1, 0], [x0, taper], [x0, H - taper], [x1, H]]],
    folds: [x1, x2, x3, x4].map((x) => [[x, 0], [x, H]] as Point[]),
    labels: [
      { x: x0 + glue / 2, y: H / 2, text: "GLUE", size: fs * 0.6 },
      { x: (x1 + x2) / 2, y: H / 2, text: "TOP", size: fs },
      { x: (x2 + x3) / 2, y: H / 2, text: "SIDE", size: fs * 0.85 },
      { x: (x3 + x4) / 2, y: H / 2, text: "BOTTOM", size: fs },
      { x: (x4 + x5) / 2, y: H / 2, text: "SIDE", size: fs * 0.85 },
    ],
    notes: ["Sized to wrap a tray or box of the given L × W with H as the sleeve depth. Add 1 mm to L and W for a tray that should slide easily."],
  };
}

export function buildDieline(style: DielineStyle, L: number, W: number, H: number, t: number): Dieline {
  if (style === "rsc") return shippingBox(L, W, H, t);
  if (style === "sleeve") return sleeve(L, W, H);
  return tuckCarton(style, L, W, H);
}

// ── Exports ─────────────────────────────────────────────────────────────────

const MARGIN = 12; // mm around the dieline in exports
const pathOf = (pts: Point[], ox = 0, oy = 0) => pts.map(([x, y], i) => `${i ? "L" : "M"}${round(x + ox)} ${round(y + oy)}`).join(" ");

export function dielineSvg(d: Dieline, opts: { title?: string; forDownload?: boolean } = {}) {
  const w = d.width + MARGIN * 2;
  const h = d.height + MARGIN * 2 + (opts.forDownload ? 10 : 0);
  const stroke = Math.max(0.25, Math.min(d.width, d.height) / 400);
  const cut = d.cuts.map((p) => `<path d="${pathOf(p, MARGIN, MARGIN)}"/>`).join("");
  const fold = d.folds.map((p) => `<path d="${pathOf(p, MARGIN, MARGIN)}"/>`).join("");
  const labels = d.labels.map((l) => `<text x="${round(l.x + MARGIN)}" y="${round(l.y + MARGIN)}" font-size="${round(l.size)}">${l.text}</text>`).join("");
  const footer = opts.forDownload && opts.title
    ? `<text x="${MARGIN}" y="${round(h - 6)}" font-size="4" fill="#475569" font-family="Helvetica, Arial, sans-serif">${opts.title} · solid = cut · dashed = fold · extend artwork 3 mm past cut lines (bleed) · packworkz.com</text>`
    : "";
  const size = opts.forDownload ? ` width="${round(w)}mm" height="${round(h)}mm"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(w)} ${round(h)}"${size}>
<g fill="none" stroke="#0b1726" stroke-width="${round(stroke)}" stroke-linejoin="round">${cut}</g>
<g fill="none" stroke="#1e5ed2" stroke-width="${round(stroke)}" stroke-dasharray="${round(stroke * 8)} ${round(stroke * 5)}">${fold}</g>
<g fill="#94a3b8" font-family="Helvetica, Arial, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.06em">${labels}</g>
${footer}
</svg>`;
}

/** Minimal vector PDF at 1:1 scale (mm → pt). Cut lines black, folds blue dashed. */
export function dielinePdf(d: Dieline, title: string): Blob {
  const k = 72 / 25.4;
  const w = (d.width + MARGIN * 2) * k;
  const h = (d.height + MARGIN * 2 + 10) * k;
  const tx = (x: number) => ((x + MARGIN) * k).toFixed(2);
  const ty = (y: number) => (h - (y + MARGIN) * k).toFixed(2);
  const strokes = (paths: Point[][]) => paths.map((p) => p.map(([x, y], i) => `${tx(x)} ${ty(y)} ${i ? "l" : "m"}`).join(" ") + " S").join("\n");
  const ascii = (s: string) => s.replace(/[^\x20-\x7e]/g, "x").replace(/[()\\]/g, "\\$&");
  const content = [
    "0.6 w 1 j",
    "0.04 0.09 0.15 RG [] 0 d",
    strokes(d.cuts),
    "0.12 0.37 0.82 RG [6 4] 0 d",
    strokes(d.folds),
    "BT /F1 9 Tf 0.28 0.33 0.41 rg",
    `${(MARGIN * k).toFixed(2)} ${(6 * k).toFixed(2)} Td (${ascii(`${title} - solid = cut, dashed = fold, add 3 mm bleed past cut lines - packworkz.com`)}) Tj`,
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w.toFixed(2)} ${h.toFixed(2)}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}
