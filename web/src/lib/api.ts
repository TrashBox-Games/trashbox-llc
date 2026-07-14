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

  // Prefer ID token (has email). Reject if Amplify somehow only has access token claims.
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

export async function listSubmissions(options?: {
  limit?: number
  cursor?: string
}): Promise<SubmissionsListResponse> {
  if (!apiUrl) throw new ApiError(500, 'VITE_API_URL is not configured')

  const params = new URLSearchParams()
  if (options?.limit) params.set('limit', String(options.limit))
  if (options?.cursor) params.set('cursor', options.cursor)
  const qs = params.toString()

  const token = await idToken()
  const res = await fetch(`${apiUrl}/submissions${qs ? `?${qs}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  const data = (await res.json().catch(() => ({}))) as Partial<SubmissionsListResponse> & {
    message?: string
  }

  if (!res.ok) {
    throw new ApiError(res.status, data.message || `Request failed (${res.status})`)
  }

  return data as SubmissionsListResponse
}
