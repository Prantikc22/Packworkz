import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { FileText, Inbox, LayoutDashboard, LogOut, Menu, Package, PaintBucket, ShieldCheck, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { setExtraHeader } from "@workspace/api-client-react";
import "@/pages/dashboard/dashboard.css";

const NAV_ITEMS = [
  { href: "/admin/quotes", label: "Quotes", Icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads & uploads", Icon: Inbox },
  { href: "/admin/orders", label: "Orders", Icon: Package },
  { href: "/admin/designs", label: "Designs", Icon: PaintBucket },
  { href: "/admin/samples", label: "Samples", Icon: FileText },
  { href: "/admin/users", label: "Clients", Icon: Users },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  // Inject admin key into every generated API hook request
  useEffect(() => {
    const key = localStorage.getItem("packwerk_admin_key") || "";
    setExtraHeader("x-admin-key", key || null);
    return () => { setExtraHeader("x-admin-key", null); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("packwerk_admin_key");
    setExtraHeader("x-admin-key", null);
    setLocation("/");
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = location.startsWith(href);
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
        <div className="dbl-sidebar-top"><Brand /><span className="adm-badge"><ShieldCheck size={12} /> Admin</span></div>
        <nav className="dbl-nav" aria-label="Admin"><NavLinks /></nav>
        <button type="button" className="dbl-signout" onClick={handleLogout}><LogOut size={17} /> Admin sign out</button>
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
                <button type="button" className="dbl-signout" onClick={handleLogout}><LogOut size={17} /> Admin sign out</button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="dbl-topbar-brand"><Brand /></div>
          <span className="adm-badge adm-topbar-badge"><ShieldCheck size={12} /> Admin console</span>
        </header>
        <main className="dbl-content">{children}</main>
      </div>
    </div>
  );
}
