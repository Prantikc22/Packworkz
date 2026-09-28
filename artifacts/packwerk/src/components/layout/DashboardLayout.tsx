import { Link, useLocation } from "wouter";
import { useLogout } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CreditCard, FileText, LayoutDashboard, LogOut, Menu, MessageCircle, Package, Palette, Plus, User } from "lucide-react";
import "@/pages/dashboard/dashboard.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", Icon: Package },
  { href: "/dashboard/quotes", label: "Quotes", Icon: FileText },
  { href: "/dashboard/designs", label: "Designs", Icon: Palette },
  { href: "/dashboard/payments", label: "Payments", Icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", Icon: User },
];

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("packwerk_user") || "{}");
  } catch {
    return {};
  }
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { mutate: logout } = useLogout();
  const user = getUserFromStorage();
  const displayName = user.contact_name || user.company_name || "Your account";
  const initials = getInitials(displayName);

  const clearSession = () => {
    localStorage.removeItem("packwerk_access_token");
    localStorage.removeItem("packwerk_user");
    setLocation("/login");
  };
  // Sign out locally even if the server call fails, so users are never stuck signed in.
  const handleLogout = () => logout(undefined, { onSuccess: clearSession, onError: clearSession });

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = href === "/dashboard" ? location === href : location.startsWith(href);
        return (
          <Link key={href} href={href} onClick={onClick} className={`dbl-nav-link${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </>
  );

  const Brand = () => (
    <Link href="/" className="dbl-brand" aria-label="Packworkz home"><span className="dbl-mark" aria-hidden="true"><i /><b /></span>Packworkz</Link>
  );

  return (
    <div className="dbl">
      <aside className="dbl-sidebar">
        <div className="dbl-sidebar-top"><Brand /></div>
        <Link href="/products" className="dbl-new"><Plus size={16} /> New order</Link>
        <nav className="dbl-nav" aria-label="Dashboard"><NavLinks /></nav>
        <a className="dbl-help" href="https://wa.me/918208990366" target="_blank" rel="noreferrer">
          <MessageCircle size={18} />
          <span><b>Need a hand?</b><small>WhatsApp your account team</small></span>
        </a>
        <div className="dbl-user">
          <span className="dbl-avatar">{initials}</span>
          <span className="dbl-user-text"><b>{displayName}</b><small>{user.company_name || user.email || "Customer"}</small></span>
          <button type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>

      <div className="dbl-main">
        <header className="dbl-topbar">
          <Sheet>
            <SheetTrigger asChild>
              <button className="dbl-menu" aria-label="Open menu"><Menu size={20} /></button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-white">
              <div className="dbl-sheet">
                <div className="dbl-sidebar-top"><Brand /></div>
                <nav className="dbl-nav"><NavLinks /></nav>
                <button type="button" className="dbl-signout" onClick={handleLogout}><LogOut size={17} /> Sign out</button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="dbl-topbar-brand"><Brand /></div>
          <nav className="dbl-topbar-links" aria-label="Site">
            <Link href="/products">Products</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/samples">Samples</Link>
            <Link href="/contact">Support</Link>
          </nav>
          <Link href="/products" className="db-btn is-amber is-sm dbl-topbar-cta"><Plus size={15} /> New order</Link>
        </header>
        <main className="dbl-content">{children}</main>
      </div>
    </div>
  );
}
