import { fetchAuthSession } from 'aws-amplify/auth'
import { apiUrl } from './amplify'

export interface Submission {
  clientId: string
  submissionId: string
  senderName: string
  senderEmail: string
  message: string
  metadata?: Record<string, string>
  submittedAt: string
}

export interface SubmissionsListResponse {
  clientId: string
  clientName: string
  items: Submission[]
  nextCursor?: string
}

export interface AccountResponse {
  linked: boolean
  email?: string
  clientId?: string
  clientName?: string
  tier?: 'basic' | 'premium'
  active?: boolean
  hasBilling?: boolean
  emailsUsed?: number
  emailLimit?: number
  usageMonth?: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function idToken(): Promise<string> {
  const session = await fetchAuthSession({ forceRefresh: false })
  const token = session.tokens?.idToken?.toString()
  if (!token) throw new ApiError(401, 'Not signed in')

  const payload = decodeJwtPayload(token)
  if (!payloadHasEmail(payload) && session.tokens?.accessToken) {
    const access = session.tokens.accessToken.toString()
    const accessPayload = decodeJwtPayload(access)
    if (payloadHasEmail(accessPayload)) return access
  }

  return token
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const part = token.split('.')[1]
    if (!part) return {}
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return {}
  }
}

function payloadHasEmail(payload: Record<string, unknown>): boolean {
  for (const key of ['email', 'cognito:username', 'username', 'preferred_username']) {
    const value = payload[key]
    if (typeof value === 'string' && value.includes('@')) return true
  }
  return false
}

async function authFetch(path: string, init?: RequestInit) {
  if (!apiUrl) throw new ApiError(500, 'VITE_API_URL is not configured')
  const token = await idToken()
  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & {
    message?: string
  }

  if (!res.ok) {
    throw new ApiError(res.status, data.message || `Request failed (${res.status})`)
  }

  return data
}

export async function listSubmissions(options?: {
  limit?: number
  cursor?: string
}): Promise<SubmissionsListResponse> {
  const params = new URLSearchParams()
  if (options?.limit) params.set('limit', String(options.limit))
  if (options?.cursor) params.set('cursor', options.cursor)
  const qs = params.toString()
  return (await authFetch(`/submissions${qs ? `?${qs}` : ''}`)) as unknown as SubmissionsListResponse
}

export async function getAccount(): Promise<AccountResponse> {
  return (await authFetch('/account')) as unknown as AccountResponse
}

export async function provisionAccount(businessName: string): Promise<
  AccountResponse & { apiKey?: string; created?: boolean; message?: string }
> {
  return (await authFetch('/account/provision', {
    method: 'POST',
    body: JSON.stringify({ businessName }),
  })) as unknown as AccountResponse & {
    apiKey?: string
    created?: boolean
    message?: string
  }
}

export async function startCheckout(
  plan: 'basic' | 'premium' = 'premium',
): Promise<string> {
  const data = (await authFetch('/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })) as { url?: string }
  if (!data.url) throw new ApiError(500, 'No checkout URL returned')
  return data.url
}

export async function openBillingPortal(): Promise<string> {
  const data = (await authFetch('/billing/portal', {
    method: 'POST',
    body: '{}',
  })) as { url?: string }
  if (!data.url) throw new ApiError(500, 'No billing portal URL returned')
  return data.url
}
