"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  createApiKey,
  deleteApiKey,
  getAccount,
  getTeam,
  hasPermission,
  type AccountResponse,
} from "@/lib/api";
import { PORTAL_ISSUED_API_KEY_STORAGE } from "@/lib/portal";

export type ApiKeysSettingsInitialState = {
  account: AccountResponse;
  canManage: boolean;
  issuedApiKey?: string | null;
};

export type ApiKeysSettingsProps = {
  /** When set, skip network load (Storybook/Chromatic demos). */
  initialState?: ApiKeysSettingsInitialState;
};

export function ApiKeysSettings({ initialState }: ApiKeysSettingsProps) {
  const [account, setAccount] = useState<AccountResponse | null>(
    initialState?.account ?? null,
  );
  const [canManage, setCanManage] = useState(initialState?.canManage ?? false);
  const [issuedApiKey, setIssuedApiKey] = useState<string | null>(
    initialState?.issuedApiKey ?? null,
  );
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(Boolean(initialState));
  const [error, setError] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    const [acct, team] = await Promise.all([getAccount(), getTeam()]);
    setAccount(acct);
    setCanManage(
      team.role === "owner" ||
        hasPermission(team.permissions, "manage_api_keys"),
    );
  }, []);

  useEffect(() => {
    if (initialState) return;

    const stored = sessionStorage.getItem(PORTAL_ISSUED_API_KEY_STORAGE);
    if (stored) {
      sessionStorage.removeItem(PORTAL_ISSUED_API_KEY_STORAGE);
      setIssuedApiKey(stored);
    }

    let cancelled = false;
    async function load() {
      setReady(false);
      setError(null);
      try {
        await loadAccount();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load account",
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loadAccount, initialState]);

  async function onCreateApiKey() {
    setBusy(true);
    setError(null);
    try {
      const result = await createApiKey();
      if (result.apiKey) setIssuedApiKey(result.apiKey);
      setAccount((prev) => (prev ? { ...prev, hasApiKey: true } : prev));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create API key",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteApiKey() {
    if (
      !window.confirm(
        "Delete your API key? Form submissions using it will stop working until you create a new key.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteApiKey();
      setIssuedApiKey(null);
      setAccount((prev) => (prev ? { ...prev, hasApiKey: false } : prev));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not delete API key",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <PortalSkeleton variant="settings" />;
  }

  if (error && !account) {
    return (
      <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
        {error}
      </p>
    );
  }

  if (!canManage) {
    return (
      <p className="text-on-surface-variant">
        You need Manage API Keys permission to manage API keys.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {issuedApiKey && (
        <section className="border border-amber-400/30 bg-surface-container-low p-6">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Your API key (shown once)
          </p>
          <p className="mt-3 break-all font-mono text-sm text-white">{issuedApiKey}</p>
          <p className="mt-3 text-sm text-on-surface-variant">
            Save this key for your website forms. It cannot be retrieved again.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="mt-4 h-auto px-0 py-0"
            onClick={() => {
              void navigator.clipboard.writeText(issuedApiKey);
            }}
          >
            Copy key
          </Button>
        </section>
      )}

      <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
        <p className="font-label text-[10px] uppercase tracking-widest text-outline">
          API key
        </p>
        <h2 className="mt-3 font-headline text-2xl font-bold text-white md:text-3xl">
          {account?.hasApiKey ? "Key active" : "No key issued"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          {account?.hasApiKey
            ? "Use your Form API key in website forms (X-Api-Key). Rotating replaces the current key immediately. The raw key is only shown once."
            : "Create a key to accept form submissions from your sites. The raw key is only shown once."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={busy}
            onClick={() => void onCreateApiKey()}
          >
            {busy
              ? "Working…"
              : account?.hasApiKey
                ? "Rotate key"
                : "Create key"}
          </Button>
          {account?.hasApiKey && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void onDeleteApiKey()}
            >
              {busy ? "Working…" : "Delete key"}
            </Button>
          )}
        </div>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </section>
    </div>
  );
}
