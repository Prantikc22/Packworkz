import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found | Packworkz";
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (robots) robots.content = "noindex, nofollow";
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            This page does not exist or may have moved.
          </p>
          <Link href="/products" className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:underline">
            Browse packaging products →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
