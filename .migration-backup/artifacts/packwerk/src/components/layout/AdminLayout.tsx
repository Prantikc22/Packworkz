import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, PaintBucket, FileText, LogOut, Menu, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { setExtraHeader } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/admin/quotes", label: "Quotes", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/designs", label: "Designs", icon: PaintBucket },
  { href: "/admin/samples", label: "Samples", icon: FileText },
  { href: "/admin/users", label: "Clients", icon: Users },
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
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive
                ? "bg-[#0D1B2A] text-white"
                : "text-[#64748B] hover:bg-[#F8F9FC] hover:text-[#0D1B2A]"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E2EAF4] fixed inset-y-0 z-10">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
            Packwerk Admin
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-[#E2EAF4]">
          <Button
            variant="ghost"
            className="w-full justify-start text-[#64748B] hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Admin Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-[#E2EAF4] h-16 flex items-center px-4 justify-between md:justify-end sticky top-0 z-20">
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6">
                  <Link href="/" className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
                    Packwerk Admin
                  </Link>
                </div>
                <nav className="px-4 space-y-1 mt-4">
                  <NavLinks />
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E2EAF4]">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#64748B] hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Admin Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <span className="ml-4 font-bold text-[#0D1B2A]">Packwerk Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
