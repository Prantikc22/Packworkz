import { useState } from "react";
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

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-0 h-[68px]"
        style={{ background: "#020617", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

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
