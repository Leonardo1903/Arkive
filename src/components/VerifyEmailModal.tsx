"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { FormEvent } from "react";

type VerifyEmailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  onCodeChange: (value: string) => void;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onResend: () => void | Promise<void>;
};

export default function VerifyEmailModal({
  open,
  onOpenChange,
  code,
  onCodeChange,
  isSubmitting,
  error,
  onSubmit,
  onResend,
}: VerifyEmailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            Verify Your Email
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            We&apos;ve sent a verification code to your email
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6 mt-4">
          <div className="flex justify-center">
            <InputOTP
              id="verificationCode"
              maxLength={6}
              value={code}
              onChange={onCodeChange}
              autoFocus
            >
              <InputOTPGroup className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-10 h-12 text-center rounded-md border bg-card text-lg font-medium"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-default-500">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                onClick={onResend}
                className="text-primary hover:underline font-medium"
              >
                Resend code
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
