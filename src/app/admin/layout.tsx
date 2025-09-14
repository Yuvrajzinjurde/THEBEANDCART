
"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
