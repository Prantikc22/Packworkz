import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Cpu, Eye, Leaf, ShieldCheck } from "lucide-react";
import { CATALOG_SKUS } from "@/lib/catalog";
import { CountUp, Marquee, SplitHeadline, SpotlightCard, useScrollProgress } from "@/components/marketing/motion";
import "./premium-pages.css";

const TIMELINE = [
  { year: "1993", title: "Kalyani Packaging is founded", desc: "A flexographic printing and lamination plant opens in West Bengal, serving regional FMCG brands. Built on precision, not promises." },
  { year: "2008", title: "Expansion & modernisation", desc: "Kalyani Rotopack Pvt Ltd is incorporated. Rotogravure lines, barrier laminates and food-grade film processing follow, serving national brands across India." },
  { year: "2018", title: "A global supply network", desc: "A decade of supplier relationships becomes a curated network, with raw materials from Japan, South Korea, Germany and domestic mills for cost and quality leverage." },
  { year: "2024", title: "Packworkz is born", desc: "Three decades of manufacturing know-how and 500+ vetted factories become India's first managed packaging platform — the supply chain we always wished we had." },
  { year: "2025", title: "The platform scales nationally", desc: "The catalogue expands across D2C and enterprise packaging, supported by real-time order records and inventory intelligence." },
];

const VALUES = [
  { Icon: Eye, title: "Radical transparency", desc: "Every price, lead time and production route is visible to you. No hidden markups, no black boxes, no 'trust us' procurement." },
  { Icon: ShieldCheck, title: "Quality without compromise", desc: "Three-stage QC before dispatch, every batch. You only pay for what meets spec — rejects are on us." },
  { Icon: Cpu, title: "Technology over tradition", desc: "SmartStock™, live dashboards and digital QC trails, because the industry ran on WhatsApp and Excel for too long." },
  { Icon: Leaf, title: "Sustainability first", desc: "We actively steer brands toward lower-footprint alternatives. The planet is a stakeholder in every order we place." },
];

const MISSION_STATS = [
  { num: "18–35%", label: "Cost savings vs. traditional sourcing" },
  { num: String(CATALOG_SKUS.length), label: "Product families in the catalogue" },
  { num: "0", label: "Stockouts for SmartStock customers" },
  { num: "48hr", label: "Pricing turnaround" },
];

const CAPABILITIES = ["Rotogravure printing", "Flexographic printing", "Barrier laminates", "Food-grade films", "Rigid & folding cartons", "Labels & sleeves", "Bottles & jars", "Mailers & e-commerce", "Compostable formats", "Export documentation"];

const SUPPLY_PINS = [
  { name: "India · HQ", x: 71.7, y: 43, home: true },
  { name: "Germany", x: 53.3, y: 28.9 },
  { name: "Japan", x: 88, y: 33 },
  { name: "South Korea", x: 84, y: 40 },
  { name: "Southeast Asia", x: 80, y: 57 },
];

function Timeline() {
  const [ref, progress] = useScrollProgress<HTMLDivElement>();
  return (
    <div className="pw-p-timeline" ref={ref}>
      <div className="pw-p-timeline-rail" aria-hidden="true"><span style={{ transform: `scaleY(${progress})` }} /></div>
      {TIMELINE.map((item, index) => {
        const active = progress >= (index + 0.2) / TIMELINE.length;
        return (
          <div key={item.year} className={`pw-p-timeline-item${active ? " is-active" : ""}`}>
            <span className="pw-p-timeline-year">{item.year}</span>
            <span className="pw-p-timeline-dot" aria-hidden="true" />
            <div className="pw-p-timeline-body"><h3>{item.title}</h3><p>{item.desc}</p></div>
          </div>
        );
      })}
    </div>
  );
}

export default function About() {
  return (
    <main className="pw-p">
      {/* ── HERO ── */}
      <section className="pw-p-hero" aria-labelledby="about-title">
        <div className="pw-p-hero-media"><img src="/kalyani-factory.png" alt="Kalyani Rotopack flexo printing and lamination plant" fetchPriority="high" /></div>
        <div className="pw-p-hero-grid" aria-hidden="true" />
        <div className="pw-p-hero-glow" aria-hidden="true" />
        <div className="pw-p-hero-inner">
          <div className="pw-p-hero-copy">
            <p className="pw-p-eyebrow pw-p-hero-fade" style={{ ["--d" as string]: "0ms" }}>Kalyani Rotopack Pvt Ltd · Manufacturing since 1993</p>
            <SplitHeadline id="about-title" lines={["Three decades", "on the press.", "*Now open to", "*every brand."]} />
            <p className="pw-p-hero-sub pw-p-hero-fade" style={{ ["--d" as string]: "650ms" }}>
              Packworkz is the procurement platform built by Kalyani Rotopack — more than thirty years of hands-on packaging manufacturing, made available to growing and enterprise brands.
            </p>
            <div className="pw-p-actions pw-p-hero-fade" style={{ ["--d" as string]: "800ms" }}>
              <Link className="pw-p-btn is-amber" href="/configure">Get a quote <ArrowRight size={18} /></Link>
              <Link className="pw-p-btn is-ghost" href="/how-it-works">How it works</Link>
            </div>
          </div>
          <div className="pw-p-hero-foot pw-p-hero-fade" style={{ ["--d" as string]: "1000ms" }}>
            <div><b><CountUp value="33+" /></b><small>Years manufacturing</small></div>
            <div><b><CountUp value={String(CATALOG_SKUS.length)} /></b><small>Product families</small></div>
            <div><b><CountUp value="500+" /></b><small>Factory partners</small></div>
            <div><b><CountUp value="220+" /></b><small>Brands served</small></div>
          </div>
        </div>
        <span className="pw-p-scroll-cue" aria-hidden="true">SCROLL</span>
      </section>

      <div className="pw-p-ticker">
        <Marquee>{CAPABILITIES.map((item) => <span className="pw-p-ticker-item" key={item}>{item}</span>)}</Marquee>
      </div>

      {/* ── ORIGIN STORY ── */}
      <section className="pw-p-section">
        <div className="pw-p-wrap pw-p-split-feature">
          <div>
            <p className="pw-p-eyebrow pw-reveal">The origin story</p>
            <h2 className="pw-p-h2 pw-reveal pw-d1">The manufacturing backbone <em>behind Packworkz.</em></h2>
            <div className="pw-p-prose pw-reveal pw-d2" style={{ marginTop: 32 }}>
              <p>In 1993, <strong>Kalyani Packaging</strong> was founded in West Bengal — a flexographic printing and lamination unit serving India's growing FMCG sector. It grew into <strong>Kalyani Rotopack Pvt Ltd</strong>, running rotogravure presses, multi-layer barrier laminates and food-grade film lines.</p>
              <p>Over three decades we built something most platforms cannot buy: <strong>manufacturer-grade relationships</strong>. We know which factories never miss a colour register and which mills supply the best barrier films — because we ran the press ourselves.</p>
              <p>In 2024 we decided to stop keeping that advantage inside one factory. Packworkz <strong>opens it up to every brand in India</strong>, from day one.</p>
            </div>
          </div>
          <div className="pw-p-frame pw-reveal pw-d2" style={{ aspectRatio: "4 / 4.4" }}>
            <img src="/images/enterprise-production-line-v1.webp" alt="Cartons moving through a packaging production line" loading="lazy" />
            <div className="pw-p-frame-badge" aria-label="Established 1993">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <defs><path id="about-badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
                <text fontSize="9.5" fontWeight="800" letterSpacing="3.2" fill="#0d1b2a"><textPath href="#about-badge-circle">EST. 1993 · KALYANI ROTOPACK · </textPath></text>
              </svg>
              <b>33</b>
            </div>
            <div className="pw-p-frame-tag"><b>Kalyani Rotopack Pvt Ltd</b><small>Flexo printing & lamination · Kolkata</small></div>
          </div>
        </div>
      </section>

      {/* ── DISRUPTION ── */}
      <section className="pw-p-section pw-p-dark">
        <div className="pw-p-wrap pw-p-split-feature">
          <div>
            <p className="pw-p-eyebrow pw-reveal">The disruption</p>
            <h2 className="pw-p-h2 pw-reveal pw-d1">India's packaging industry was <em>ripe for a reset.</em></h2>
            <p className="pw-p-lead pw-reveal pw-d2">For decades brands sourced through layers of middlemen — each taking a cut, each adding opacity. MOQs were out of reach for new brands, lead times were unpredictable and quality control was verbal.</p>
            <p className="pw-p-lead pw-reveal pw-d3" style={{ marginTop: 16 }}>Packworkz collapses those layers. We connect brands to a curated manufacturing network and manage the whole journey — quoting, procurement, QC, logistics and reorders.</p>
            <div className="pw-p-actions pw-reveal pw-d4"><Link className="pw-p-btn is-amber" href="/configure">Start a quote <ArrowRight size={18} /></Link></div>
          </div>
          <div className="pw-p-card-grid is-2">
            {MISSION_STATS.map((stat, index) => (
              <SpotlightCard key={stat.label} className={`pw-p-card pw-reveal pw-d${index + 1}`}>
                <b style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(2.4rem,3.8vw,3.8rem)", fontWeight: 800, letterSpacing: "-.06em", lineHeight: 1 }}><CountUp value={stat.num} /></b>
                <p style={{ marginTop: "auto" }}>{stat.label}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="pw-p-section pw-p-cream">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">The journey</p><h2 className="pw-p-h2 pw-reveal pw-d1">Three decades <em>in the making.</em></h2></div>
            <p className="pw-p-lead pw-reveal pw-d2">From a single flexo line in West Bengal to a national packaging platform.</p>
          </div>
          <Timeline />
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="pw-p-section pw-p-deep">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">What we stand for</p><h2 className="pw-p-h2 pw-reveal pw-d1">Four principles <em>on every order.</em></h2></div>
          </div>
          <div className="pw-p-values">
            {VALUES.map(({ Icon, title, desc }, index) => (
              <div key={title} className={`pw-p-value pw-reveal pw-d${index + 1}`}>
                <b>0{index + 1}</b>
                <div><Icon size={22} color="#f2b134" style={{ marginBottom: 14 }} /><h3>{title}</h3><p>{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL NETWORK ── */}
      <section className="pw-p-section">
        <div className="pw-p-wrap pw-p-world">
          <div>
            <p className="pw-p-eyebrow pw-reveal">Our network</p>
            <h2 className="pw-p-h2 pw-reveal pw-d1">Sourced globally. <em>Delivered locally.</em></h2>
            <p className="pw-p-lead pw-reveal pw-d2">Supplier relationships across India, Japan, South Korea, Germany and Southeast Asia — built over 30 years and stress-tested across thousands of production runs.</p>
            <div className="pw-p-actions pw-reveal pw-d3"><Link className="pw-p-link" href="/network">Inside the factory network <ArrowUpRight size={17} /></Link></div>
          </div>
          <div className="pw-p-world-map pw-reveal pw-d2" style={{ aspectRatio: "700 / 270", background: "none" }}>
            <img src="/images/world-routes-dots.svg" alt="World map showing Packworkz supply relationships" style={{ width: "100%", height: "100%" }} loading="lazy" />
            {SUPPLY_PINS.map((pin, index) => (
              <span key={pin.name} className={`pw-p-world-pin${pin.home ? " is-home" : ""}`} style={{ left: `${pin.x}%`, top: `${pin.y}%`, ["--pw-delay" as string]: `${index * 400}ms` }}>
                <i /><span>{pin.name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pw-p-final">
        <p className="pw-p-eyebrow pw-reveal" style={{ justifyContent: "center" }}>Work with us</p>
        <h2 className="pw-reveal pw-d1">Ready to fix <em>your packaging?</em></h2>
        <p className="pw-reveal pw-d2">Talk to our team. Get a detailed quote with delivery and payment schedules in 4 business hours during India working hours.</p>
        <div className="pw-p-actions pw-reveal pw-d3">
          <Link className="pw-p-btn is-amber" href="/configure">Get a quote <ArrowRight size={18} /></Link>
          <a className="pw-p-btn is-ghost" href="https://wa.me/918208990366" target="_blank" rel="noreferrer">WhatsApp us</a>
        </div>
        <p className="pw-p-final-note pw-reveal pw-d4">MOQs from 25 units on selected formats · enterprise volumes supported</p>
      </section>
    </main>
  );
}
