"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    // Simulate email verification process
    const verifyEmail = async () => {
      try {
        // In a real implementation, you would call your API to verify the token
        // For now, we'll simulate the process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now sign in to your account.');
      } catch (error) {
        setStatus('error');
        setMessage('Email verification failed. The link may have expired or is invalid.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleResendEmail = () => {
    // In a real implementation, you would call an API to resend the verification email
    setMessage('Verification email has been resent. Please check your inbox.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            {status === 'expired' && <Mail className="h-6 w-6 text-yellow-500" />}
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === 'loading' && "Verifying your email address..."}
            {status === 'success' && "Verification Complete"}
            {status === 'error' && "Verification Failed"}
            {status === 'expired' && "Link Expired"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={status === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                You can now sign in to your account and access all features.
              </div>
              <Button onClick={handleSignIn} className="w-full">
                Continue to Sign In
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                If you continue to have issues, please contact support.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleResendEmail} className="flex-1">
                  Resend Email
                </Button>
                <Button onClick={handleSignIn} className="flex-1">
                  Sign In
                </Button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                The verification link has expired. Please request a new one.
              </div>
              <Button onClick={handleResendEmail} className="w-full">
                Resend Verification Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
