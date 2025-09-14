
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
      <main className="flex-1 flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
        {/* You can add a header here if needed, for things like breadcrumbs or page titles */}
        <div className="flex-1 p-4 sm:px-6 sm:py-0">
            {children}
        </div>
      </main>
    </div>
  );
}
