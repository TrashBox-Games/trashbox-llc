"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { AuthShell } from "@/components/features/portal/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  pendingConfirmPath,
  setPendingSignupPassword,
} from "@/lib/portal-auth";
import { PORTAL_PATHS } from "@/lib/sites";

function redirect(path: string) {
  window.location.assign(path);
}

export function SignupForm() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      const next = await auth.signUpWithPassword(email, password);
      if (next === "confirm") {
        setPendingSignupPassword(email, password);
        redirect(pendingConfirmPath(email));
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Sign up"
      title="Create your account."
      description="Start with a login. You can create an organization when you're ready."
    >
      <form className="space-y-8" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="portal-signup-email">Email</Label>
          <Input
            id="portal-signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <Label htmlFor="portal-signup-password">Password</Label>
          <Input
            id="portal-signup-password"
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
          <Label htmlFor="portal-signup-confirm">Confirm password</Label>
          <Input
            id="portal-signup-confirm"
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
          {busy ? "Working…" : "Create account"}
        </Button>
      </form>

      <p className="text-on-surface-variant text-sm">
        Already have an account?{" "}
        <Link href={PORTAL_PATHS.login} className="text-white underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
