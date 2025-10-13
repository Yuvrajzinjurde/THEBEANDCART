
"use client";

import { AdminSidebar, MobileAdminHeader } from "./admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // By adding the `dark` class here, we scope the dark theme to the admin panel only.
    // The `grid` layout ensures the sidebar and main content are positioned correctly.
    <div className="dark grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <MobileAdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
