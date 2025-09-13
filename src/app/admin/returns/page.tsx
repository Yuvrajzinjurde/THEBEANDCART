
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GitCommitHorizontal } from "lucide-react";

export default function ReturnsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GitCommitHorizontal className="mr-2" />
          Returns & Exchanges
        </CardTitle>
        <CardDescription>Process and manage returns or exchanges.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Returns & Exchanges page is under construction.</p>
      </CardContent>
    </Card>
  );
}
