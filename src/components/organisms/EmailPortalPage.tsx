"use client";

import { type FormEvent, useEffect, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { EmailPlanTiers } from "@/components/organisms/EmailPlanTiers";
import {
  ApiError,
  createApiKey,
  deleteApiKey,
  getAccount,
  listSubmissions,
  openBillingPortal,
  provisionAccount,
  startCheckout,
  type AccountResponse,
  type Submission,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

type AuthMode = 'signIn' | 'signUp' | 'confirm'

const inputClass =
  'w-full border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 focus:outline-none'
const labelClass = 'mb-2 block font-label text-[10px] uppercase tracking-widest text-outline'
const btnClass =
  'w-full bg-primary px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80 disabled:opacity-40'

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function EmailPortalPage() {
  const auth = useAuth()
  const [mode, setMode] = useState<AuthMode>('signIn')
  const [showAuth, setShowAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authBusy, setAuthBusy] = useState(false)

  const [items, setItems] = useState<Submission[]>([])
  const [clientName, setClientName] = useState<string | null>(null)
  const [account, setAccount] = useState<AccountResponse | null>(null)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [listError, setListError] = useState<string | null>(null)
  const [listBusy, setListBusy] = useState(false)
  const [billingBusy, setBillingBusy] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [billingNotice, setBillingNotice] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [issuedApiKey, setIssuedApiKey] = useState<string | null>(null)
  const [apiKeyBusy, setApiKeyBusy] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const billing = params.get('billing')
    if (billing === 'success') {
      setBillingNotice('Billing updated. Plan status refreshes after Stripe confirms payment.')
    } else if (billing === 'cancel') {
      setBillingNotice('Checkout canceled. Your plan was not changed.')
    }
    if (billing) {
      params.delete('billing')
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`
      window.history.replaceState({}, '', next)
    }
  }, [])

  useEffect(() => {
    if (auth.status !== 'signedIn') {
      setItems([])
      setClientName(null)
      setAccount(null)
      setNextCursor(undefined)
      setListError(null)
      setBillingError(null)
      setApiKeyError(null)
      setIssuedApiKey(null)
      setSelectedId(null)
      return
    }

    let cancelled = false
    async function load() {
      setListBusy(true)
      setListError(null)
      try {
        const acct = await getAccount()
        if (cancelled) return
        setAccount(acct)

        if (!acct.linked) {
          setItems([])
          setClientName(null)
          setNextCursor(undefined)
          return
        }

        setClientName(acct.clientName || null)
        try {
          const subs = await listSubmissions({ limit: 50 })
          if (cancelled) return
          setItems(subs.items)
          setNextCursor(subs.nextCursor)
          setSelectedId(subs.items[0]?.submissionId ?? null)
        } catch (err) {
          if (cancelled) return
          // Inactive / unpaid accounts may not list submissions yet.
          if (err instanceof ApiError && err.status === 403) {
            setItems([])
            setListError(null)
          } else {
            setListError(err instanceof ApiError ? err.message : 'Failed to load submissions')
          }
        }
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiError ? err.message : 'Failed to load account'
        setListError(message)
      } finally {
        if (!cancelled) setListBusy(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [auth.status])

  async function onAuthSubmit(e: FormEvent) {
    e.preventDefault()
    setAuthError(null)

    if (mode === 'signUp' && password !== confirmPassword) {
      setAuthError('Passwords do not match')
      return
    }

    setAuthBusy(true)
    try {
      if (mode === 'signIn') {
        await auth.signInWithPassword(email, password)
      } else if (mode === 'signUp') {
        const next = await auth.signUpWithPassword(email, password)
        if (next === 'confirm') setMode('confirm')
      } else {
        await auth.confirmSignUpCode(email, code)
        await auth.signInWithPassword(email, password)
        setMode('signIn')
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setAuthBusy(false)
    }
  }

  async function loadMore() {
    if (!nextCursor) return
    setListBusy(true)
    setListError(null)
    try {
      const data = await listSubmissions({ limit: 50, cursor: nextCursor })
      setItems((prev) => [...prev, ...data.items])
      setNextCursor(data.nextCursor)
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Failed to load more')
    } finally {
      setListBusy(false)
    }
  }

  async function onProvisionAccount() {
    const name = businessName.trim()
    if (!name) {
      setBillingError('Enter a business name')
      return
    }
    setBillingBusy(true)
    setBillingError(null)
    try {
      const result = await provisionAccount(name)
      if (result.apiKey) setIssuedApiKey(result.apiKey)
      setAccount({
        linked: true,
        email: result.email,
        clientId: result.clientId,
        clientName: result.clientName,
        tier: result.tier,
        active: result.active,
        hasBilling: result.hasBilling,
        hasApiKey: Boolean(result.apiKey) || result.hasApiKey,
        emailsUsed: result.emailsUsed,
        emailLimit: result.emailLimit,
        usageMonth: result.usageMonth,
      })
      setClientName(result.clientName || name)
      setBusinessName('')
    } catch (err) {
      setBillingError(
        err instanceof ApiError ? err.message : 'Could not create Email Service',
      )
    } finally {
      setBillingBusy(false)
    }
  }

  async function onCreateApiKey() {
    setApiKeyBusy(true)
    setApiKeyError(null)
    try {
      const result = await createApiKey()
      if (result.apiKey) setIssuedApiKey(result.apiKey)
      setAccount((prev) => (prev ? { ...prev, hasApiKey: true } : prev))
    } catch (err) {
      setApiKeyError(
        err instanceof ApiError ? err.message : 'Could not create API key',
      )
    } finally {
      setApiKeyBusy(false)
    }
  }

  async function onDeleteApiKey() {
    if (
      !window.confirm(
        'Delete your API key? Form submissions using it will stop working until you create a new key.',
      )
    ) {
      return
    }
    setApiKeyBusy(true)
    setApiKeyError(null)
    try {
      await deleteApiKey()
      setIssuedApiKey(null)
      setAccount((prev) => (prev ? { ...prev, hasApiKey: false } : prev))
    } catch (err) {
      setApiKeyError(
        err instanceof ApiError ? err.message : 'Could not delete API key',
      )
    } finally {
      setApiKeyBusy(false)
    }
  }

  async function onUpgrade(plan: 'basic' | 'premium') {
    setBillingBusy(true)
    setBillingError(null)
    try {
      const url = await startCheckout(plan)
      window.location.href = url
    } catch (err) {
      setBillingError(err instanceof ApiError ? err.message : 'Checkout failed')
      setBillingBusy(false)
    }
  }

  async function onManageBilling() {
    setBillingBusy(true)
    setBillingError(null)
    try {
      const url = await openBillingPortal()
      window.location.href = url
    } catch (err) {
      setBillingError(
        err instanceof ApiError ? err.message : 'Could not open billing portal',
      )
      setBillingBusy(false)
    }
  }

  const selected = items.find((s) => s.submissionId === selectedId) ?? null

  return (
    <div className="mx-auto max-w-screen-2xl px-8 pt-32 pb-24">
        <header className="mb-16">
          <FadeIn>
            <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
              Email Service
            </p>
            <h1 className="max-w-4xl font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
              Notifications <span className="text-outline">Inbox.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
              Form notifications for your business sites. Compare plans below, then sign in to manage
              your inbox and billing.
            </p>
          </FadeIn>
        </header>

        {!auth.configured && (
          <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
            Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and
            `NEXT_PUBLIC_COGNITO_CLIENT_ID` then rebuild.
          </p>
        )}

        {auth.configured && auth.status === 'loading' && (
          <p className="font-label text-xs uppercase tracking-widest text-outline">Loading session…</p>
        )}

        {auth.configured && auth.status === 'signedOut' && (
          <div>
            <EmailPlanTiers className="mt-4" />

            <div className="mx-auto mt-14 flex max-w-xl flex-col items-center gap-4">
              {!showAuth ? (
                <>
                  <button
                    type="button"
                    className="bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
                    onClick={() => {
                      setMode('signIn')
                      setShowAuth(true)
                      setAuthError(null)
                    }}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    className="font-label text-[10px] uppercase tracking-widest text-outline transition-colors hover:text-white"
                    onClick={() => {
                      setMode('signUp')
                      setShowAuth(true)
                      setAuthError(null)
                    }}
                  >
                    New here? Create an account
                  </button>
                </>
              ) : (
                <div className="flex w-full items-center justify-between gap-4">
                  <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                    Account access
                  </p>
                  <button
                    type="button"
                    className="font-label text-[10px] uppercase tracking-widest text-outline hover:text-white"
                    onClick={() => {
                      setShowAuth(false)
                      setAuthError(null)
                    }}
                  >
                    Hide
                  </button>
                </div>
              )}
            </div>

            {showAuth && (
              <FadeIn className="mx-auto mt-10 max-w-xl space-y-10" y={12}>
              <form
                className="space-y-10"
                onSubmit={onAuthSubmit}
              >
                <div className="flex gap-6">
                  {(
                    [
                      ['signIn', 'Sign in'],
                      ['signUp', 'Sign up'],
                      ['confirm', 'Confirm'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={[
                        'font-label text-[10px] uppercase tracking-widest transition-colors',
                        mode === id ? 'text-white' : 'text-outline hover:text-white',
                      ].join(' ')}
                      onClick={() => {
                        setMode(id)
                        setAuthError(null)
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className={labelClass} htmlFor="portal-email">
                    Email
                  </label>
                  <input
                    id="portal-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="owner@business.com"
                  />
                </div>

                {mode !== 'confirm' && (
                  <div>
                    <label className={labelClass} htmlFor="portal-password">
                      Password
                    </label>
                    <input
                      id="portal-password"
                      type="password"
                      autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {mode === 'signUp' && (
                  <div>
                    <label className={labelClass} htmlFor="portal-confirm-password">
                      Confirm password
                    </label>
                    <input
                      id="portal-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {mode === 'confirm' && (
                  <div>
                    <label className={labelClass} htmlFor="portal-code">
                      Verification code
                    </label>
                    <input
                      id="portal-code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={inputClass}
                      placeholder="123456"
                    />
                    <button
                      type="button"
                      className="mt-4 font-label text-[10px] uppercase tracking-widest text-outline hover:text-white"
                      onClick={async () => {
                        setAuthError(null)
                        try {
                          await auth.resendCode(email)
                        } catch (err) {
                          setAuthError(
                            err instanceof Error ? err.message : 'Could not resend code',
                          )
                        }
                      }}
                    >
                      Resend code
                    </button>
                  </div>
                )}

                {authError && <p className="text-sm text-red-300">{authError}</p>}

                <button type="submit" className={btnClass} disabled={authBusy}>
                  {authBusy
                    ? 'Working…'
                    : mode === 'signIn'
                      ? 'Sign in'
                      : mode === 'signUp'
                        ? 'Create account'
                        : 'Confirm & sign in'}
                </button>
              </form>
              </FadeIn>
            )}
          </div>
        )}

        {auth.configured && auth.status === 'signedIn' && (
          <div className="space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/10 pb-6">
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-outline">Signed in</p>
                <p className="mt-1 text-white">{auth.email}</p>
                {clientName && (
                  <p className="mt-1 text-sm text-on-surface-variant">Client: {clientName}</p>
                )}
                {account?.linked && account.tier && (
                  <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-outline">
                    Plan: <span className="text-white">{account.tier}</span>
                    {!account.active ? ' · inactive' : ''}
                    {typeof account.emailsUsed === 'number' &&
                      typeof account.emailLimit === 'number' && (
                        <>
                          {' '}
                          · Usage:{' '}
                          <span className="text-white">
                            {account.emailsUsed.toLocaleString()} /{' '}
                            {account.emailLimit.toLocaleString()}
                          </span>{' '}
                          emails
                        </>
                      )}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white"
                onClick={() => void auth.signOutUser()}
              >
                Sign out
              </button>
            </div>

            {billingNotice && (
              <p className="border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                {billingNotice}
              </p>
            )}

            {issuedApiKey && (
              <section className="border border-amber-400/30 bg-surface-container-low p-6">
                <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                  Your API key (shown once)
                </p>
                <p className="mt-3 break-all font-mono text-sm text-white">{issuedApiKey}</p>
                <p className="mt-3 text-sm text-on-surface-variant">
                  Save this key for your website forms. It cannot be retrieved again.
                </p>
                <button
                  type="button"
                  className="mt-4 font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white"
                  onClick={() => {
                    void navigator.clipboard.writeText(issuedApiKey)
                  }}
                >
                  Copy key
                </button>
              </section>
            )}

            {account && !account.linked && (
              <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
                <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                  Get started
                </p>
                <h2 className="mt-3 font-headline text-2xl font-bold text-white md:text-3xl">
                  Create Email Service
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                  No Form API account is linked to {account.email || 'your login'} yet. Create one
                  now (no payment required). You can add a paid plan anytime after.
                </p>
                <div className="mt-8 max-w-md">
                  <label className={labelClass} htmlFor="business-name">
                    Business name
                  </label>
                  <input
                    id="business-name"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={inputClass}
                    placeholder="Acme Inspections"
                  />
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
                    disabled={billingBusy || !businessName.trim()}
                    onClick={() => void onProvisionAccount()}
                  >
                    {billingBusy ? 'Creating…' : 'Create account'}
                  </button>
                </div>
                {billingError && <p className="mt-4 text-sm text-red-300">{billingError}</p>}
              </section>
            )}

            {account?.linked && (
              <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
                <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                  Subscription
                </p>
                <h2 className="mt-3 font-headline text-2xl font-bold text-white md:text-3xl">
                  {account.hasBilling
                    ? account.tier === 'premium'
                      ? 'Premium'
                      : 'Basic'
                    : 'No paid plan yet'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                  {account.hasBilling
                    ? account.tier === 'premium'
                      ? 'Premium includes owner notifications plus confirmation emails to form submitters.'
                      : 'Basic sends notification emails to you only. Upgrade to Premium for submitter confirmations.'
                    : 'Your Form API account is ready. Add a Stripe plan when you want paid Basic or Premium billing.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {!account.hasBilling && (
                    <>
                      <button
                        type="button"
                        className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
                        disabled={billingBusy}
                        onClick={() => void onUpgrade('premium')}
                      >
                        {billingBusy ? 'Redirecting…' : 'Add Premium plan'}
                      </button>
                      <button
                        type="button"
                        className="border border-outline-variant/30 px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-white hover:border-white disabled:opacity-40"
                        disabled={billingBusy}
                        onClick={() => void onUpgrade('basic')}
                      >
                        {billingBusy ? 'Redirecting…' : 'Add Basic plan'}
                      </button>
                    </>
                  )}
                  {account.hasBilling && account.tier !== 'premium' && (
                    <button
                      type="button"
                      className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
                      disabled={billingBusy}
                      onClick={() => void onUpgrade('premium')}
                    >
                      {billingBusy ? 'Redirecting…' : 'Upgrade to Premium'}
                    </button>
                  )}
                  {account.hasBilling && (
                    <button
                      type="button"
                      className="border border-outline-variant/30 px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-white hover:border-white disabled:opacity-40"
                      disabled={billingBusy}
                      onClick={() => void onManageBilling()}
                    >
                      {billingBusy ? 'Redirecting…' : 'Manage subscription'}
                    </button>
                  )}
                </div>
                {billingError && <p className="mt-4 text-sm text-red-300">{billingError}</p>}
              </section>
            )}

            {account?.linked && (
              <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
                <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                  API key
                </p>
                <h2 className="mt-3 font-headline text-2xl font-bold text-white md:text-3xl">
                  {account.hasApiKey ? 'Key active' : 'No key issued'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                  {account.hasApiKey
                    ? 'Use your Form API key in website forms (X-Api-Key). Rotating replaces the current key immediately. The raw key is only shown once.'
                    : 'Create a key to accept form submissions from your sites. The raw key is only shown once.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
                    disabled={apiKeyBusy}
                    onClick={() => void onCreateApiKey()}
                  >
                    {apiKeyBusy
                      ? 'Working…'
                      : account.hasApiKey
                        ? 'Rotate key'
                        : 'Create key'}
                  </button>
                  {account.hasApiKey && (
                    <button
                      type="button"
                      className="border border-outline-variant/30 px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-white hover:border-white disabled:opacity-40"
                      disabled={apiKeyBusy}
                      onClick={() => void onDeleteApiKey()}
                    >
                      {apiKeyBusy ? 'Working…' : 'Delete key'}
                    </button>
                  )}
                </div>
                {apiKeyError && <p className="mt-4 text-sm text-red-300">{apiKeyError}</p>}
              </section>
            )}

            {listError &&
              listError !== 'No Form API account for this email' && (
              <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
                {listError}
              </p>
            )}

            {listBusy && items.length === 0 && account?.linked && (
              <p className="font-label text-xs uppercase tracking-widest text-outline">Loading…</p>
            )}

            {!listBusy && !listError && items.length === 0 && account?.linked && (
              <p className="text-on-surface-variant">No submissions yet.</p>
            )}

            {items.length > 0 && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <ul className="space-y-2 lg:col-span-5">
                  {items.map((item) => {
                    const active = item.submissionId === selectedId
                    return (
                      <li key={item.submissionId}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.submissionId)}
                          className={[
                            'w-full border-l-2 px-5 py-4 text-left transition-colors',
                            active
                              ? 'border-white bg-surface-container-high'
                              : 'border-transparent bg-surface-container-low hover:bg-surface-container-high',
                          ].join(' ')}
                        >
                          <p className="font-headline text-sm font-bold text-white">{item.senderName}</p>
                          <p className="mt-1 text-xs text-outline">{item.senderEmail}</p>
                          <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                            {item.message}
                          </p>
                          <p className="mt-3 font-label text-[10px] uppercase tracking-widest text-outline">
                            {formatWhen(item.submittedAt)}
                          </p>
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div className="bg-surface-container-low p-8 lg:col-span-7">
                  {selected ? (
                    <>
                      <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                        Message
                      </p>
                      <h2 className="mt-3 font-headline text-3xl font-bold text-white">
                        {selected.senderName}
                      </h2>
                      <p className="mt-2 text-sm text-outline">{selected.senderEmail}</p>
                      <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-outline">
                        {formatWhen(selected.submittedAt)}
                      </p>
                      <p className="mt-8 whitespace-pre-wrap text-lg leading-relaxed text-on-surface-variant">
                        {selected.message}
                      </p>
                      {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                        <dl className="mt-10 space-y-2 border-t border-outline-variant/10 pt-6">
                          {Object.entries(selected.metadata).map(([key, value]) => (
                            <div key={key} className="flex gap-4 text-sm">
                              <dt className="font-label uppercase tracking-widest text-outline">{key}</dt>
                              <dd className="text-white">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </>
                  ) : (
                    <p className="text-on-surface-variant">Select a submission.</p>
                  )}
                </div>
              </div>
            )}

            {nextCursor && (
              <button
                type="button"
                className={btnClass + ' max-w-xs'}
                disabled={listBusy}
                onClick={() => void loadMore()}
              >
                {listBusy ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        )}
    </div>
  );
}
