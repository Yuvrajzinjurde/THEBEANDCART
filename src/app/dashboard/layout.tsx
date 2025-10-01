
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CreditCard, Settings, LogOut, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import withAuth from "@/components/auth/with-auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const sidebarNavItems = [
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/orders", icon: Package, label: "Orders" },
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
    <div className="flex w-full bg-muted/40 min-h-screen">
      <div className="container grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 py-8">
        <aside className="md:sticky top-24 h-fit border-r pr-6">
          <nav className="flex flex-col gap-2">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary font-semibold"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-t mt-2 pt-2">
               <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
              </Button>
            </div>
          </nav>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default withAuth(DashboardLayout, ['user', 'admin']);
