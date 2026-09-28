import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const CARDS = [
  {
    href: "/machinery",
    vertical: "Machinery",
    text: "Sealers, fillers, coders and labellers matched to your pack.",
    image: "/images/machinery/packaging-line-hero-v1.webp",
    className: "is-machinery",
  },
  {
    href: "/circular",
    vertical: "Circular",
    text: "Sell production scrap to verified recyclers, paid per kg.",
    image: "/images/circular/film-bale.webp",
    className: "is-circular",
  },
];

/** Adjacent services that connect production and recovery to the pack itself. */
export function BeyondPackagingSection() {
  return (
    <section className="pw-beyond" aria-labelledby="pw-beyond-title">
      <div className="pw-beyond-inner">
        <div className="pw-beyond-head scroll-animate">
          <p>Beyond the pack</p>
          <div>
            <h2 id="pw-beyond-title">Packaging doesn&apos;t stop <em>at the pack.</em></h2>
            <span>Set up the equipment that fills it and route the production scrap it leaves behind — both connected to the same packaging specification.</span>
          </div>
        </div>
        <div className="pw-beyond-grid">
          {CARDS.map(({ href, vertical, text, image, className }, index) => (
            <Link key={href} href={href} className={`pw-beyond-card ${className} scroll-animate scroll-animate-delay-${index + 1}`}>
              <img src={image} alt="" loading="lazy" />
              <div className="pw-beyond-copy">
                <span className="pw-beyond-lockup"><span className="pw-brand-mark" aria-hidden="true"><i /><b /></span>Packworkz</span>
                <h3>{vertical}</h3>
                <small>{text}</small>
              </div>
              <span className="pw-beyond-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
