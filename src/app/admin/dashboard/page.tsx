
"use client";

import withAuth from "@/components/auth/with-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>Welcome, {user?.name || 'Admin'}!</p>
          <p>This is the protected admin area.</p>
          <Button onClick={logout} className="w-full">
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(AdminDashboardPage, ['admin']);
