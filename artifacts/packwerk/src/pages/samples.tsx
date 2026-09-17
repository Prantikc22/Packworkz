import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Box, CheckCircle2, PackageOpen, ShieldCheck, SwatchBook, Truck } from "lucide-react";

const KIT_CONTENTS = [
  { Icon: PackageOpen, title: "25–50+ physical samples", text: "Pouches, cartons, labels, mailers, rigid packs, bottles and foodservice formats." },
  { Icon: SwatchBook, title: "Material and finish swatches", text: "Kraft, barrier films, boards, labels, laminates and lower-impact structures." },
  { Icon: ShieldCheck, title: "Practical selection guide", text: "Compare protection, print quality, finish, stiffness and likely production route." },
  { Icon: Truck, title: "Delivered across India", text: "The kit is ₹299. Shipping is calculated from your delivery postcode." },
];

const FORMAT_CARDS = [
  { number: "01", title: "Flexible packs", text: "Stand-up, flat-bottom and barrier pouch examples.", image: "/images/flow-packaging-still-life-v2.webp" },
  { number: "02", title: "Boxes and cartons", text: "Folding cartons, rigid structures and ecommerce mailers.", image: "/images/sustainability-kraft-sourcing-v1.webp" },
  { number: "03", title: "Labels and materials", text: "Label stocks, finishes, films and substrate swatches.", image: "/images/sustainability-material-layers-v1.webp" },
];

const FAQS = [
  ["Are these printed with my branding?", "This is a discovery kit containing representative production samples and material swatches. Once you shortlist a format, Packworkz can scope a custom branded prototype separately."],
  ["How many samples will I receive?", "Every kit contains at least 25 samples. Most contain 35–50+ pieces depending on current format and material availability."],
  ["Is shipping included in ₹299?", "Shipping is charged separately according to the delivery postcode and the packed kit weight."],
  ["Can I request a specific category?", "Yes. Choose your main interest in the request form and add any specific pouch, box, bottle, label or foodservice requirement in the notes."],
];

export default function Samples() {
  const [submitted, setSubmitted] = useState(false);

  const requestKit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "Hi Packworkz, I want the ₹299 packaging sample kit.",
      `Name: ${data.get("name")}`,
      `Company: ${data.get("company") || "Not provided"}`,
      `Phone: ${data.get("phone")}`,
      `Pincode: ${data.get("pincode")}`,
      `Main interest: ${data.get("interest")}`,
      `Notes: ${data.get("notes") || "None"}`,
    ].join("\n");
    setSubmitted(true);
    window.open(`https://wa.me/918208990366?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="pw-sample-page">
      <section className="pw-sample-hero">
        <div className="pw-sample-hero-copy">
          <p className="pw-sample-eyebrow">PACKAGING SAMPLE KIT</p>
          <h1>Feel 25–50+ packaging samples before choosing one.</h1>
          <p className="pw-sample-lead">Compare structures, materials, finishes and print quality at your own desk. A curated Packworkz sample kit arrives at your doorstep for one small fee.</p>
          <div className="pw-sample-price"><strong>₹299</strong><span>+ shipping<br /><small>one curated kit</small></span></div>
          <div className="pw-sample-actions">
            <a href="#sample-kit-order">Get the sample kit <ArrowRight size={18} /></a>
            <Link href="/products">Browse packaging</Link>
          </div>
          <div className="pw-sample-mini-proof">
            <span><CheckCircle2 size={16} /> 25 sample minimum</span>
            <span><CheckCircle2 size={16} /> Category preferences included</span>
            <span><CheckCircle2 size={16} /> Pan-India delivery</span>
          </div>
        </div>
        <div className="pw-sample-hero-visual">
          <img src="/images/flow-packaging-still-life-v2.webp" alt="Assorted packaging formats included in a Packworkz sample kit" />
          <div><b>25–50+</b><span>formats, materials<br />and finishes</span></div>
        </div>
      </section>

      <section className="pw-sample-included pw-reveal">
        <div className="pw-sample-section-head">
          <p>WHAT ARRIVES</p>
          <h2>A useful packaging library, not a handful of random pieces.</h2>
          <span>We curate the kit around your category while keeping enough variety to compare unfamiliar options.</span>
        </div>
        <div className="pw-sample-included-grid">
          {KIT_CONTENTS.map(({ Icon, title, text }, index) => (
            <article className={`pw-reveal pw-d${index + 1}`} key={title}><Icon size={28} strokeWidth={1.55} /><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="pw-sample-formats">
        <div className="pw-sample-section-head pw-reveal">
          <p>EXPLORE BY TOUCH</p>
          <h2>Shortlist faster when the material is in your hands.</h2>
        </div>
        <div className="pw-sample-format-grid">
          {FORMAT_CARDS.map((card, index) => (
            <article className={`pw-reveal pw-d${index + 1}`} key={card.number}>
              <img src={card.image} alt={card.title} />
              <div><span>{card.number}</span><h3>{card.title}</h3><p>{card.text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="pw-sample-steps">
        <div className="pw-sample-section-head pw-reveal"><p>HOW IT WORKS</p><h2>Three steps. No complicated sample purchase flow.</h2></div>
        <div className="pw-sample-step-grid">
          {[
            ["01", "Tell us what you sell", "Choose your industry and the formats you want to inspect."],
            ["02", "Confirm shipping", "Our team confirms the kit contents, shipping charge and payment link."],
            ["03", "Open, compare, shortlist", "Use the enclosed guide, then ask Packworkz to quote the formats you prefer."],
          ].map(([number, title, text], index) => <article className={`pw-reveal pw-d${index + 1}`} key={number}><b>{number}</b><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section id="sample-kit-order" className="pw-sample-order">
        <div className="pw-sample-order-copy pw-reveal">
          <p>REQUEST YOUR KIT</p>
          <h2>Start with samples. Order with confidence.</h2>
          <span>Share a few delivery details. The sample team will confirm the curation, shipping charge and secure payment link on WhatsApp.</span>
          <div className="pw-sample-order-price"><strong>₹299</strong><small>kit price<br />shipping extra</small></div>
        </div>
        <form className="pw-sample-form pw-reveal pw-d1" onSubmit={requestKit}>
          <label>Full name<input name="name" required placeholder="Your name" /></label>
          <label>Company<input name="company" placeholder="Brand or company" /></label>
          <label>WhatsApp number<input name="phone" required inputMode="tel" placeholder="+91" /></label>
          <label>Delivery pincode<input name="pincode" required inputMode="numeric" pattern="[0-9]{6}" placeholder="6-digit pincode" /></label>
          <label className="pw-sample-form-wide">Main interest<select name="interest" defaultValue="Mixed sample kit"><option>Mixed sample kit</option><option>Pouches and flexible packaging</option><option>Boxes and cartons</option><option>Bottles and jars</option><option>Labels and sleeves</option><option>Foodservice packaging</option></select></label>
          <label className="pw-sample-form-wide">Anything specific?<textarea name="notes" rows={3} placeholder="Tell us the formats or materials you want included" /></label>
          <button className="pw-sample-form-wide" type="submit">{submitted ? "Continue on WhatsApp" : "Request my ₹299 sample kit"}<ArrowRight size={18} /></button>
          <small className="pw-sample-form-wide">You will receive the final shipping charge before payment.</small>
        </form>
      </section>

      <section className="pw-sample-faq">
        <div className="pw-sample-section-head pw-reveal"><p>GOOD TO KNOW</p><h2>Sample kit questions.</h2></div>
        <div>{FAQS.map(([question, answer]) => <details className="pw-reveal" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </section>
    </main>
  );
}
