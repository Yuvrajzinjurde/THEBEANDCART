
"use client";

import Link from "next/link";
import { Bell, Menu, Settings, Store } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import useBrandStore from "@/stores/brand-store";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedBrand } = useBrandStore();
  const canEdit = selectedBrand !== 'All Brands';

  return (
    <div className="grid min-h-screen w-full grid-cols-[auto_1fr] bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/admin/dashboard" className="hidden items-center gap-2 font-semibold md:flex">
            <Store className="h-6 w-6" />
            <span className="font-bold">Admin Panel</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="hidden md:flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-card">
                <span className="font-semibold text-sm">{selectedBrand}</span>
                <Button variant="ghost" size="icon" className="rounded-full h-7 w-7" disabled={!canEdit} asChild>
                    <Link href={canEdit ? `/admin/brands/edit/${selectedBrand.toLowerCase()}` : '#'}>
                        <Settings className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="w-px h-6 bg-border hidden md:block" />
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
