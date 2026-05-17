import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const token = localStorage.getItem("packwerk_access_token");
  const isFirstLogin = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("packwerk_user") || "{}");
      return !!u.must_change_password;
    } catch { return false; }
  })();

  useEffect(() => {
    if (!token) setLocation("/login");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match", description: "Please re-enter your new password." });
      return;
    }
    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "At least 8 characters required." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: isFirstLogin ? undefined : currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: data.error || "Failed to change password." });
        return;
      }
      // Update local user data to clear must_change_password flag
      try {
        const user = JSON.parse(localStorage.getItem("packwerk_user") || "{}");
        user.must_change_password = false;
        localStorage.setItem("packwerk_user", JSON.stringify(user));
      } catch {}

      toast({ title: "Password updated!", description: "You're all set. Redirecting to your dashboard…" });
      setTimeout(() => setLocation("/dashboard"), 1500);
    } catch {
      toast({ variant: "destructive", title: "Something went wrong", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E8F0F8] mb-4">
            <Lock className="w-8 h-8 text-[#1B6CA8]" />
          </div>
          <h1 className="text-3xl font-bold text-[#0D1B2A] tracking-tight mb-2">
            {isFirstLogin ? "Set Your Password" : "Change Password"}
          </h1>
          <p className="text-[#64748B]">
            {isFirstLogin
              ? "Welcome to Packworkz! Please set a new password to secure your account."
              : "Enter your current and new password below."}
          </p>
        </div>

        {isFirstLogin && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 items-start">
            <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              Your account was created with a temporary password. You must set a new password before using your account.
            </p>
          </div>
        )}

        <Card className="border-[#E2EAF4] shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">{isFirstLogin ? "Create Password" : "Change Password"}</CardTitle>
            <CardDescription>
              {isFirstLogin ? "Choose a strong password you'll remember." : "Use at least 8 characters."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isFirstLogin && (
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input
                    id="current"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="h-12 bg-surface"
                    placeholder="Your current password"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input
                  id="new"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="h-12 bg-surface"
                  placeholder="Min. 8 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="h-12 bg-surface"
                  placeholder="Repeat new password"
                />
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-500 font-medium">Passwords don't match</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#0D1B2A] text-white hover:bg-[#1B6CA8] font-bold text-lg transition-colors"
                disabled={loading || (!!newPassword && !!confirmPassword && newPassword !== confirmPassword)}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {isFirstLogin ? "Set Password & Continue" : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
