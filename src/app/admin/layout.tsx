
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40 overflow-hidden">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background pl-2 pr-4 md:px-4">
        <div className="flex items-center gap-2 font-semibold">
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn("h-5 w-5 transition-transform", isSidebarCollapsed && "rotate-180")}
            >
                <path
                d="M1.5 2.49998V12.5C1.5 13.0523 1.94772 13.5 2.5 13.5H4M1.5 2.49998C1.5 1.9477 1.94772 1.5 2.5 1.5H12.5C13.0523 1.5 13.5 1.9477 13.5 2.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
            </svg>
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
              "flex-1 p-4 sm:px-6 sm:py-4 transition-[margin-left] duration-300 ease-in-out overflow-x-auto",
              isClient && (isSidebarCollapsed ? "md:ml-14" : "md:ml-60")
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
