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
  { name: "Happilo", src: "/images/logos/happilo-official.png" },
  { name: "Bodycraft", src: "/images/logos/bodycraft-official.svg" },
  { name: "Oliva", src: "/images/logos/oliva-official.svg" },
];

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
          <div>{CUSTOMER_LOGOS.map((logo) => <div key={logo.name} className={`pw-proof-logo pw-proof-logo-${logo.name.toLowerCase()}`}><img src={logo.src} alt={logo.name} loading="lazy" /></div>)}</div>
          <Link href="/contact">Talk to the team <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}
