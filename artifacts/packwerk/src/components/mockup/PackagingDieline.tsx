import type { MockupFormat } from "./PackagingMockupCanvas";

type Props = {
  format: MockupFormat;
  width: number;
  height: number;
  depth: number;
  artworkDataUrl?: string;
};

const BOX_FORMATS: MockupFormat[] = ["mailer", "shipping", "carton", "rigid"];

export function PackagingDieline({ format, width, height, depth, artworkDataUrl }: Props) {
  const isBox = BOX_FORMATS.includes(format);
  const isRound = ["bottle", "jar", "tube"].includes(format);
  const label = `${width} x ${height}${isBox ? ` x ${depth}` : ""} mm`;

  return (
    <div className="pw-dieline-stage">
      <div className="pw-dieline-legend"><span className="cut" /> Cut line <span className="fold" /> Fold line <b>{label}</b></div>
      <svg className="pw-dieline-svg" viewBox="0 0 920 650" role="img" aria-label={`${format} production dieline preview`}>
        <defs>
          <pattern id="artwork-pattern" width="1" height="1" patternContentUnits="objectBoundingBox">
            {artworkDataUrl && <image href={artworkDataUrl} width="1" height="1" preserveAspectRatio="xMidYMid slice" />}
          </pattern>
        </defs>
        <rect x="0" y="0" width="920" height="650" fill="#F8FAFC" />
        {isBox && (
          <g className="pw-dieline-net">
            <path className="dieline-cut" d="M135 190 H205 V110 H335 V190 H465 V110 H595 V190 H725 V110 H795 V540 H725 V610 H595 V540 H465 V610 H335 V540 H205 V610 H135 Z" />
            {artworkDataUrl && <path d="M205 190 H725 V540 H205 Z" fill="url(#artwork-pattern)" opacity=".58" />}
            {[205,335,465,595,725].map((x) => <line key={x} className="dieline-fold" x1={x} y1="190" x2={x} y2="540" />)}
            <line className="dieline-fold" x1="205" y1="190" x2="725" y2="190" />
            <line className="dieline-fold" x1="205" y1="540" x2="725" y2="540" />
            <text x="465" y="372">ARTWORK AREA</text>
          </g>
        )}
        {["pouch", "coffee"].includes(format) && (
          <g className="pw-dieline-net">
            <path className="dieline-cut" d="M220 90 H700 L740 560 Q460 620 180 560 Z" />
            {artworkDataUrl && <path d="M220 90 H700 L740 560 Q460 620 180 560 Z" fill="url(#artwork-pattern)" opacity=".65" />}
            <line className="dieline-fold" x1="220" y1="170" x2="700" y2="170" />
            <line className="dieline-fold" x1="190" y1="515" x2="730" y2="515" />
            <line className="dieline-fold" x1="460" y1="90" x2="460" y2="570" />
            <text x="460" y="350">FRONT / BACK PANELS</text>
          </g>
        )}
        {isRound && (
          <g className="pw-dieline-net">
            <rect className="dieline-cut" x="155" y="145" width="610" height="360" />
            {artworkDataUrl && <rect x="155" y="145" width="610" height="360" fill="url(#artwork-pattern)" opacity=".65" />}
            <line className="dieline-fold" x1="190" y1="145" x2="190" y2="505" />
            <line className="dieline-fold" x1="730" y1="145" x2="730" y2="505" />
            <text x="460" y="330">WRAP PRINT AREA</text>
          </g>
        )}
        <text className="pw-dieline-note" x="48" y="620">Concept preview. Final production dieline is issued after board, material and machine route are approved.</text>
      </svg>
    </div>
  );
}
