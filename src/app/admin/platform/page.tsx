
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";

export default function PlatformSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Home />
            Platform Settings
        </CardTitle>
        <CardDescription>
          Manage the content and appearance of the main public-facing landing page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Platform settings page is under construction.</p>
      </CardContent>
    </Card>
  );
}
