import { useEffect, useRef, useState } from "react";

const ROUTES = [
  { to: "UAE", d: "M 330,130 Q 370,110 410,120" },
  { to: "UK", d: "M 310,120 Q 280,80 240,90" },
  { to: "USA", d: "M 310,115 Q 260,60 180,85" },
  { to: "Singapore", d: "M 340,135 Q 370,140 390,145" },
  { to: "Nigeria", d: "M 315,140 Q 295,160 270,165" },
  { to: "Australia", d: "M 335,145 Q 370,175 400,190" },
];

export default function FactoryNetworkSection() {
  const ref = useRef<SVGSVGElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-24 px-8 md:px-20" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto">
        <p className="font-bold tracking-[0.25em] text-xs uppercase mb-4" style={{ color: "#1B6CA8" }}>OUR NETWORK</p>
        <h2 className="clash-display mb-14" style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1.1 }}>
          Manufactured in India.<br />Delivered everywhere.
        </h2>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Left: Stats */}
          <div className="lg:w-2/5 space-y-10">
            {[
              { num: "500+", label: "Verified factory partners" },
              { num: "1", label: "Owned manufacturing facility", sub: "Flexo + Rotogravure · Indore, India" },
              { num: "40+", label: "Countries we deliver to" },
            ].map((s) => (
              <div key={s.num}>
                <p className="clash-display" style={{ color: "#E8A838", fontSize: 52, lineHeight: 1 }}>{s.num}</p>
                <p className="mt-1" style={{ color: "#64748B", fontSize: 14 }}>{s.label}</p>
                {s.sub && <p className="mt-0.5 font-bold" style={{ color: "#1B6CA8", fontSize: 12 }}>{s.sub}</p>}
              </div>
            ))}

            <div className="rounded-xl p-5" style={{ background: "#0D1B2A", borderLeft: "3px solid #E8A838" }}>
              <p className="text-white text-sm leading-relaxed" style={{ lineHeight: 1.7 }}>
                Unlike other platforms, we have skin in the game. Our owned manufacturing facility handles flexographic and rotogravure printing — giving us direct cost control on your most-used flexible and printed SKUs.
              </p>
            </div>
          </div>

          {/* Right: World Map */}
          <div className="lg:w-3/5 w-full">
            <svg ref={ref} viewBox="0 0 560 360" className="w-full" style={{ background: "white" }}>
              {/* Simplified world continents as shapes */}
              {/* North America */}
              <ellipse cx="155" cy="120" rx="60" ry="45" fill="#E2EAF4" opacity="0.8" />
              {/* South America */}
              <ellipse cx="185" cy="195" rx="30" ry="45" fill="#E2EAF4" opacity="0.8" />
              {/* Europe */}
              <ellipse cx="265" cy="100" rx="28" ry="25" fill="#E2EAF4" opacity="0.8" />
              {/* Africa */}
              <ellipse cx="280" cy="175" rx="30" ry="50" fill="#E2EAF4" opacity="0.8" />
              {/* Asia (simplified) */}
              <ellipse cx="380" cy="115" rx="70" ry="45" fill="#E2EAF4" opacity="0.8" />
              {/* Australia */}
              <ellipse cx="420" cy="210" rx="32" ry="22" fill="#E2EAF4" opacity="0.8" />

              {/* India (main dot) */}
              <g>
                <circle cx="355" cy="145" r="14" fill="#E8A838" opacity="0.2">
                  <animate attributeName="r" from="14" to="22" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="355" cy="145" r="7" fill="#E8A838" />
              </g>
              <text x="365" y="140" fill="#0D1B2A" fontSize="8" fontWeight="700">Manufacturing Hub</text>

              {/* Route lines */}
              {ROUTES.map((route, i) => (
                <path
                  key={route.to}
                  d={`M 355,145 ${route.d}`}
                  fill="none"
                  stroke="#1B6CA8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity={animated ? 0.6 : 0}
                  style={{ transition: `opacity 0.5s ease ${i * 300}ms` }}
                />
              ))}

              {/* Destination dots */}
              {[
                { x: 410, y: 120 }, // UAE
                { x: 252, y: 88 },  // UK
                { x: 178, y: 87 },  // USA
                { x: 418, y: 152 }, // Singapore
                { x: 270, y: 170 }, // Nigeria
                { x: 420, y: 210 }, // Australia
              ].map((pos, i) => (
                <circle
                  key={i}
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill="#1B6CA8"
                  opacity={animated ? 0.9 : 0}
                  style={{ transition: `opacity 0.4s ease ${i * 300 + 500}ms` }}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Amber band */}
        <div className="mt-16 rounded-xl py-6 px-8 text-center" style={{ background: "#E8A838" }}>
          <p className="font-bold text-lg" style={{ color: "#0D1B2A" }}>
            "Your packaging cost drops the moment you stop sourcing locally and start sourcing smarter."
          </p>
        </div>
      </div>
    </section>
  );
}
