"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, XCircle } from "lucide-react";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResendEmail?: () => void;
}

export function EmailVerificationDialog({ 
  isOpen, 
  onClose, 
  email, 
  onResendEmail 
}: EmailVerificationDialogProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // In a real implementation, you would call an API to resend the verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResendSuccess(true);
      if (onResendEmail) {
        onResendEmail();
      }
    } catch (error) {
      console.error("Failed to resend email:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setResendSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Check Your Email
          </DialogTitle>
          <DialogDescription>
            We've sent a verification link to your email address
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              We've sent a verification link to:
            </p>
            <p className="font-medium text-foreground">{email}</p>
          </div>

          {resendSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Verification email has been resent successfully!
              </span>
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">To complete your registration:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return to sign in to your account</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleResendEmail}
                disabled={isResending}
                className="flex-1"
              >
                {isResending ? "Sending..." : "Resend Email"}
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Got It
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or try resending.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
