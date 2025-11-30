
"use client";

import withAuth from "@/components/auth/with-auth";
import { AdminSidebar, MobileAdminHeader } from "@/components/admin/admin-sidebar";

function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <MobileAdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default withAuth(AdminLayout, ['admin']);
