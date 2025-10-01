
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your notification settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your notifications will be displayed here.</p>
        <p className="text-muted-foreground pt-4">This page is under construction.</p>
      </CardContent>
    </Card>
  );
}
