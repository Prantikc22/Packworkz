import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-[#E2EAF4] bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
            Packwerk
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors hover:text-[#1B6CA8] ${location.startsWith('/products') ? 'text-[#1B6CA8]' : 'text-[#374151]'}`}
            >
              Products
            </Link>
            <Link
              href="/design"
              className={`text-sm font-medium transition-colors hover:text-[#1B6CA8] ${location === '/design' ? 'text-[#1B6CA8]' : 'text-[#374151]'}`}
            >
              Design Service
            </Link>
            <Link
              href="/samples"
              className={`text-sm font-medium transition-colors hover:text-[#1B6CA8] ${location === '/samples' ? 'text-[#1B6CA8]' : 'text-[#374151]'}`}
            >
              Samples
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#374151] hover:text-[#1B6CA8] hidden sm:block transition-colors"
            >
              Login
            </Link>
            <Link href="/quote">
              <Button className="bg-[#E8A838] text-[#0D1B2A] hover:bg-amber-400 font-semibold rounded-full px-6">
                Get Quote
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-[#0D1B2A] text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Packwerk</h3>
            <p className="text-gray-400 text-sm">
              India's premium B2B packaging sourcing platform for D2C brands, FMCG companies, and manufacturers.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#E8A838]">Solutions</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white transition-colors">Product Catalogue</Link></li>
              <li><Link href="/design" className="hover:text-white transition-colors">Design Services</Link></li>
              <li><Link href="/samples" className="hover:text-white transition-colors">Order Samples</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#E8A838]">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Quality Assurance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#E8A838]">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Packwerk India. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
