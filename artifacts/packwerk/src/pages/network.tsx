import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, BadgeCheck } from "lucide-react";
import { CountUp, Marquee, SplitHeadline } from "@/components/marketing/motion";
import { CATALOG_SKUS, isCatalogSkuInCategory } from "@/lib/catalog";
import "./premium-pages.css";

const CERTIFICATIONS = [
  { code: "ISO 9001", name: "Quality management" },
  { code: "BRC", name: "Global food safety" },
  { code: "FDA", name: "US Food & Drug" },
  { code: "FSC", name: "Forest stewardship" },
  { code: "ISO 14001", name: "Environmental mgmt" },
  { code: "FSSAI", name: "India food safety" },
];

const familyCount = (...slugs: string[]) => {
  const count = CATALOG_SKUS.filter((sku) => slugs.some((slug) => isCatalogSkuInCategory(sku, slug))).length;
  return `${count} ${count === 1 ? "family" : "families"}`;
};

const CATEGORIES = [
  { label: "Flexible packaging", count: familyCount("flexible"), desc: "Pouches, sachets, refill and barrier formats.", image: "/skus/Standup_Pouch.jpg", href: "/products?category=flexible" },
  { label: "Rigid & bottles", count: familyCount("bottles", "tubes"), desc: "Plastic, glass, airless, fragrance and tube formats.", image: "/skus/glassbottles.jpg", href: "/products?category=bottles" },
  { label: "Boxes & cartons", count: familyCount("boxes"), desc: "Folding, corrugated, mailer, rigid and food-delivery boxes.", image: "/skus/rigidbox.jpg", href: "/products?category=boxes" },
  { label: "Fulfilment", count: familyCount("ecommerce", "protective"), desc: "Mailers, carrier bags, void fill and custom inserts.", image: "/skus/mailerbox.jpg", href: "/products?category=ecommerce" },
  { label: "Labels & accessories", count: familyCount("labels"), desc: "Labels, tape, cards, tissue and wrapping.", image: "/skus/labels.jpg", href: "/products?category=labels" },
  { label: "Films & sustainable", count: familyCount("rolls", "sustainable"), desc: "Rollstock, lidding, fibre, paper and food service.", image: "/skus/printedpackagingrolls.jpg", href: "/products?category=rolls" },
];

const VETTING_STEPS = [
  { title: "On-site audit", desc: "Our team visits every facility before onboarding. Physical verification is mandatory." },
  { title: "Sample QC gate", desc: "Three sample rounds covering dimensional accuracy, print fidelity and material strength." },
  { title: "Capacity mapping", desc: "Peak and off-peak capacity is mapped so partners deliver at scale without subcontracting." },
  { title: "Compliance review", desc: "Certifications are verified, dated and stored. Expired certificates trigger automatic quarantine." },
  { title: "Performance scoring", desc: "Every dispatch is scored on on-time delivery, rejections and packing accuracy." },
  { title: "Annual re-audit", desc: "Factories are re-audited every 12 months. Mediocrity doesn't survive the network." },
];

const TICKER = ["On-site audited", "Three-round sample QC", "Capacity mapped", "Certifications verified", "Every dispatch scored", "Re-audited annually", "Backup routes planned", "Pre-dispatch QC"];

// Graph geometry — core hub, six category nodes and a ring of factory satellites.
const CX = 300;
const CY = 300;
const HUBS = ["FLEXIBLE", "RIGID", "CARTONS", "FULFILMENT", "LABELS", "FILMS"].map((label, index) => {
  const angle = (index / 6) * Math.PI * 2 - Math.PI / 2;
  return { label, x: CX + Math.cos(angle) * 170, y: CY + Math.sin(angle) * 170, angle };
});
const FACTORIES = HUBS.flatMap((hub, hubIndex) => [-0.32, 0, 0.32].map((offset, index) => {
  const angle = hub.angle + offset;
  const radius = index === 1 ? 272 : 250;
  return { id: `${hubIndex}-${index}`, hub, x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius };
}));

function NetworkGraph() {
  return (
    <div className="pw-p-graph" aria-hidden="true">
      <svg viewBox="0 0 600 600">
        <circle cx={CX} cy={CY} r="170" fill="none" stroke="rgba(124,184,236,.08)" />
        <circle cx={CX} cy={CY} r="262" fill="none" stroke="rgba(124,184,236,.06)" />
        {FACTORIES.map((factory) => (
          <line key={`l-${factory.id}`} className="pw-p-graph-link" x1={factory.hub.x} y1={factory.hub.y} x2={factory.x} y2={factory.y} />
        ))}
        {HUBS.map((hub, index) => (
          <path key={`p-${hub.label}`} id={`pw-net-route-${index}`} className="pw-p-graph-link is-hot" d={`M${CX},${CY} L${hub.x},${hub.y}`} />
        ))}
        {HUBS.map((hub, index) => (
          <circle key={`pk-${hub.label}`} className="pw-p-graph-packet" r="3.2">
            <animateMotion dur={`${2.6 + (index % 3) * 0.5}s`} begin={`${index * 0.35}s`} repeatCount="indefinite">
              <mpath href={`#pw-net-route-${index}`} />
            </animateMotion>
          </circle>
        ))}
        {FACTORIES.map((factory) => (
          <circle key={`f-${factory.id}`} className="pw-p-graph-node" cx={factory.x} cy={factory.y} r="4.5" />
        ))}
        {HUBS.map((hub, index) => {
          const labelX = CX + Math.cos(hub.angle) * 212;
          const labelY = CY + Math.sin(hub.angle) * 212 + 4;
          return (
            <g key={hub.label}>
              <circle className="pw-p-graph-pulse" cx={hub.x} cy={hub.y} r="12" style={{ animationDelay: `${index * 0.5}s` }} />
              <circle className="pw-p-graph-node" cx={hub.x} cy={hub.y} r="11" />
              <circle cx={hub.x} cy={hub.y} r="3.5" fill="#f2b134" />
              <text className="pw-p-graph-label" x={labelX} y={labelY} textAnchor={Math.abs(Math.cos(hub.angle)) < 0.2 ? "middle" : Math.cos(hub.angle) > 0 ? "start" : "end"}>{hub.label}</text>
            </g>
          );
        })}
        <circle className="pw-p-graph-pulse" cx={CX} cy={CY} r="46" />
        <circle className="pw-p-graph-node is-core" cx={CX} cy={CY} r="46" />
        <text className="pw-p-graph-core-label" x={CX} y={CY + 4} textAnchor="middle">PACKWORKZ</text>
      </svg>
    </div>
  );
}

export default function Network() {
  return (
    <main className="pw-p">
      {/* ── HERO ── */}
      <section className="pw-p-hero" aria-labelledby="network-title" style={{ alignItems: "center" }}>
        <div className="pw-p-hero-grid" aria-hidden="true" />
        <div className="pw-p-hero-glow" aria-hidden="true" />
        <div className="pw-p-hero-inner">
          <div className="pw-p-network-hero">
            <div className="pw-p-hero-copy">
              <p className="pw-p-eyebrow pw-p-hero-fade" style={{ ["--d" as string]: "0ms" }}>Our manufacturing backbone</p>
              <SplitHeadline id="network-title" lines={["A curated", "*factory network."]} />
              <p className="pw-p-hero-sub pw-p-hero-fade" style={{ ["--d" as string]: "550ms" }}>
                Every specification is matched to eligible manufacturing routes, with alternate capacity planned where the format, tooling and approvals allow it.
              </p>
              <div className="pw-p-actions pw-p-hero-fade" style={{ ["--d" as string]: "700ms" }}>
                <Link className="pw-p-btn is-amber" href="/configure">Get a quote <ArrowRight size={18} /></Link>
                <Link className="pw-p-btn is-ghost" href="/products">Browse products</Link>
              </div>
            </div>
            <div className="pw-p-hero-fade" style={{ ["--d" as string]: "300ms" }}><NetworkGraph /></div>
          </div>
          <div className="pw-p-hero-foot pw-p-hero-fade" style={{ ["--d" as string]: "900ms", marginTop: 40 }}>
            <div><b><CountUp value="500+" /></b><small>Verified partners</small></div>
            <div><b><CountUp value="20+" /></b><small>States covered</small></div>
            <div><b><CountUp value="3×" /></b><small>Backup vendors / order</small></div>
            <div><b><CountUp value="100%" /></b><small>QC pre-dispatch</small></div>
          </div>
        </div>
      </section>

      <div className="pw-p-ticker is-dark">
        <Marquee speed={44}>{TICKER.map((item) => <span className="pw-p-ticker-item" key={item}>{item}</span>)}</Marquee>
      </div>

      {/* ── VETTING ── */}
      <section className="pw-p-section pw-p-deep">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">Our vetting process</p><h2 className="pw-p-h2 pw-reveal pw-d1">Not every factory <em>makes the cut.</em></h2></div>
            <p className="pw-p-lead pw-reveal pw-d2">We evaluate factories across 40+ parameters before they handle a single Packworkz order — and keep scoring them after.</p>
          </div>
          <div className="pw-p-funnel">
            {VETTING_STEPS.map((step, index) => (
              <div key={step.title} className="pw-p-funnel-step pw-reveal" style={{ ["--pw-delay" as string]: `${index * 120}ms` }}>
                <b>0{index + 1}</b><h3>{step.title}</h3><p>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="pw-p-funnel-bar pw-reveal">
            <small>Applied to</small>
            <div className="pw-p-funnel-bar-track"><span /></div>
            <small><b>Every partner</b>, before the first order and every year after</small>
          </div>
        </div>
      </section>

      {/* ── COVERAGE ── */}
      <section className="pw-p-section">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">Category coverage</p><h2 className="pw-p-h2 pw-reveal pw-d1">One focused catalogue. <em>One connected network.</em></h2></div>
            <Link className="pw-p-link pw-reveal pw-d2" href="/products">View the full catalogue <ArrowUpRight size={17} /></Link>
          </div>
          <div className="pw-p-tiles">
            {CATEGORIES.map((category, index) => (
              <Link key={category.label} href={category.href} className={`pw-p-tile pw-reveal pw-d${(index % 3) + 1}`}>
                <img src={category.image} alt={`${category.label} packaging`} loading="lazy" />
                <span className="pw-p-tile-arrow"><ArrowUpRight size={18} /></span>
                <small>{category.count}</small>
                <h3>{category.label}</h3>
                <p>{category.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section className="pw-p-section is-tight pw-p-cream">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">Certifications covered</p><h2 className="pw-p-h2 pw-reveal pw-d1">Export-ready. <em>Regulation-compliant.</em></h2></div>
            <p className="pw-p-lead pw-reveal pw-d2">Certifications are verified for the selected factory and specification before production is confirmed.</p>
          </div>
          <div className="pw-p-certs" style={{ background: "#fff" }}>
            {CERTIFICATIONS.map((cert, index) => (
              <div key={cert.code} className={`pw-p-cert pw-reveal pw-d${index + 1}`}>
                <div className="pw-p-cert-seal"><BadgeCheck size={28} /></div>
                <b>{cert.code}</b><small>{cert.name}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pw-p-final">
        <p className="pw-p-eyebrow pw-reveal" style={{ justifyContent: "center" }}>Put it to work</p>
        <h2 className="pw-reveal pw-d1">Put the network <em>to work for your brand.</em></h2>
        <p className="pw-reveal pw-d2">Specification-led matching, documented QC and alternate sourcing routes where eligible.</p>
        <div className="pw-p-actions pw-reveal pw-d3">
          <Link className="pw-p-btn is-amber" href="/configure">Get a quote <ArrowRight size={18} /></Link>
          <Link className="pw-p-btn is-ghost" href="/products">Browse the catalogue</Link>
        </div>
        <p className="pw-p-final-note pw-reveal pw-d4">MOQs from 25 units on selected formats · enterprise volumes supported</p>
      </section>
    </main>
  );
}
