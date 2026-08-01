"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";
import { PORTAL_PATHS } from "@/lib/sites";

export function PortalHome() {
  const auth = useAuth();
  const portal = usePortal();

  useEffect(() => {
    if (auth.status === "signedOut") {
      window.location.replace(PORTAL_PATHS.login);
    }
  }, [auth.status]);

  if (!auth.configured) {
    return (
      <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-6">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`,
        `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_CLIENT_ID`
        then rebuild.
      </p>
    );
  }

  const pending =
    auth.status === "loading" ||
    auth.status === "signedOut" ||
    !portal.ready;

  return (
    <div className="space-y-10">
      <FadeIn>
        <p className="font-label text-outline mb-6 text-xs tracking-[0.4em] uppercase">
          Home
        </p>
        <h1 className="font-headline max-w-4xl text-4xl leading-tight font-bold tracking-tighter text-white md:text-6xl">
          Your <span className="text-outline">portal.</span>
        </h1>
        <p className="text-on-surface-variant mt-6 max-w-xl text-lg">
          Organizations hold your team and billing. Projects hold each site&apos;s
          inbox and API key.
        </p>
      </FadeIn>

      {pending ? (
        <PortalSkeleton variant="membership" />
      ) : !portal.account?.linked ? (
        <FadeIn
          className="border-outline-variant/10 bg-surface-container-low border p-6 md:p-8"
          y={12}
        >
          <p className="font-label text-outline text-[10px] tracking-widest uppercase">
            Get started
          </p>
          <h2 className="font-headline mt-3 text-2xl font-bold text-white md:text-3xl">
            Create an organization
          </h2>
          <p className="text-on-surface-variant mt-3 max-w-2xl text-sm leading-relaxed">
            You&apos;re signed in as {portal.account?.email || auth.email || "your account"}.
            Create an organization when you&apos;re ready — no payment required.
            (For now this also creates your first project workspace.)
          </p>
          <div className="mt-8 max-w-md">
            <Label htmlFor="org-name">Organization name</Label>
            <Input
              id="org-name"
              type="text"
              required
              value={portal.businessName}
              onChange={(e) => portal.setBusinessName(e.target.value)}
              placeholder="Acme Inspections"
            />
          </div>
          <div className="mt-6">
            <Button
              type="button"
              disabled={portal.billingBusy || !portal.businessName.trim()}
              onClick={() => void portal.onProvisionAccount()}
            >
              {portal.billingBusy ? "Creating…" : "Create organization"}
            </Button>
          </div>
          {portal.billingError && (
            <p className="mt-4 text-sm text-red-300">{portal.billingError}</p>
          )}
        </FadeIn>
      ) : (
        <FadeIn
          className="border-outline-variant/10 bg-surface-container-low border p-6 md:p-8"
          y={12}
        >
          <p className="font-label text-outline text-[10px] tracking-widest uppercase">
            Workspace
          </p>
          <h2 className="font-headline mt-3 text-2xl font-bold text-white md:text-3xl">
            {portal.clientName || portal.account.clientName || "Your organization"}
          </h2>
          <p className="text-on-surface-variant mt-3 max-w-2xl text-sm leading-relaxed">
            Multi-project switching arrives next. For now this workspace is your
            organization and first project.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={PORTAL_PATHS.inbox}>Open inbox</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={PORTAL_PATHS.settings}>Settings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={PORTAL_PATHS.membership}>Membership</Link>
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
