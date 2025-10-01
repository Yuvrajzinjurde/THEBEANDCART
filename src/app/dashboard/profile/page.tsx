
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>View and manage your personal information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {(user as any)?.email || 'Not available'}</p>
        <p className="text-muted-foreground pt-4">Profile editing is coming soon!</p>
      </CardContent>
    </Card>
  );
}
