"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, Mail, Eye, EyeOff } from "lucide-react";
import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { useRouter } from 'next/navigation';
import { useAuth } from '@workos-inc/authkit-nextjs/components';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Signed in successfully! Redirecting...");
        // Refresh the page to update auth state
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setError(data.error || 'Sign in failed');
      }
    } catch (error) {
      console.error("Email sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const url = await getSignInUrl({
        provider: 'google',
        returnPathname: '/dashboard'
      });
      window.location.href = url;
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("Google sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      const url = await getSignInUrl({
        provider: 'github',
        returnPathname: '/dashboard'
      });
      window.location.href = url;
    } catch (error) {
      console.error("GitHub sign in error:", error);
      setError("GitHub sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in to your account to access personalized features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Providers */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Mail className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGitHubSignIn}
              disabled={isLoading}
            >
              <Github className="h-4 w-4 mr-2" />
              Continue with GitHub
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <div>
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </div>
            <div>
              <a href="/auth/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


