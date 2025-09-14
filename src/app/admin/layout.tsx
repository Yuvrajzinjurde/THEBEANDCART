
"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    document.documentElement.classList.add('theme-admin');
    return () => {
      document.documentElement.classList.remove('theme-admin');
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
