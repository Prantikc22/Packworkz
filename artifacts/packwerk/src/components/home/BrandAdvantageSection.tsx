import { ArrowRight, BadgeIndianRupee, Box, ClipboardCheck, Coins, GitBranch, Globe2, ShieldCheck, Truck, UsersRound } from "lucide-react";
import { Link } from "wouter";

const ADVANTAGES = [
  { Icon: Coins, title: "Better rates at every scale", body: "The right production route for your order size, from hundreds to millions." },
  { Icon: GitBranch, title: "Backup sourcing built in", body: "Alternative suppliers planned before production to reduce risk and support on-time delivery." },
  { Icon: ShieldCheck, title: "3-stage quality control", body: "Pre-production approval, in-production checks and pre-dispatch verification." },
  { Icon: ClipboardCheck, title: "Global compliance support", body: "Documentation aligned to your format, factory and destination markets." },
  { Icon: BadgeIndianRupee, title: "Clear commercials", body: "Pricing, terms and approvals visible before production — no surprises later." },
  { Icon: Truck, title: "Managed logistics", body: "Production and dispatch tracked in one order record, with updates to your team." },
];

export default function BrandAdvantageSection() {
  return (
    <section id="packworkz-advantage" className="pw-advantage-section">
      <div className="pw-advantage-shell">
        <div className="pw-advantage-main">
          <div className="pw-advantage-copy">
            <p className="pw-advantage-eyebrow">THE PACKWORKZ ADVANTAGE</p>
            <h2>Why brands choose Packworkz over multiple vendors.</h2>
            <p>One partner for sourcing, production, quality, compliance and delivery — so you can move faster, with less complexity.</p>
            <div className="pw-advantage-actions">
              <Link href="/configure" className="pw-advantage-primary">Start Configuration <ArrowRight size={21} /></Link>
              <Link href="/contact" className="pw-advantage-secondary">Talk to our team <ArrowRight size={20} /></Link>
            </div>
          </div>
          <div className="pw-advantage-grid">
            {ADVANTAGES.map(({ Icon, title, body }) => (
              <div className="pw-advantage-feature" key={title}>
                <span className="pw-advantage-icon"><Icon size={30} strokeWidth={1.7} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="pw-advantage-visual">
          <img className="pw-advantage-still-life" src="/images/advantage-packaging-still-life-crop-v1.webp" alt="Kraft carton, white and green pouches, a snack jar and a label roll" loading="lazy" />
          <div className="pw-advantage-map-panel">
            <img src="/images/world-routes-dots.svg" alt="" aria-hidden="true" />
            <div className="pw-advantage-global-copy"><strong>From India<br />to the world.</strong><small>Packaging for ambitious brands, everywhere.</small><i /></div>
          </div>
        </div>
        <div className="pw-advantage-footer">
          <div><Globe2 size={35} strokeWidth={1.5} /><span><strong>Worldwide delivery</strong><small>Serving brands in 50+ countries</small></span></div>
          <div><Box size={35} strokeWidth={1.5} /><span><strong>Wide range of formats</strong><small>Pouches, cartons, labels, bottles & more</small></span></div>
          <div><UsersRound size={35} strokeWidth={1.5} /><span><strong>Trusted by growing brands</strong><small>Across food, beverage, personal care and more</small></span></div>
        </div>
      </div>
    </section>
  );
}
