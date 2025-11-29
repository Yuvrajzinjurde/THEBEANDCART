
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CreditCard, Settings, LogOut, Package, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import withAuth from "@/components/auth/with-auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const sidebarNavItems = [
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/orders", icon: Package, label: "Orders" },
  { href: "/dashboard/addresses", icon: MapPin, label: "Addresses" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="container grid flex-1 w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-6 py-8 px-4">
        <aside className="hidden md:flex flex-col w-full">
            <div className="sticky top-24 flex flex-col h-[calc(100vh-8rem)]">
                <nav className="flex flex-col gap-2 p-4 border rounded-lg bg-background">
                  {sidebarNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname.startsWith(item.href) && "bg-muted text-primary font-semibold"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-4 border rounded-lg bg-background">
                   <Button
                      variant="ghost"
                      onClick={logout}
                      className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                  </Button>
                </div>
            </div>
        </aside>
        <main className="flex-1 p-0 overflow-y-auto">
            {children}
        </main>
    </div>
  );
}

export default withAuth(DashboardLayout, ['user', 'admin']);
