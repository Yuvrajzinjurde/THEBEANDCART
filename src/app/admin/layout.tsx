
"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import useBrandStore from "@/stores/brand-store";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4h-5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M10 4v16"/><path d="M4 12h6"/></svg>
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <Link href="/admin/dashboard">
            <span className="font-bold">Admin Panel</span>
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
