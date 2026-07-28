"use client";

import { type FormEvent, useEffect, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { LeadDetail } from "@/components/features/portal/leads/LeadDetail";
import {
  INBOX_SIDEBAR_SNAP_WIDTH,
  LeadInboxResizeHandle,
  LeadInboxSidebar,
  LeadInboxSidebarToggle,
} from "@/components/features/portal/leads/LeadInboxSidebar";
import { LeadThreadTabs } from "@/components/features/portal/leads/LeadThreadTabs";
import {
  closeLeadTab,
  loadLeadThreadTabs,
  openLeadTab,
  saveLeadThreadTabs,
} from "@/components/features/portal/leads/lead-thread-tabs";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      setAuthError(
        err instanceof Error ? err.message : "Authentication failed",
      );
    } finally {
      setAuthBusy(false);
    }
  }

  if (!auth.configured) {
    return (
      <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-6">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`,
        `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_CLIENT_ID`
        then rebuild.
      </p>
    );
  }

  const sessionPending =
    auth.status === "loading" || auth.status === "signedIn";

  return (
    <div>
      <FadeIn>
        <p className="font-label text-outline mb-6 text-xs tracking-[0.4em] uppercase">
          Login
        </p>
        <h1 className="font-headline max-w-3xl text-4xl font-bold tracking-tighter text-white md:text-6xl">
          Sign in to your inbox.
        </h1>
        <p className="text-on-surface-variant mt-6 max-w-xl text-lg">
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
                    "font-label h-auto px-0 py-0 text-[10px] tracking-widest",
                    mode === id
                      ? "text-white"
                      : "text-outline hover:text-white",
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
                  autoComplete={
                    mode === "signIn" ? "current-password" : "new-password"
                  }
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
                <Label htmlFor="portal-confirm-password">
                  Confirm password
                </Label>
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
                  className="font-label mt-4 h-auto px-0 py-0 text-[10px]"
                  onClick={async () => {
                    setAuthError(null);
                    try {
                      await auth.resendCode(email);
                    } catch (err) {
                      setAuthError(
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
            )}

            {authError && <p className="text-sm text-red-300">{authError}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={authBusy}
            >
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
  const [inboxSidebarOpen, setInboxSidebarOpen] = useState(true);
  const [inboxSidebarWidth, setInboxSidebarWidth] = useState(
    INBOX_SIDEBAR_SNAP_WIDTH,
  );
  const [inboxResizing, setInboxResizing] = useState(false);
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [tabsReady, setTabsReady] = useState(false);

  useEffect(() => {
    if (!portal.ready) return;
    const stored = loadLeadThreadTabs();
    if (stored.openTabIds.length > 0) {
      setOpenTabIds(stored.openTabIds);
      portal.setSelectedId(stored.activeId);
    }
    setTabsReady(true);
  }, [portal.ready, portal.setSelectedId]);

  useEffect(() => {
    if (!tabsReady || !portal.ready) return;
    saveLeadThreadTabs({
      openTabIds,
      activeId: portal.selectedId,
    });
  }, [openTabIds, portal.selectedId, portal.ready, tabsReady]);

  function onInboxSidebarOpenChange(next: boolean) {
    if (next) setInboxSidebarWidth(INBOX_SIDEBAR_SNAP_WIDTH);
    setInboxSidebarOpen(next);
  }

  function openLead(id: string) {
    setOpenTabIds((ids) => {
      let next = ids;
      if (portal.selectedId) next = openLeadTab(next, portal.selectedId);
      return openLeadTab(next, id);
    });
    portal.setSelectedId(id);
  }

  function closeLead(id: string) {
    const sourceIds =
      openTabIds.length > 0
        ? openTabIds
        : portal.selectedId
          ? [portal.selectedId]
          : [];
    const result = closeLeadTab(sourceIds, portal.selectedId, id);
    setOpenTabIds(result.openTabIds);
    portal.setSelectedId(result.activeId);
  }

  const displayTabIds =
    openTabIds.length > 0
      ? openTabIds
      : portal.selectedId
        ? [portal.selectedId]
        : [];

  if (!auth.configured) {
    return (
      <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-6">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`,
        `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_CLIENT_ID`
        then rebuild.
      </p>
    );
  }

  const tabMeta =
    tab === "inbox"
      ? null
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
      {tabMeta && (
        <header>
          <p className="font-label text-outline mb-6 text-xs tracking-[0.4em] uppercase">
            {tabMeta.eyebrow}
          </p>
          <h1 className="font-headline max-w-4xl text-4xl leading-tight font-bold tracking-tighter text-white md:text-6xl">
            {tabMeta.title}
          </h1>
        </header>
      )}

      {contentPending ? (
        <PortalSkeleton variant={tab} />
      ) : (
        <>
          {tab === "inbox" && portal.billingNotice && (
            <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-4 text-sm">
              {portal.billingNotice}
            </p>
          )}

          {portal.account && !portal.account.linked && (
            <section className="border-outline-variant/10 bg-surface-container-low border p-6 md:p-8">
              <p className="font-label text-outline text-[10px] tracking-widest uppercase">
                Get started
              </p>
              <h2 className="font-headline mt-3 text-2xl font-bold text-white md:text-3xl">
                Create Form API account
              </h2>
              <p className="text-on-surface-variant mt-3 max-w-2xl text-sm leading-relaxed">
                No Form API account is linked to{" "}
                {portal.account.email || "your login"} yet. Create one now (no
                payment required). You can add a paid plan anytime after.
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
                <p className="mt-4 text-sm text-red-300">
                  {portal.billingError}
                </p>
              )}
            </section>
          )}

          {tab === "membership" &&
            portal.account?.linked &&
            portal.account.role === "owner" && (
              <section className="border-outline-variant/10 bg-surface-container-low border p-6 md:p-8">
                <p className="font-label text-outline text-[10px] tracking-widest uppercase">
                  Subscription
                </p>
                <h2 className="font-headline mt-3 text-2xl font-bold text-white md:text-3xl">
                  {portal.account.hasBilling
                    ? portal.account.tier === "premium"
                      ? "Premium"
                      : "Basic"
                    : "No paid plan yet"}
                </h2>
                <p className="text-on-surface-variant mt-3 max-w-2xl text-sm leading-relaxed">
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
                        {portal.billingBusy
                          ? "Redirecting…"
                          : "Add Premium plan"}
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
                  {portal.account.hasBilling &&
                    portal.account.tier !== "premium" && (
                      <Button
                        type="button"
                        disabled={portal.billingBusy}
                        onClick={() => void portal.onUpgrade("premium")}
                      >
                        {portal.billingBusy
                          ? "Redirecting…"
                          : "Upgrade to Premium"}
                      </Button>
                    )}
                  {portal.account.hasBilling && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={portal.billingBusy}
                      onClick={() => void portal.onManageBilling()}
                    >
                      {portal.billingBusy
                        ? "Redirecting…"
                        : "Manage subscription"}
                    </Button>
                  )}
                </div>
                {portal.billingError && (
                  <p className="mt-4 text-sm text-red-300">
                    {portal.billingError}
                  </p>
                )}
              </section>
            )}

          {tab === "inbox" && portal.account?.linked && (
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div
                className={cn(
                  "shrink-0",
                  inboxSidebarOpen &&
                    "lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:scrollbar-none",
                )}
              >
                <LeadInboxSidebar
                  open={inboxSidebarOpen}
                  onOpenChange={onInboxSidebarOpenChange}
                  filters={portal.filters}
                  members={portal.members}
                  onFiltersChange={portal.setFilters}
                  onApplyFilters={portal.applyFilters}
                  items={portal.items}
                  selectedId={portal.selectedId}
                  onSelect={openLead}
                  listBusy={portal.listBusy}
                  listError={portal.listError}
                  hasMore={Boolean(portal.nextCursor)}
                  onLoadMore={() => void portal.loadMore()}
                  width={inboxSidebarWidth}
                  resizing={inboxResizing}
                />
              </div>

              <div className="relative min-w-0 flex-1">
                {inboxSidebarOpen && (
                  <LeadInboxResizeHandle
                    width={inboxSidebarWidth}
                    onWidthChange={setInboxSidebarWidth}
                    onOpenChange={onInboxSidebarOpenChange}
                    onDraggingChange={setInboxResizing}
                    className="hidden lg:flex"
                  />
                )}
                {!inboxSidebarOpen && (
                  <div className="mb-4">
                    <LeadInboxSidebarToggle
                      open={false}
                      onOpenChange={onInboxSidebarOpenChange}
                    />
                  </div>
                )}
                {displayTabIds.length > 0 ? (
                  <div>
                    <LeadThreadTabs
                      tabs={displayTabIds.flatMap((id) => {
                        const item = portal.items.find(
                          (entry) => entry.submissionId === id,
                        );
                        if (!item) return [];
                        return [{ id, label: item.senderName }];
                      })}
                      activeId={portal.selectedId}
                      onSelect={openLead}
                      onClose={closeLead}
                    />
                    <div className="bg-surface-container-low rounded-lg rounded-tl-none p-6 md:p-10">
                      {displayTabIds.map((id) => {
                        const submission = portal.items.find(
                          (entry) => entry.submissionId === id,
                        );
                        if (!submission) return null;
                        const active = id === portal.selectedId;
                        return (
                          <div
                            key={id}
                            className={cn(!active && "hidden")}
                            aria-hidden={!active}
                          >
                            <LeadDetail
                              submission={submission}
                              members={portal.members}
                              busy={portal.crmBusy}
                              mailboxConnected={Boolean(
                                portal.mailbox?.connected,
                              )}
                              fromAddress={portal.mailbox?.email}
                              fromOptions={portal.mailbox?.fromOptions}
                              businessName={portal.clientName ?? undefined}
                              messages={
                                portal.messagesById[submission.submissionId] ??
                                []
                              }
                              messageError={
                                active ? portal.messageError : null
                              }
                              onUpdate={portal.onLeadUpdate}
                              onAddNote={portal.onLeadNote}
                              onSendMessage={portal.onSendLeadMessage}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container-low rounded-lg p-6 md:p-10">
                    <p className="text-on-surface-variant">Select a lead.</p>
                  </div>
                )}
              </div>
            </div>
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
