import { ArrowRight, CheckCircle2, Quote } from "lucide-react";
import { Link } from "wouter";

const METRICS = [
  { value: "220+", label: "brands served" },
  { value: "20+", label: "countries reached" },
  { value: "35", label: "focused product families" },
  { value: "2", label: "clear buying paths" },
];

const STORIES = [
  {
    type: "EMERGING BRAND",
    quote: "The 500-unit pouch run was exactly what we needed to launch without overbuying. We approved the proof, understood the unit economics, and reordered the same specification when demand picked up.",
    name: "Anand Kumar",
    role: "Founder, Artisan Chai Co.",
    result: "Low-MOQ launch to repeat order",
  },
  {
    type: "ENTERPRISE PROCUREMENT",
    quote: "Packworkz brought sourcing, QC and dispatch tracking into one operating view. Our team spends less time coordinating vendors and more time planning launches and availability.",
    name: "Rohan Mehta",
    role: "Supply Chain, Happilo",
    result: "One owner across the packaging workflow",
  },
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
              <div className="pw-proof-story-top"><span>{story.type}</span><Quote size={25} /></div>
              <blockquote>{story.quote}</blockquote>
              <div className="pw-proof-person"><div><strong>{story.name}</strong><span>{story.role}</span></div><p><CheckCircle2 size={15} /> {story.result}</p></div>
            </article>
          ))}
        </div>

        <div className="pw-proof-brands">
          <span>Packaging workflows used across</span>
          <div><b>PLUM</b><b>HAPPILO</b><b>BODYCRAFT</b><b>OLIVA</b></div>
          <Link href="/contact">Talk to the team <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}
