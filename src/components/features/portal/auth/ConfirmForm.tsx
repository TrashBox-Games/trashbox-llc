"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { AuthShell } from "@/components/features/portal/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  clearPendingSignupPassword,
  getPendingSignupPassword,
} from "@/lib/portal-auth";
import { PORTAL_PATHS } from "@/lib/sites";

function redirect(path: string) {
  window.location.assign(path);
}

function emailFromSearch(): string {
  if (typeof window === "undefined") return "";
  return (
    new URLSearchParams(window.location.search).get("email")?.trim() || ""
  );
}

export function ConfirmForm() {
  const auth = useAuth();
  const initialEmail = useMemo(() => emailFromSearch(), []);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await auth.confirmSignUpCode(email, code);
      const pendingPassword = getPendingSignupPassword(email);
      clearPendingSignupPassword();
      if (pendingPassword) {
        await auth.signInWithPassword(email, pendingPassword);
        redirect(PORTAL_PATHS.home);
        return;
      }
      redirect(PORTAL_PATHS.login);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Confirmation failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Confirm"
      title="Verify your email."
      description="Enter the code we sent you to finish creating your account."
    >
      <form className="space-y-8" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="portal-confirm-email">Email</Label>
          <Input
            id="portal-confirm-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <Label htmlFor="portal-confirm-code">Verification code</Label>
          <Input
            id="portal-confirm-code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
          />
          <Button
            type="button"
            variant="link"
            className="font-label mt-4 h-auto px-0 py-0 text-[10px]"
            onClick={async () => {
              setError(null);
              try {
                await auth.resendCode(email);
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Could not resend code",
                );
              }
            }}
          >
            Resend code
          </Button>
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Working…" : "Confirm email"}
        </Button>
      </form>

      <p className="text-on-surface-variant text-sm">
        Wrong account?{" "}
        <Link href={PORTAL_PATHS.signup} className="text-white underline">
          Sign up again
        </Link>{" "}
        or{" "}
        <Link href={PORTAL_PATHS.login} className="text-white underline">
          sign in
        </Link>
      </p>
    </AuthShell>
  );
}
