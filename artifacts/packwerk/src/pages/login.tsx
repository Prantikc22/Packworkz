import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data: any) => {
        localStorage.setItem("packwerk_access_token", data.access_token);
        // Merge must_change_password into user object so change-password page can read it
        localStorage.setItem("packwerk_user", JSON.stringify({
          ...data.user,
          must_change_password: !!data.must_change_password,
        }));
        if (data.must_change_password) {
          setLocation("/change-password");
        } else {
          setLocation("/dashboard");
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Wrong email or password. Need help? WhatsApp us.",
        });
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted">Sign in to manage your packaging orders</p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your email and password to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 bg-surface"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm font-medium text-blue hover:underline">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-12 bg-surface"
                />
              </div>
              
              <Button type="submit" className="w-full h-12 bg-navy text-white hover:bg-blue font-bold text-lg" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted">
              Don't have an account? Contact sales to create one.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
