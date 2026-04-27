import { Link, useLocation } from "wouter";
import { useLogout } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/dashboard/orders", label: "Orders", icon: "deployed_code" },
  { href: "/dashboard/quotes", label: "Quotes", icon: "request_quote" },
  { href: "/dashboard/payments", label: "Payments", icon: "payments" },
  { href: "/dashboard/profile", label: "Profile", icon: "person" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        localStorage.removeItem("packwerk_access_token");
        localStorage.removeItem("packwerk_user");
        setLocation("/login");
      },
    });
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={onClick}>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded text-sm font-bold cursor-pointer transition-all relative"
              style={
                isActive
                  ? {
                      background: "rgba(27,108,168,0.1)",
                      color: "#1B6CA8",
                      borderLeft: "2px solid #E8A838",
                    }
                  : {
                      color: "#64748B",
                      borderLeft: "2px solid transparent",
                    }
              }
            >
              <MS icon={item.icon} className="text-xl" style={{ color: isActive ? "#1B6CA8" : "#94A3B8" }} />
              {item.label}
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#F8F9FC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r fixed inset-y-0 z-10" style={{ borderColor: "#E7E8EB" }}>
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "#E7E8EB" }}>
          <Link href="/">
            <span className="text-lg font-black tracking-tight cursor-pointer" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1B2A" }}>PackOps</span>
          </Link>
        </div>

        <p className="px-6 pt-6 pb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#94A3B8" }}>MAIN CONSOLE</p>

        <nav className="flex-1 px-3 space-y-0.5 pb-4">
          <NavLinks />
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "#E7E8EB" }}>
          {/* User avatar */}
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ background: "#1B6CA8" }}>
              JD
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#0D1B2A" }}>John Doe</p>
              <p className="text-xs" style={{ color: "#94A3B8" }}>Enterprise Account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-bold transition-all hover:bg-red-50"
            style={{ color: "#74777d" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ba1a1a"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#74777d"; }}
          >
            <MS icon="logout" className="text-xl" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">

        {/* Mobile header */}
        <header className="md:hidden bg-white border-b h-14 flex items-center px-4 justify-between sticky top-0 z-20" style={{ borderColor: "#E7E8EB" }}>
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-9 h-9 flex items-center justify-center rounded border" style={{ borderColor: "#E7E8EB" }}>
                <Menu className="w-5 h-5" style={{ color: "#44474c" }} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white">
              <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "#E7E8EB" }}>
                <span className="text-lg font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1B2A" }}>PackOps</span>
              </div>
              <nav className="px-3 pt-4 space-y-0.5">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-black text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1B2A" }}>PackOps</span>

          {/* Dashboard top nav (desktop) */}
          <Link href="/quote">
            <button className="flex items-center gap-1 text-xs font-bold px-4 py-2 rounded hover:opacity-90" style={{ background: "#E8A838", color: "#0D1B2A" }}>
              <MS icon="add" className="text-sm" /> New Order
            </button>
          </Link>
        </header>

        {/* Desktop top nav links */}
        <div className="hidden md:flex items-center gap-6 px-8 py-3 bg-white border-b" style={{ borderColor: "#E7E8EB" }}>
          {[
            { href: "/dashboard", label: "OVERVIEW" },
            { href: "/products", label: "PRODUCTS" },
            { href: "/", label: "HOW IT WORKS" },
            { href: "/industries", label: "INDUSTRIES" },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <span
                className="text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                style={{ color: location === item.href ? "#E8A838" : "#74777d", textDecoration: location === item.href ? "underline" : "none", textUnderlineOffset: "4px" }}>
                {item.label}
              </span>
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#74777d" }}>LOGIN</span>
            </Link>
            <Link href="/quote">
              <button className="flex items-center gap-1 text-xs font-bold px-5 py-2 rounded border-2 hover:opacity-90 transition-all" style={{ borderColor: "#1B6CA8", color: "#1B6CA8" }}>
                GET QUOTE
              </button>
            </Link>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
