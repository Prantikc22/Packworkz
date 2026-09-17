import { ArrowRight, CheckCircle2, Quote } from "lucide-react";
import { Link } from "wouter";
import { CATALOG_SKUS } from "@/lib/catalog";

const METRICS = [
  { value: "220+", label: "brands served" },
  { value: "20+", label: "countries reached" },
  { value: String(CATALOG_SKUS.length), label: "focused product families" },
  { value: "2", label: "clear buying paths" },
];

const STORIES = [
  {
    type: "EMERGING BRAND",
    quote: "The 500-unit pouch run was exactly what we needed to launch without overbuying. We approved the proof, understood the unit economics, and reordered the same specification when demand picked up.",
    name: "Anand Kumar",
    role: "Founder, Artisan Chai Co.",
    result: "Low-MOQ launch to repeat order",
    logo: "",
  },
  {
    type: "ENTERPRISE PROCUREMENT",
    quote: "Packworkz brought sourcing, QC and dispatch tracking into one operating view. Our team spends less time coordinating vendors and more time planning launches and availability.",
    name: "Rohan Mehta",
    role: "Supply Chain, Happilo",
    result: "One owner across the packaging workflow",
    logo: "/images/logos/happilo-official.png",
  },
];

const CUSTOMER_LOGOS = [
  { name: "Plum", src: "/images/logos/plum-official.svg" },
  { name: "Amul", src: "/images/logos/amul-official.png" },
  { name: "Haldirams", src: "/images/logos/haldirams-official.png" },
  { name: "Bhikaram", src: "/images/logos/bhikharam-chandmal-official.png" },
  { name: "Oliva", src: "/images/logos/oliva-official.svg" },
  { name: "Olipop", src: "/images/logos/olipop.webp" },
  { name: "Radico", src: "/images/logos/radico-official.webp" },
  { name: "Biskfarm", src: "/images/logos/biskfarm-official.webp" },
];

function CustomerLogo({ name, src }: { name: string; src: string }) {
  if (name === "Amul" || name === "Haldirams" || name === "Bhikaram") {
    const isAmul = name === "Amul";
    const width = isAmul ? 720 : name === "Haldirams" ? 520 : 620;
    const height = isAmul ? 405 : name === "Haldirams" ? 296 : 316;
    // Crop only transparent margins or the coloured badge field. The visible
    // wordmarks remain pixels from the supplied original logo artwork.
    const viewBox = isAmul ? "0 74 720 262" : name === "Haldirams" ? "72 42 376 193" : "42 54 536 202";
    const filterId = `pw-original-white-${name.toLowerCase()}`;

    return (
      <svg viewBox={viewBox} role="img" aria-label={name}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values={isAmul
                ? "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
                : "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.1 1.5 1.5 0 -2.1"}
            />
          </filter>
        </defs>
        <image href={src} width={width} height={height} filter={`url(#${filterId})`} />
      </svg>
    );
  }

  return <img src={src} alt={name} loading="lazy" />;
}

export default function TestimonialsSection() {
  return (
    <section className="pw-proof-section">
      <div className="pw-proof-inner">
        <div className="pw-proof-intro">
          <p>CUSTOMER PROOF</p>
          <h2>Built for the first 500 units and the next 5 million.</h2>
          <span>Smaller brands need access. Procurement teams need control. The operating model has to serve both without making either one wait in the wrong flow.</span>
        </div>

        <div className="pw-proof-metrics" aria-label="Packworkz operating numbers">
          {METRICS.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}
        </div>

        <div className="pw-proof-stories">
          {STORIES.map((story) => (
            <article key={story.type}>
              <div className="pw-proof-story-top">
                <span>{story.type}</span>
                {story.logo ? <div className="pw-proof-story-logo"><img src={story.logo} alt="Happilo" /></div> : <Quote size={25} />}
              </div>
              <blockquote>{story.quote}</blockquote>
              <div className="pw-proof-person">
                <div className="pw-proof-identity">
                  <div><strong>{story.name}</strong><span>{story.role}</span></div>
                </div>
                <p><CheckCircle2 size={15} /> {story.result}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="pw-proof-brands">
          <span>Packaging workflows used across</span>
          <div>{CUSTOMER_LOGOS.map((logo) => <div key={logo.name} className={`pw-proof-logo pw-proof-logo-${logo.name.toLowerCase()}`}><CustomerLogo name={logo.name} src={logo.src} /></div>)}</div>
          <Link href="/contact">Talk to the team <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}
