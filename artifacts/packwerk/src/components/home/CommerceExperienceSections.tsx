import { ArrowRight, Check, FileText, Layers3, Leaf, PackageCheck, Recycle, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const FLOW_STEPS = [
  {
    number: "01",
    title: "Choose",
    description: "Browse standard formats or tell us what you need.",
  },
  {
    number: "02",
    title: "Design",
    description: "Upload artwork, get dielines and review proofs with our team.",
  },
  {
    number: "03",
    title: "Order",
    description: "Buy standard formats instantly or get a managed quote for custom and high volumes.",
  },
  {
    number: "04",
    title: "SmartStock",
    description: "Track production, get updates and reorder faster as you grow.",
  },
];

function FlowVisual({ step }: { step: string }) {
  if (step === "Choose") {
    return (
      <figure className="pw-flow-visual pw-flow-visual-choose">
        <img src="/categories/flexiblepacks.webp" alt="A selection of flexible packaging formats" loading="lazy" />
        <figcaption><span>Pouches</span><span>Boxes</span><span>Labels</span><span>Bottles</span></figcaption>
      </figure>
    );
  }

  if (step === "Design") {
    return (
      <figure className="pw-flow-visual pw-flow-visual-design" aria-label="Packaging artwork and dieline preview">
        <div className="pw-flow-artwork-sheet">
          <span className="pw-flow-artwork-label">ARTWORK / 01</span>
          <div className="pw-flow-dieline">
            <span className="pw-flow-dieline-side" />
            <span className="pw-flow-dieline-front"><b>Good things<br />inside.</b><i /></span>
            <span className="pw-flow-dieline-side" />
          </div>
          <span className="pw-flow-artwork-measure">PRINT · FOLD · FINISH</span>
        </div>
        <figcaption><Check size={14} aria-hidden="true" /> Proof ready for review</figcaption>
      </figure>
    );
  }

  if (step === "Order") {
    return (
      <figure className="pw-flow-visual pw-flow-visual-order">
        <img src="/skus/mailerbox.jpg" alt="Mailer boxes ready for dispatch" loading="lazy" />
      </figure>
    );
  }

  return (
    <figure className="pw-flow-visual pw-flow-visual-stock">
      <img src="/kalyani-factory.png" alt="Packaging production at the Kalyani facility" loading="lazy" />
      <figcaption><Check size={15} aria-hidden="true" /> Production on track</figcaption>
    </figure>
  );
}

export function PackagingProcessSection() {
  return (
    <section className="pw-flow-section" aria-labelledby="pw-flow-title">
      <div className="pw-flow-inner">
        <div className="pw-flow-intro">
          <div className="pw-flow-intro-copy scroll-animate">
            <p className="pw-flow-eyebrow">THE PACKWORKZ FLOW</p>
            <h2 id="pw-flow-title">From idea to<br />repeat orders.</h2>
            <p className="pw-flow-summary">
              A simpler way to source, customise and scale your packaging — whether you need a few hundred pieces or millions.
            </p>
          </div>
          <div className="pw-flow-still-life scroll-animate scroll-animate-delay-1">
            <img src="/images/flow-packaging-still-life-v2.webp" alt="Packworkz mailer box, navy pouch, folding carton and label roll in a sunlit packaging still-life" loading="lazy" />
          </div>
        </div>

        <ol className="pw-flow-steps">
          {FLOW_STEPS.map((step, index) => (
            <li className={`pw-flow-step scroll-animate scroll-animate-delay-${index + 1}`} key={step.number}>
              <div className="pw-flow-step-track" aria-hidden="true">
                <span>{step.number}</span>
                <i />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <FlowVisual step={step.title} />
            </li>
          ))}
        </ol>

        <div className="pw-flow-footer scroll-animate">
          <Link href="/how-it-works" className="pw-flow-cta">See how it works <ArrowRight size={21} aria-hidden="true" /></Link>
          <p>SAME PACKAGING PARTNER.<br />AT EVERY STAGE OF YOUR GROWTH.</p>
        </div>
      </div>
    </section>
  );
}

const SUSTAINABILITY_ITEMS = [
  { image: "/images/sustainability-kraft-sourcing-v1.webp", imageAlt: "Kraft pouches and cartons", icon: ShieldCheck, eyebrow: "RESPONSIBLE SOURCING", title: "Verified from the source.", body: "Supplier declarations and relevant certificates collected in one place.", proof: "Supplier documentation", proofDetail: "MATCHED TO THE SPECIFICATION" },
  { image: "/images/foodservice-containers-premium.jpg", imageAlt: "Paper foodservice tubs, bowls and trays", icon: PackageCheck, eyebrow: "RIGHT-SIZE FOODSERVICE", title: "Right size for less impact.", body: "Bowls, tubs, trays and fibre formats that reduce over-packaging.", proof: "Fit for purpose", proofDetail: "LESS MATERIAL. SAME PERFORMANCE." },
  { image: "/images/sustainability-recycling-box-v1.webp", imageAlt: "Recyclable kraft carton", icon: Recycle, eyebrow: "END-OF-LIFE GUIDANCE", title: "Clear guidance. Greater recovery.", body: "Disposal language aligned to pack structure, local recovery and verified certification.", proof: "Aligned to local systems", proofDetail: "VERIFIED END-OF-LIFE PATHWAYS" },
];

export function SustainabilityProofSection() {
  return (
    <section id="sustainability" className="pw-sustainability-proof">
      <div className="pw-sustainability-inner">
        <div className="pw-sustainability-heading">
          <p>BETTER PACKAGING, WITH PROOF</p>
          <h2>Sustainability should<br />survive scrutiny.</h2>
          <span>Lower-impact choices are useful only when the material, supplier evidence<br className="pw-sustainability-desktop-break" /> and customer claim all agree.</span>
        </div>

        <div className="pw-sustainability-grid">
          <article className="pw-sustainability-feature">
            <img src="/images/sustainability-material-layers-v1.webp" alt="Layered samples of fibre, corrugated and recycled packaging material" loading="lazy" />
            <div className="pw-sustainability-feature-copy">
              <p>MATERIAL TRANSPARENCY</p>
              <h3>Start with<br />what it’s made of.</h3>
              <span>See the substrate structure, recycled-content options and evidence before claims.</span>
              <Link href="/sustainable" aria-label="Learn more about packaging materials"><span><ArrowRight size={20} /></span>Learn more</Link>
            </div>
            <div className="pw-sustainability-feature-proof"><Leaf size={25} /><span><strong>Multiple material options</strong><small>FIBRE / RECYCLED CONTENT / VERIFIED DATA</small></span></div>
          </article>
          {SUSTAINABILITY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <article className="pw-sustainability-card" key={item.title}>
                <div className="pw-sustainability-image"><img src={item.image} alt={item.imageAlt} loading="lazy" /></div>
                <div className="pw-sustainability-card-body">
                  <p className="pw-sustainability-card-eyebrow">{item.eyebrow}</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <div className="pw-sustainability-card-proof"><Icon size={22} /><span><strong>{item.proof}</strong><small>{item.proofDetail}</small></span></div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="pw-sustainability-footer">
          <div className="pw-sustainability-criteria">
            <span><Layers3 size={22} />Material<br />composition</span>
            <span><FileText size={22} />Supplier<br />documentation</span>
            <span><ShieldCheck size={22} />Claim<br />language</span>
            <span><Recycle size={22} />Recovery<br />suitability</span>
          </div>
          <div className="pw-sustainability-footer-cta">
            <p><Leaf size={26} /><span><strong>No blanket eco claims.</strong><small>Evidence is matched to the exact material and supplier.</small></span></p>
            <Link href="/sustainable">Explore lower-impact packaging <ArrowRight size={20} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
