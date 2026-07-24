"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LeadInboxFiltersValue } from "@/components/features/portal/leads/LeadInboxFilters";
import {
  ApiError,
  acceptTeamInvite,
  addSubmissionNote,
  connectMailbox,
  disconnectMailbox,
  getAccount,
  getMailbox,
  getTeam,
  listLeadMessages,
  listSubmissions,
  openBillingPortal,
  provisionAccount,
  sendLeadMessage,
  startCheckout,
  syncMailbox,
  updateMailboxSettings,
  updateSubmission,
  type AccountResponse,
  type ClientRole,
  type LeadMessage,
  type LeadStatus,
  type LeadTag,
  type MailboxProvider,
  type MailboxStatusResponse,
  type PatchMailboxInput,
  type Permission,
  type Submission,
  type TeamMember,
  type TeamRole,
  hasPermission as permissionsInclude,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PORTAL_PATHS } from "@/lib/sites";

export type PortalTab = "inbox" | "membership";

/** One-time issued key for Settings → API Keys after provision. */
export const PORTAL_ISSUED_API_KEY_STORAGE = "portalIssuedApiKey";

const emptyFilters: LeadInboxFiltersValue = {
  q: "",
  status: "",
  tag: "",
  assignedTo: "",
};

/** Fill reply counts for inbox stacks without requiring each lead to be opened. */
async function fetchMessageCounts(
  items: Submission[],
): Promise<Map<string, number>> {
  const entries = await Promise.all(
    items.map(async (item) => {
      try {
        const res = await listLeadMessages(item.submissionId);
        return [item.submissionId, res.items.length] as const;
      } catch {
        return [item.submissionId, item.messageCount ?? 0] as const;
      }
    }),
  );
  return new Map(entries);
}

function mergeMessageCounts(
  items: Submission[],
  counts: Map<string, number>,
): Submission[] {
  return items.map((item) => {
    const messageCount = counts.get(item.submissionId);
    if (messageCount === undefined || messageCount === (item.messageCount ?? 0)) {
      return item;
    }
    return { ...item, messageCount };
  });
}

function redirect(path: string) {
  window.location.assign(path);
}

export interface PortalContextValue {
  ready: boolean;
  items: Submission[];
  clientName: string | null;
  account: AccountResponse | null;
  nextCursor: string | undefined;
  listError: string | null;
  listBusy: boolean;
  crmBusy: boolean;
  billingBusy: boolean;
  billingError: string | null;
  billingNotice: string | null;
  businessName: string;
  setBusinessName: (value: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selected: Submission | null;
  filters: LeadInboxFiltersValue;
  setFilters: (value: LeadInboxFiltersValue) => void;
  applyFilters: () => void;
  members: TeamMember[];
  teamRole: TeamRole;
  permissions: Permission[];
  roles: ClientRole[];
  isOwner: boolean;
  hasPermission: (permission: Permission) => boolean;
  mailbox: MailboxStatusResponse | null;
  mailboxBusy: boolean;
  mailboxError: string | null;
  mailboxNotice: string | null;
  leadMessages: LeadMessage[];
  messageError: string | null;
  loadMore: () => Promise<void>;
  onLeadUpdate: (patch: {
    status?: LeadStatus;
    tags?: LeadTag[];
    assignedTo?: string | null;
  }) => Promise<void>;
  onLeadNote: (body: string) => Promise<void>;
  onSendLeadMessage: (
    body: string,
    bodyHtml?: string,
    from?: { fromIdentityId?: string },
  ) => Promise<void>;
  onMailboxConnect: (provider: MailboxProvider) => Promise<void>;
  onMailboxDisconnect: () => Promise<void>;
  onMailboxSync: () => Promise<void>;
  onMailboxPatch: (input: PatchMailboxInput) => Promise<void>;
  onProvisionAccount: () => Promise<void>;
  onUpgrade: (plan: "basic" | "premium") => Promise<void>;
  onManageBilling: () => Promise<void>;
}

const PortalContext = createContext<PortalContextValue | null>(null);

const portalNoop = async () => {};

/** Side-effect-free portal context for Storybook/Chromatic (no login redirects). */
export function StubPortalProvider({
  value,
  children,
}: {
  value?: Partial<PortalContextValue>;
  children: ReactNode;
}) {
  const merged: PortalContextValue = {
    ready: false,
    items: [],
    clientName: null,
    account: null,
    nextCursor: undefined,
    listError: null,
    listBusy: false,
    crmBusy: false,
    billingBusy: false,
    billingError: null,
    billingNotice: null,
    businessName: "",
    setBusinessName: () => {},
    selectedId: null,
    setSelectedId: () => {},
    selected: null,
    filters: emptyFilters,
    setFilters: () => {},
    applyFilters: () => {},
    members: [],
    teamRole: "member",
    permissions: [],
    roles: [],
    isOwner: false,
    hasPermission: () => false,
    mailbox: null,
    mailboxBusy: false,
    mailboxError: null,
    mailboxNotice: null,
    leadMessages: [],
    messageError: null,
    loadMore: portalNoop,
    onLeadUpdate: portalNoop,
    onLeadNote: portalNoop,
    onSendLeadMessage: portalNoop,
    onMailboxConnect: portalNoop,
    onMailboxDisconnect: portalNoop,
    onMailboxSync: portalNoop,
    onMailboxPatch: portalNoop,
    onProvisionAccount: portalNoop,
    onUpgrade: portalNoop,
    onManageBilling: portalNoop,
    ...value,
  };
  return (
    <PortalContext.Provider value={merged}>{children}</PortalContext.Provider>
  );
}

export type PortalProviderProps = {
  children: ReactNode;
  /** Skip login redirect (Storybook/Chromatic — avoid destroying the capture iframe). */
  disableAuthRedirect?: boolean;
};

export function PortalProvider({
  children,
  disableAuthRedirect = false,
}: PortalProviderProps) {
  const auth = useAuth();
  const [items, setItems] = useState<Submission[]>([]);
  const [clientName, setClientName] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [listError, setListError] = useState<string | null>(null);
  const [listBusy, setListBusy] = useState(false);
  const [crmBusy, setCrmBusy] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [filters, setFilters] = useState<LeadInboxFiltersValue>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<LeadInboxFiltersValue>(emptyFilters);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamRole, setTeamRole] = useState<TeamRole>("member");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<ClientRole[]>([]);
  const [mailbox, setMailbox] = useState<MailboxStatusResponse | null>(null);
  const [mailboxBusy, setMailboxBusy] = useState(false);
  const [mailboxError, setMailboxError] = useState<string | null>(null);
  const [mailboxNotice, setMailboxNotice] = useState<string | null>(null);
  const [leadMessages, setLeadMessages] = useState<LeadMessage[]>([]);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get("billing");
    const mailboxParam = params.get("mailbox");
    const mailboxMessage = params.get("message");

    if (billing === "success") {
      setBillingNotice(
        "Billing updated. Plan status refreshes after Stripe confirms payment.",
      );
    } else if (billing === "cancel") {
      setBillingNotice("Checkout canceled. Your plan was not changed.");
    }

    if (mailboxParam === "connected") {
      setMailboxNotice("Mailbox connected successfully.");
    } else if (mailboxParam === "error") {
      setMailboxError(
        mailboxMessage || "Mailbox connection failed. Try again.",
      );
    }

    if (billing || mailboxParam) {
      params.delete("billing");
      params.delete("mailbox");
      params.delete("message");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }
  }, []);

  useEffect(() => {
    if (auth.status === "signedOut") {
      const invite = new URLSearchParams(window.location.search).get("invite");
      if (invite) {
        sessionStorage.setItem("portalInviteToken", invite);
      }
      if (!disableAuthRedirect) {
        const path = window.location.pathname.replace(/\/$/, "") || "/";
        if (path !== PORTAL_PATHS.login.replace(/\/$/, "")) {
          redirect(PORTAL_PATHS.login);
        }
      }
      return;
    }
    if (auth.status !== "signedIn") {
      setItems([]);
      setClientName(null);
      setAccount(null);
      setNextCursor(undefined);
      setListError(null);
      setBillingError(null);
      setSelectedId(null);
      setMembers([]);
      setPermissions([]);
      setRoles([]);
      setReady(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setListBusy(true);
      setListError(null);
      setReady(false);
      try {
        const params = new URLSearchParams(window.location.search);
        const inviteToken =
          params.get("invite") ||
          sessionStorage.getItem("portalInviteToken");
        if (inviteToken) {
          sessionStorage.removeItem("portalInviteToken");
          try {
            const accepted = await acceptTeamInvite(inviteToken);
            if (!cancelled && accepted.success) {
              sessionStorage.setItem(
                "portalTeamNotice",
                accepted.clientName
                  ? `Joined ${accepted.clientName}.`
                  : "Invite accepted.",
              );
            }
          } catch (err) {
            if (!cancelled) {
              sessionStorage.setItem(
                "portalTeamNotice",
                err instanceof ApiError
                  ? err.message
                  : "Could not accept invite",
              );
            }
          } finally {
            params.delete("invite");
            const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
            window.history.replaceState({}, "", next);
          }
        }

        const acct = await getAccount();
        if (cancelled) return;
        setAccount(acct);
        setClientName(acct.clientName || null);
        if (acct.role) setTeamRole(acct.role);
        if (!acct.linked) {
          setItems([]);
          setClientName(null);
          setNextCursor(undefined);
          setMembers([]);
          setPermissions([]);
          setRoles([]);
          setMailbox({ connected: false });
          return;
        }

        setClientName(acct.clientName || null);
        if (acct.role) setTeamRole(acct.role);

        try {
          const team = await getTeam();
          if (cancelled) return;
          setMembers(team.members);
          setTeamRole(team.role);
          setPermissions(team.permissions ?? []);
          setRoles(team.roles ?? []);
        } catch {
          if (!cancelled) {
            setMembers([]);
            setPermissions([]);
            setRoles([]);
          }
        }

        try {
          const box = await getMailbox();
          if (cancelled) return;
          setMailbox(box);
        } catch {
          if (!cancelled) setMailbox({ connected: false });
        }

        try {
          const subs = await listSubmissions({
            limit: 50,
            ...(appliedFilters.status
              ? { status: appliedFilters.status }
              : {}),
            ...(appliedFilters.tag ? { tag: appliedFilters.tag } : {}),
            ...(appliedFilters.assignedTo
              ? { assignedTo: appliedFilters.assignedTo }
              : {}),
            ...(appliedFilters.q.trim() ? { q: appliedFilters.q.trim() } : {}),
          });
          if (cancelled) return;
          setItems(subs.items);
          setNextCursor(subs.nextCursor);
          setSelectedId(subs.items[0]?.submissionId ?? null);

          // Older threads may lack stored messageCount; hydrate so stacks show
          // before a lead is opened. Safe no-op when the list API already
          // returns live counts.
          const counts = await fetchMessageCounts(subs.items);
          if (!cancelled) {
            setItems((prev) => mergeMessageCounts(prev, counts));
          }
        } catch (err) {
          if (cancelled) return;
          if (err instanceof ApiError && err.status === 403) {
            setItems([]);
            setListError(null);
          } else {
            setListError(
              err instanceof ApiError
                ? err.message
                : "Failed to load submissions",
            );
          }
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError ? err.message : "Failed to load account";
        setListError(message);
      } finally {
        if (!cancelled) {
          setListBusy(false);
          setReady(true);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.status, appliedFilters, disableAuthRedirect]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    setListBusy(true);
    setListError(null);
    try {
      const data = await listSubmissions({
        limit: 50,
        cursor: nextCursor,
        ...(appliedFilters.status ? { status: appliedFilters.status } : {}),
        ...(appliedFilters.tag ? { tag: appliedFilters.tag } : {}),
        ...(appliedFilters.assignedTo
          ? { assignedTo: appliedFilters.assignedTo }
          : {}),
        ...(appliedFilters.q.trim() ? { q: appliedFilters.q.trim() } : {}),
      });
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
      const counts = await fetchMessageCounts(data.items);
      setItems((prev) => mergeMessageCounts(prev, counts));
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : "Failed to load more");
    } finally {
      setListBusy(false);
    }
  }, [nextCursor, appliedFilters]);

  const replaceItem = useCallback((updated: Submission) => {
    setItems((prev) =>
      prev.map((item) =>
        item.submissionId === updated.submissionId ? updated : item,
      ),
    );
  }, []);

  const onLeadUpdate = useCallback(
    async (patch: {
      status?: LeadStatus;
      tags?: LeadTag[];
      assignedTo?: string | null;
    }) => {
      if (!selectedId) return;
      setCrmBusy(true);
      setListError(null);
      try {
        const updated = await updateSubmission(selectedId, patch);
        replaceItem(updated);
      } catch (err) {
        setListError(
          err instanceof ApiError ? err.message : "Failed to update lead",
        );
      } finally {
        setCrmBusy(false);
      }
    },
    [selectedId, replaceItem],
  );

  const onLeadNote = useCallback(
    async (body: string) => {
      if (!selectedId) return;
      setCrmBusy(true);
      setListError(null);
      try {
        const updated = await addSubmissionNote(selectedId, body);
        replaceItem(updated);
      } catch (err) {
        setListError(
          err instanceof ApiError ? err.message : "Failed to add note",
        );
      } finally {
        setCrmBusy(false);
      }
    },
    [selectedId, replaceItem],
  );

  useEffect(() => {
    if (!selectedId || !account?.linked) {
      setLeadMessages([]);
      setMessageError(null);
      return;
    }
    let cancelled = false;
    async function loadMessages() {
      setMessageError(null);
      try {
        const res = await listLeadMessages(selectedId!);
        if (!cancelled) {
          setLeadMessages(res.items);
          setItems((prev) =>
            prev.map((item) =>
              item.submissionId === selectedId
                ? { ...item, messageCount: res.items.length }
                : item,
            ),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setLeadMessages([]);
          setMessageError(
            err instanceof ApiError
              ? err.message
              : "Failed to load messages",
          );
        }
      }
    }
    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [selectedId, account?.linked]);

  const onSendLeadMessage = useCallback(
    async (
      body: string,
      bodyHtml?: string,
      from?: { fromIdentityId?: string },
    ) => {
      if (!selectedId) return;
      setCrmBusy(true);
      setMessageError(null);
      try {
        const message = await sendLeadMessage(selectedId, {
          body,
          ...(bodyHtml ? { bodyHtml } : {}),
          ...(from?.fromIdentityId
            ? { fromIdentityId: from.fromIdentityId }
            : {}),
        });
        setLeadMessages((prev) => [...prev, message]);
        setItems((items) =>
          items.map((item) =>
            item.submissionId === selectedId
              ? { ...item, messageCount: (item.messageCount ?? 0) + 1 }
              : item,
          ),
        );
      } catch (err) {
        setMessageError(
          err instanceof ApiError ? err.message : "Failed to send reply",
        );
      } finally {
        setCrmBusy(false);
      }
    },
    [selectedId],
  );

  const onMailboxConnect = useCallback(async (provider: MailboxProvider) => {
    setMailboxBusy(true);
    setMailboxError(null);
    setMailboxNotice(null);
    try {
      const { authUrl } = await connectMailbox(provider);
      window.location.assign(authUrl);
    } catch (err) {
      setMailboxError(
        err instanceof ApiError
          ? err.message
          : "Failed to start mailbox connect",
      );
      setMailboxBusy(false);
    }
  }, []);

  const onMailboxDisconnect = useCallback(async () => {
    setMailboxBusy(true);
    setMailboxError(null);
    setMailboxNotice(null);
    try {
      await disconnectMailbox();
      setMailbox({ connected: false });
      setMailboxNotice("Mailbox disconnected.");
    } catch (err) {
      setMailboxError(
        err instanceof ApiError
          ? err.message
          : "Failed to disconnect mailbox",
      );
    } finally {
      setMailboxBusy(false);
    }
  }, []);

  const onMailboxSync = useCallback(async () => {
    setMailboxBusy(true);
    setMailboxError(null);
    setMailboxNotice(null);
    try {
      const result = await syncMailbox();
      const box = await getMailbox();
      setMailbox(box);
      setMailboxNotice(
        result.imported > 0
          ? `Synced ${result.imported} new message${result.imported === 1 ? "" : "s"}.`
          : "Sync complete. No new replies.",
      );
    } catch (err) {
      setMailboxError(
        err instanceof ApiError ? err.message : "Failed to sync mailbox",
      );
    } finally {
      setMailboxBusy(false);
    }
  }, []);

  const onMailboxPatch = useCallback(async (input: PatchMailboxInput) => {
    setMailboxBusy(true);
    setMailboxError(null);
    setMailboxNotice(null);
    try {
      const box = await updateMailboxSettings(input);
      setMailbox((prev) => ({
        ...(prev ?? { connected: false }),
        ...box,
      }));
      setMailboxNotice("Sending Preferences updated.");
    } catch (err) {
      setMailboxError(
        err instanceof ApiError
          ? err.message
          : "Failed to update outbound identity settings",
      );
    } finally {
      setMailboxBusy(false);
    }
  }, []);

  const onProvisionAccount = useCallback(async () => {
    const name = businessName.trim();
    if (!name) {
      setBillingError("Enter a business name");
      return;
    }
    setBillingBusy(true);
    setBillingError(null);
    try {
      const result = await provisionAccount(name);
      if (result.apiKey) {
        sessionStorage.setItem(PORTAL_ISSUED_API_KEY_STORAGE, result.apiKey);
        setBillingNotice(
          "Account created. Open Settings → Developers → API Keys to copy your new key (shown once).",
        );
      }
      setAccount({
        linked: true,
        email: result.email,
        clientId: result.clientId,
        clientName: result.clientName,
        role: result.role ?? "owner",
        tier: result.tier,
        active: result.active,
        hasBilling: result.hasBilling,
        hasApiKey: Boolean(result.apiKey) || result.hasApiKey,
        emailsUsed: result.emailsUsed,
        emailLimit: result.emailLimit,
        usageMonth: result.usageMonth,
        memberLimit: result.memberLimit ?? 1,
        memberCount: result.memberCount ?? 1,
      });
      setTeamRole(result.role ?? "owner");
      setClientName(result.clientName || name);
      setBusinessName("");
    } catch (err) {
      setBillingError(
        err instanceof ApiError ? err.message : "Could not create Form API account",
      );
    } finally {
      setBillingBusy(false);
    }
  }, [businessName]);

  const onUpgrade = useCallback(async (plan: "basic" | "premium") => {
    setBillingBusy(true);
    setBillingError(null);
    try {
      const url = await startCheckout(plan);
      window.location.href = url;
    } catch (err) {
      setBillingError(err instanceof ApiError ? err.message : "Checkout failed");
      setBillingBusy(false);
    }
  }, []);

  const onManageBilling = useCallback(async () => {
    setBillingBusy(true);
    setBillingError(null);
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch (err) {
      setBillingError(
        err instanceof ApiError ? err.message : "Could not open billing portal",
      );
      setBillingBusy(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const selected = items.find((s) => s.submissionId === selectedId) ?? null;
  const isOwner = teamRole === "owner";
  const checkPermission = useCallback(
    (permission: Permission) =>
      isOwner || permissionsInclude(permissions, permission),
    [isOwner, permissions],
  );

  const value = useMemo<PortalContextValue>(
    () => ({
      ready,
      items,
      clientName,
      account,
      nextCursor,
      listError,
      listBusy,
      crmBusy,
      billingBusy,
      billingError,
      billingNotice,
      businessName,
      setBusinessName,
      selectedId,
      setSelectedId,
      selected,
      filters,
      setFilters,
      applyFilters,
      members,
      teamRole,
      permissions,
      roles,
      isOwner,
      hasPermission: checkPermission,
      mailbox,
      mailboxBusy,
      mailboxError,
      mailboxNotice,
      leadMessages,
      messageError,
      loadMore,
      onLeadUpdate,
      onLeadNote,
      onSendLeadMessage,
      onMailboxConnect,
      onMailboxDisconnect,
      onMailboxSync,
      onMailboxPatch,
      onProvisionAccount,
      onUpgrade,
      onManageBilling,
    }),
    [
      ready,
      items,
      clientName,
      account,
      nextCursor,
      listError,
      listBusy,
      crmBusy,
      billingBusy,
      billingError,
      billingNotice,
      businessName,
      selectedId,
      selected,
      filters,
      applyFilters,
      members,
      teamRole,
      permissions,
      roles,
      isOwner,
      checkPermission,
      mailbox,
      mailboxBusy,
      mailboxError,
      mailboxNotice,
      leadMessages,
      messageError,
      loadMore,
      onLeadUpdate,
      onLeadNote,
      onSendLeadMessage,
      onMailboxConnect,
      onMailboxDisconnect,
      onMailboxSync,
      onMailboxPatch,
      onProvisionAccount,
      onUpgrade,
      onManageBilling,
    ],
  );

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}
