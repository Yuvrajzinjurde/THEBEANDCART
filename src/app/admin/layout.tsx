
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          {user && <Button onClick={logout} variant="outline" size="sm">Log Out</Button>}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
