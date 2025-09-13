
"use client";

import withAuth from "@/components/auth/with-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md mt-10">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>Welcome, {user?.name || 'Admin'}!</p>
          <p>This is the protected admin area.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(AdminDashboardPage, ['admin']);
