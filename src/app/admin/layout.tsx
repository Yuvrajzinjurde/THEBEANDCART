
"use client";

import { AdminSidebar, MobileAdminHeader } from "@/components/admin/admin-sidebar";
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
    <div className="flex w-full bg-muted/40 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">
        <MobileAdminHeader />
        <div className="flex-1 p-4 sm:p-6">
            {children}
        </div>
      </main>
    </div>
  );
}
