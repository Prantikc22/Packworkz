import { Link, useLocation } from "wouter";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 shadow-2xl" style={{ background: "#0D1B2A" }}>
        <Link href="/" className="text-2xl font-black tracking-tighter text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Packwerk
        </Link>

        <nav className="hidden md:flex items-center gap-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Link
            href="/products"
            className={`text-sm font-bold tracking-wide uppercase transition-colors duration-200 ${location.startsWith('/products') ? 'text-[#E8A838] border-b-2 border-[#E8A838] pb-1' : 'text-slate-300 hover:text-white'}`}
          >
            Products
          </Link>
          <Link
            href="/design"
            className={`text-sm font-bold tracking-wide uppercase transition-colors duration-200 ${location === '/design' ? 'text-[#E8A838] border-b-2 border-[#E8A838] pb-1' : 'text-slate-300 hover:text-white'}`}
          >
            Design
          </Link>
          <Link
            href="/samples"
            className={`text-sm font-bold tracking-wide uppercase transition-colors duration-200 ${location === '/samples' ? 'text-[#E8A838] border-b-2 border-[#E8A838] pb-1' : 'text-slate-300 hover:text-white'}`}
          >
            Sample
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-bold tracking-wide uppercase text-slate-300 hover:text-white transition-colors duration-200"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Login
          </Link>
          <Link href="/quote">
            <button
              className="text-white px-6 py-2.5 rounded text-sm font-bold uppercase tracking-wide hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "#1B6CA8", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Get Quote
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-[72px]">
        {children}
      </main>

      <footer className="w-full px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-8 border-t-0 text-sm leading-relaxed" style={{ background: "#F2F3F6", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="flex flex-col gap-6">
          <div className="text-xl font-bold" style={{ color: "#0D1B2A" }}>Packwerk</div>
          <p className="text-slate-600">Revolutionizing packaging procurement through technology-led supply chains and managed QC.</p>
          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Packwerk India. All rights reserved.</p>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold uppercase tracking-wider text-xs" style={{ color: "#0D1B2A" }}>Products</h4>
          <nav className="flex flex-col gap-3">
            <Link href="/products" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Flexible Packaging</Link>
            <Link href="/products" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Rigid Packaging</Link>
            <Link href="/products" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Sustainable Options</Link>
            <Link href="/products" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Custom Labels</Link>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold uppercase tracking-wider text-xs" style={{ color: "#0D1B2A" }}>Company</h4>
          <nav className="flex flex-col gap-3">
            <a href="#" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">About Us</a>
            <a href="#" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Quality Assurance</a>
            <a href="#" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Careers</a>
            <a href="#" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Contact</a>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold uppercase tracking-wider text-xs" style={{ color: "#0D1B2A" }}>Legal</h4>
          <nav className="flex flex-col gap-3">
            <a href="#" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Terms of Service</a>
            <a href="#" className="text-slate-600 hover:underline decoration-[#1B6CA8] opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
