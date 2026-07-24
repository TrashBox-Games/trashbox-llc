"use client";

import { type FormEvent, useEffect, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { LeadDetail } from "@/components/features/portal/leads/LeadDetail";
import { LeadInboxCard } from "@/components/features/portal/leads/LeadInboxCard";
import { LeadInboxFilters } from "@/components/features/portal/leads/LeadInboxFilters";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leadStatusOf } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePortal, type PortalTab } from "@/lib/portal";
import { PORTAL_PATHS } from "@/lib/sites";
import { cn } from "@/lib/utils";

type AuthMode = "signIn" | "signUp" | "confirm";

function redirect(path: string) {
  window.location.assign(path);
}

export function PortalLoginPage() {
  const auth = useAuth();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (auth.status === "signedIn") {
      redirect(PORTAL_PATHS.inbox);
    }
  }, [auth.status]);

  async function onAuthSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);

    if (mode === "signUp" && password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    setAuthBusy(true);
    try {
      if (mode === "signIn") {
        await auth.signInWithPassword(email, password);
      } else if (mode === "signUp") {
        const next = await auth.signUpWithPassword(email, password);
        if (next === "confirm") setMode("confirm");
      } else {
        await auth.confirmSignUpCode(email, code);
        await auth.signInWithPassword(email, password);
        setMode("signIn");
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthBusy(false);
    }
  }

  if (!auth.configured) {
    return (
      <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`,
        and `NEXT_PUBLIC_COGNITO_CLIENT_ID` then rebuild.
      </p>
    );
  }

  const sessionPending = auth.status === "loading" || auth.status === "signedIn";

  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">Login</p>
        <h1 className="max-w-3xl font-headline text-4xl font-bold tracking-tighter text-white md:text-6xl">
          Sign in to your inbox.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
          Manage submissions, API keys, and billing for your Form API account.
        </p>
      </FadeIn>

      {sessionPending ? (
        <div className="mt-14">
          <PortalSkeleton variant="login" />
        </div>
      ) : (
      <FadeIn className="mx-auto mt-14 max-w-xl space-y-10" y={12}>
        <form className="space-y-10" onSubmit={onAuthSubmit}>
          <div className="flex gap-6">
            {(
              [
                ["signIn", "Sign in"],
                ["signUp", "Sign up"],
                ["confirm", "Confirm"],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                type="button"
                variant="ghost"
                className={cn(
                  "h-auto px-0 py-0 font-label text-[10px] tracking-widest",
                  mode === id ? "text-white" : "text-outline hover:text-white",
                )}
                onClick={() => {
                  setMode(id);
                  setAuthError(null);
                }}
              >
                {label}
              </Button>
            ))}
          </div>

          <div>
            <Label htmlFor="portal-email">Email</Label>
            <Input
              id="portal-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@business.com"
            />
          </div>

          {mode !== "confirm" && (
            <div>
              <Label htmlFor="portal-password">Password</Label>
              <Input
                id="portal-password"
                type="password"
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === "signUp" && (
            <div>
              <Label htmlFor="portal-confirm-password">Confirm password</Label>
              <Input
                id="portal-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === "confirm" && (
            <div>
              <Label htmlFor="portal-code">Verification code</Label>
              <Input
                id="portal-code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
              <Button
                type="button"
                variant="link"
                className="mt-4 h-auto px-0 py-0 font-label text-[10px]"
                onClick={async () => {
                  setAuthError(null);
                  try {
                    await auth.resendCode(email);
                  } catch (err) {
                    setAuthError(
                      err instanceof Error ? err.message : "Could not resend code",
                    );
                  }
                }}
              >
                Resend code
              </Button>
            </div>
          )}

          {authError && <p className="text-sm text-red-300">{authError}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={authBusy}>
            {authBusy
              ? "Working…"
              : mode === "signIn"
                ? "Sign in"
                : mode === "signUp"
                  ? "Create account"
                  : "Confirm & sign in"}
          </Button>
        </form>
      </FadeIn>
      )}
    </div>
  );
}

interface PortalAppProps {
  tab: PortalTab;
}

export function PortalApp({ tab }: PortalAppProps) {
  const auth = useAuth();
  const portal = usePortal();

  if (!auth.configured) {
    return (
      <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`,
        and `NEXT_PUBLIC_COGNITO_CLIENT_ID` then rebuild.
      </p>
    );
  }

  const tabMeta =
    tab === "inbox"
      ? {
          eyebrow: "Inbox",
          title: (
            <>
              Lead <span className="text-outline">Inbox.</span>
            </>
          ),
        }
      : {
          eyebrow: "Membership",
          title: (
            <>
              Plan & <span className="text-outline">Billing.</span>
            </>
          ),
        };

  const contentPending =
    auth.status === "loading" || auth.status === "signedOut" || !portal.ready;

  return (
    <div className="space-y-10">
      <header>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          {tabMeta.eyebrow}
        </p>
        <h1 className="max-w-4xl font-headline text-4xl font-bold leading-tight tracking-tighter text-white md:text-6xl">
          {tabMeta.title}
        </h1>
      </header>

      {contentPending ? (
        <PortalSkeleton variant={tab} />
      ) : (
        <>
      {tab === "inbox" && (
        <div className="border-b border-outline-variant/10 pb-6">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Signed in
          </p>
          <p className="mt-1 text-white">{auth.email}</p>
          {portal.clientName && (
            <p className="mt-1 text-sm text-on-surface-variant">
              Client: {portal.clientName}
            </p>
          )}
          {portal.account?.linked && portal.account.tier && (
            <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-outline">
              Plan: <span className="text-white">{portal.account.tier}</span>
              {!portal.account.active ? " · inactive" : ""}
              {typeof portal.account.emailsUsed === "number" &&
                typeof portal.account.emailLimit === "number" && (
                  <>
                    {" "}
                    · Usage:{" "}
                    <span className="text-white">
                      {portal.account.emailsUsed.toLocaleString()} /{" "}
                      {portal.account.emailLimit.toLocaleString()}
                    </span>{" "}
                    emails
                  </>
                )}
            </p>
          )}
        </div>
      )}

      {tab === "inbox" && portal.billingNotice && (
        <p className="border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
          {portal.billingNotice}
        </p>
      )}

      {portal.account && !portal.account.linked && (
        <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Get started
          </p>
          <h2 className="mt-3 font-headline text-2xl font-bold text-white md:text-3xl">
            Create Form API account
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            No Form API account is linked to {portal.account.email || "your login"} yet. Create one now
            (no payment required). You can add a paid plan anytime after.
          </p>
          <div className="mt-8 max-w-md">
            <Label htmlFor="business-name">Business name</Label>
            <Input
              id="business-name"
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
              {portal.billingBusy ? "Creating…" : "Create account"}
            </Button>
          </div>
          {portal.billingError && (
            <p className="mt-4 text-sm text-red-300">{portal.billingError}</p>
          )}
        </section>
      )}

      {tab === "membership" &&
        portal.account?.linked &&
        portal.account.role === "owner" && (
        <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Subscription
          </p>
          <h2 className="mt-3 font-headline text-2xl font-bold text-white md:text-3xl">
            {portal.account.hasBilling
              ? portal.account.tier === "premium"
                ? "Premium"
                : "Basic"
              : "No paid plan yet"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            {portal.account.hasBilling
              ? portal.account.tier === "premium"
                ? "Premium includes up to 5 team seats, email alerts to opted-in teammates, and confirmation emails to form submitters."
                : "Basic includes 1 team seat (you) and email alerts to opted-in teammates. Upgrade to Premium for 5 seats and submitter confirmations."
              : "Your Form API account is ready. Add a Stripe plan when you want paid Basic or Premium billing."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {!portal.account.hasBilling && (
              <>
                <Button
                  type="button"
                  disabled={portal.billingBusy}
                  onClick={() => void portal.onUpgrade("premium")}
                >
                  {portal.billingBusy ? "Redirecting…" : "Add Premium plan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={portal.billingBusy}
                  onClick={() => void portal.onUpgrade("basic")}
                >
                  {portal.billingBusy ? "Redirecting…" : "Add Basic plan"}
                </Button>
              </>
            )}
            {portal.account.hasBilling && portal.account.tier !== "premium" && (
              <Button
                type="button"
                disabled={portal.billingBusy}
                onClick={() => void portal.onUpgrade("premium")}
              >
                {portal.billingBusy ? "Redirecting…" : "Upgrade to Premium"}
              </Button>
            )}
            {portal.account.hasBilling && (
              <Button
                type="button"
                variant="outline"
                disabled={portal.billingBusy}
                onClick={() => void portal.onManageBilling()}
              >
                {portal.billingBusy ? "Redirecting…" : "Manage subscription"}
              </Button>
            )}
          </div>
          {portal.billingError && (
            <p className="mt-4 text-sm text-red-300">{portal.billingError}</p>
          )}
        </section>
      )}

      {tab === "inbox" && (
        <>
          {portal.account?.linked && (
            <LeadInboxFilters
              value={portal.filters}
              members={portal.members}
              onChange={portal.setFilters}
              onApply={portal.applyFilters}
            />
          )}

          {portal.listError &&
            portal.listError !== "No Form API account for this email" && (
            <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
              {portal.listError}
            </p>
          )}

          {portal.listBusy &&
            portal.items.length === 0 &&
            portal.account?.linked && (
            <p className="font-label text-xs uppercase tracking-widest text-outline">
              Loading…
            </p>
          )}

          {!portal.listBusy &&
            !portal.listError &&
            portal.items.length === 0 &&
            portal.account?.linked && (
            <p className="text-on-surface-variant">No leads match these filters.</p>
          )}

          {portal.items.length > 0 && (
            <div className="space-y-8">
              <section>
                <p className="mb-4 font-label text-[10px] uppercase tracking-widest text-outline">
                  Recent activity
                </p>
                <ul className="flex snap-x gap-4 overflow-x-auto pb-4">
                  {portal.items.map((item) => {
                    const active = item.submissionId === portal.selectedId;
                    return (
                      <li key={item.submissionId} className="flex">
                        <LeadInboxCard
                          variant="activity"
                          senderName={item.senderName}
                          senderEmail={item.senderEmail}
                          message={item.message}
                          submittedAt={item.submittedAt}
                          status={leadStatusOf(item)}
                          active={active}
                          replyCount={item.messageCount ?? 0}
                          assignedTo={item.assignedTo}
                          onSelect={() =>
                            portal.setSelectedId(item.submissionId)
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>

              <div className="rounded bg-surface-container-low p-6 md:p-10">
                {portal.selected ? (
                  <LeadDetail
                    submission={portal.selected}
                    members={portal.members}
                    busy={portal.crmBusy}
                    mailboxConnected={Boolean(portal.mailbox?.connected)}
                    fromAddress={portal.mailbox?.email}
                    fromOptions={portal.mailbox?.fromOptions}
                    messages={portal.leadMessages}
                    messageError={portal.messageError}
                    onUpdate={portal.onLeadUpdate}
                    onAddNote={portal.onLeadNote}
                    onSendMessage={portal.onSendLeadMessage}
                  />
                ) : (
                  <p className="text-on-surface-variant">Select a lead.</p>
                )}
              </div>
            </div>
          )}

          {portal.nextCursor && (
            <Button
              type="button"
              size="lg"
              className="max-w-xs"
              disabled={portal.listBusy}
              onClick={() => void portal.loadMore()}
            >
              {portal.listBusy ? "Loading…" : "Load more"}
            </Button>
          )}
        </>
      )}

      {tab === "membership" &&
        portal.account?.linked &&
        portal.account.role !== "owner" && (
        <p className="text-on-surface-variant">
          Only the account owner can manage billing.
        </p>
      )}
        </>
      )}
    </div>
  );
}
