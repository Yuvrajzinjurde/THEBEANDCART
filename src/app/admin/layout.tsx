
"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Settings } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import useBrandStore from "@/stores/brand-store";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { selectedBrand } = useBrandStore();
  const canEdit = selectedBrand !== 'All Brands';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
           <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6" />
            <span className="">Admin Panel</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-card">
              <span className="font-semibold text-sm">{selectedBrand}</span>
              <Button variant="ghost" size="icon" className="rounded-full h-7 w-7" disabled={!canEdit} asChild>
                  <Link href={canEdit ? `/admin/brands/edit/${selectedBrand.toLowerCase()}` : '#'}>
                      <Settings className="h-4 w-4" />
                  </Link>
              </Button>
          </div>
          <div className="w-px h-6 bg-border" />
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          {user && <UserNav />}
        </div>
      </header>
      <div className="flex flex-1">
        <AdminSidebar isCollapsed={isSidebarCollapsed} onCollapseChange={setIsSidebarCollapsed} />
        <main 
          className={cn(
              "flex-1 p-4 sm:px-6 sm:py-4 transition-[margin-left] duration-300 ease-in-out",
              isClient && (isSidebarCollapsed ? "md:ml-14" : "md:ml-60")
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
