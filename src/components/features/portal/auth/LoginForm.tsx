"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/features/portal/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  emailFromSearchString,
  portalSignupPath,
} from "@/lib/portal-auth";
import { PORTAL_PATHS } from "@/lib/sites";

export function LoginForm() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fromQuery = emailFromSearchString(window.location.search);
    if (fromQuery) setEmail(fromQuery);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await auth.signInWithPassword(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Login"
      title="Sign in to your portal."
      description="Manage organizations, projects, and Form API inboxes."
    >
      <form className="space-y-8" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="portal-email">Email</Label>
          <Input
            id="portal-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <Label htmlFor="portal-password">Password</Label>
            <Link
              href={PORTAL_PATHS.forgotPassword}
              className="font-label text-outline hover:text-white text-[10px] tracking-widest uppercase"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="portal-password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Working…" : "Sign in"}
        </Button>
      </form>

      <p className="text-on-surface-variant text-sm">
        Don&apos;t have an account?{" "}
        <Link href={portalSignupPath(email)} className="text-white underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
