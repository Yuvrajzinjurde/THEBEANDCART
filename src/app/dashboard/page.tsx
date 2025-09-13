
"use client";

import withAuth from "@/components/auth/with-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

function UserDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">User Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>Welcome, {user?.name || 'User'}!</p>
          <p>This is the protected user area.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(UserDashboardPage, ['user', 'admin']);
