
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2" />
          Users
        </CardTitle>
        <CardDescription>Manage user accounts and roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Users page is under construction.</p>
      </CardContent>
    </Card>
  );
}
