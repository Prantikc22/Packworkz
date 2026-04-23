import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { href: "/products", label: "Products" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/industries", label: "Industries" },
  { href: "/design", label: "Design" },
  { href: "/samples", label: "Sample" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navStyle: React.CSSProperties = scrolled
    ? { background: "rgba(2,6,23,0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s ease" }
    : { background: "#020617", borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s ease" };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-0 h-[68px]"
        style={navStyle}>

        <Link href="/">
          <span className="text-xl font-black tracking-tight text-white cursor-pointer select-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            PackOps
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map(item => {
            const active = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className="text-xs font-bold tracking-[0.15em] uppercase cursor-pointer transition-colors duration-200"
                  style={{ color: active ? "#E8A838" : "rgba(255,255,255,0.65)", textDecoration: active ? "underline" : "none", textUnderlineOffset: "5px" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <span className="hidden md:inline text-xs font-bold tracking-[0.15em] uppercase text-slate-300 hover:text-white transition-colors cursor-pointer">Login</span>
          </Link>
          <Link href="/quote">
            <button className="px-5 py-2.5 rounded text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "#1B6CA8", color: "white" }}>
              Get Quote
            </button>
          </Link>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="material-symbols-outlined text-2xl">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-[68px]" style={{ background: "#020617" }}>
          <nav className="flex flex-col px-8 py-8 gap-6">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <span className="text-2xl font-black uppercase text-white">{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <span className="text-lg font-bold text-slate-300">Login</span>
              </Link>
              <Link href="/quote" onClick={() => setMobileOpen(false)}>
                <button className="px-8 py-4 rounded font-bold text-sm" style={{ background: "#1B6CA8", color: "white" }}>Get Quote</button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1 pt-[68px]">
        {children}
      </main>

      {/* ── WhatsApp Float Button ── */}
      <a
        href="https://wa.me/919999999999?text=Hi%20PackOps%2C%20I%27d%20like%20to%20discuss%20packaging%20for%20my%20brand."
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#25D366",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* ── FOOTER ── */}
      <footer className="px-8 md:px-16 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm border-t" style={{ background: "#020617", borderColor: "rgba(255,255,255,0.08)", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <span className="text-xl font-black text-white">PackOps</span>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            High-performance industrial packaging management for the modern enterprise.
          </p>
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} PackOps India. All rights reserved.</p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Products</h4>
          {["Folding Cartons", "Corrugated Solutions", "Protective Inserts", "Sustainability Line"].map(l => (
            <Link key={l} href="/products"><span className="text-slate-500 hover:text-white cursor-pointer transition-colors">{l}</span></Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Company</h4>
          {["About Us", "Partnerships", "Process", "Sustainability"].map(l => (
            <a key={l} href="#" className="text-slate-500 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Support</h4>
          {["Contact Sales", "Technical Docs", "Documentation", "Security"].map(l => (
            <a key={l} href="#" className="text-slate-500 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
