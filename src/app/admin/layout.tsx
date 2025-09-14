
"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import useBrandStore from "@/stores/brand-store";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { selectedBrand } = useBrandStore();
  const canEdit = selectedBrand !== 'All Brands';

  // We need to know the state of the sidebar to adjust the main content
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AdminSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div 
        className={cn(
            "flex flex-col sm:gap-4 sm:py-4 transition-[margin-left] duration-300 ease-in-out",
            isSidebarCollapsed ? "sm:pl-14" : "sm:pl-60"
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <div className="relative flex-1 md:grow-0">
             {/* Can be used for breadcrumbs or page titles */}
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
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </div>
    </div>
  );
}
