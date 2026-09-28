import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import "./auth.css";

const BENEFITS = [
  { title: "Track every order", text: "Production updates, QC photos and dispatch status in one place." },
  { title: "Reorder in one click", text: "Approved specifications and artwork stay saved to your account." },
  { title: "Design in 3D", text: "Preview your pack in the 3D Studio before anything is printed." },
];

const LOGOS = [
  { name: "Plum", src: "/images/logos/plum-official.svg" },
  { name: "Oliva", src: "/images/logos/oliva-official.svg" },
  { name: "Olipop", src: "/images/logos/olipop.webp" },
  { name: "Radico", src: "/images/logos/radico-official.webp" },
];

/**
 * Focused auth layout: slim brand bar, no site navigation or footer, so the
 * only jobs on the page are signing in or creating an account.
 */
export function AuthShell({ children, aside, wide = false, title }: { children: ReactNode; aside?: ReactNode; wide?: boolean; title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="pa">
      <header className="pa-bar">
        <Link href="/" className="pa-brand" aria-label="Packworkz home"><span className="pa-mark" aria-hidden="true"><i /><b /></span>Packworkz</Link>
        <Link href="/" className="pa-back"><ArrowLeft size={15} /> Back to site</Link>
      </header>
      <main className="pa-main">
        <section className="pa-visual" aria-label="Why brands use Packworkz">
          <img className="pa-visual-img" src="/images/auth-flatlay-v1.webp" alt="" />
          <div className="pa-visual-copy">
            <h2>Everything after “order placed”, <em>handled.</em></h2>
            <dl className="pa-benefits">
              {BENEFITS.map(({ title: heading, text }) => (
                <div key={heading}><dt>{heading}</dt><dd>{text}</dd></div>
              ))}
            </dl>
            {aside}
            <div className="pa-trust">
              <small>Packaging partner to brands like</small>
              <div>{LOGOS.map((logo) => <img key={logo.name} src={logo.src} alt={logo.name} />)}</div>
            </div>
          </div>
        </section>
        <section className="pa-form-side">
          <div className={`pa-form-wrap${wide ? " is-wide" : ""}`}>{children}</div>
        </section>
      </main>
    </div>
  );
}
