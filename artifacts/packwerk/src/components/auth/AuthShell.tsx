import type { ReactNode } from "react";
import { PackageCheck, Repeat2, Rotate3D, Truck } from "lucide-react";
import "./auth.css";

const BENEFITS = [
  { Icon: Truck, title: "Track every order", text: "Production, QC photos and dispatch status in one place." },
  { Icon: Repeat2, title: "Reorder in one click", text: "Approved specs and artwork stay saved to your account." },
  { Icon: Rotate3D, title: "Design in 3D", text: "Preview your pack before a single sheet is printed." },
];

const LOGOS = [
  { name: "Plum", src: "/images/logos/plum-official.svg" },
  { name: "Oliva", src: "/images/logos/oliva-official.svg" },
  { name: "Olipop", src: "/images/logos/olipop.webp" },
  { name: "Radico", src: "/images/logos/radico-official.webp" },
];

export function AuthShell({ children, aside, wide = false }: { children: ReactNode; aside?: ReactNode; wide?: boolean }) {
  return (
    <main className="pa">
      <section className="pa-visual" aria-label="Why brands use Packworkz">
        <img src="/images/flow-packaging-still-life-v2.webp" alt="" className="pa-visual-img" />
        <div className="pa-visual-inner">
          <div className="pa-hello">
            <span><PackageCheck size={16} /> Packworkz workspace</span>
            <h2>Every order, proof and reorder. <em>One login.</em></h2>
          </div>
          <div className="pa-benefits">
            {BENEFITS.map(({ Icon, title, text }, index) => (
              <div key={title} className="pa-benefit" style={{ animationDelay: `${200 + index * 120}ms` }}>
                <span><Icon size={18} /></span>
                <div><b>{title}</b><small>{text}</small></div>
              </div>
            ))}
          </div>
          {aside}
          <div className="pa-trust">
            <small>Packaging partner to brands like</small>
            <div>{LOGOS.map((logo) => <img key={logo.name} src={logo.src} alt={logo.name} loading="lazy" />)}</div>
          </div>
        </div>
      </section>
      <section className="pa-form-side">
        <div className={`pa-form-wrap${wide ? " is-wide" : ""}`}>{children}</div>
      </section>
    </main>
  );
}
