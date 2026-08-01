"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { AuthShell } from "@/components/features/portal/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { PORTAL_PATHS } from "@/lib/sites";

type Step = "request" | "confirm";

function redirect(path: string) {
  window.location.assign(path);
}

export function ForgotPasswordForm() {
  const auth = useAuth();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await auth.requestPasswordReset(email);
      setStep("confirm");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send reset code",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await auth.confirmForgotPassword(email, code, password);
      redirect(PORTAL_PATHS.login);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset password",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Password"
      title={step === "request" ? "Reset your password." : "Choose a new password."}
      description={
        step === "request"
          ? "We'll email you a code to reset your password."
          : `Enter the code sent to ${email || "your email"} and a new password.`
      }
    >
      {step === "request" ? (
        <form className="space-y-8" onSubmit={onRequest}>
          <div>
            <Label htmlFor="portal-reset-email">Email</Label>
            <Input
              id="portal-reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Working…" : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form className="space-y-8" onSubmit={onConfirm}>
          <div>
            <Label htmlFor="portal-reset-code">Reset code</Label>
            <Input
              id="portal-reset-code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </div>
          <div>
            <Label htmlFor="portal-reset-password">New password</Label>
            <Input
              id="portal-reset-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="portal-reset-confirm">Confirm new password</Label>
            <Input
              id="portal-reset-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Working…" : "Update password"}
          </Button>
        </form>
      )}

      <p className="text-on-surface-variant text-sm">
        Remembered it?{" "}
        <Link href={PORTAL_PATHS.login} className="text-white underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
